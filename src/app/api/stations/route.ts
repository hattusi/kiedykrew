import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { scoreStation, sortByScore } from "@/lib/scoring";
import type { StationWithDemands } from "@/types";
import type { BloodType, DonationType } from "@prisma/client";

const QuerySchema = z.object({
  q:                          z.string().optional(),
  city:                       z.string().optional(),
  region:                     z.string().optional(),
  bloodType:                  z.string().optional(),
  donationType:               z.string().optional(),
  supportsOnlineReservation:  z.coerce.boolean().optional(),
  page:                       z.coerce.number().int().positive().default(1),
  pageSize:                   z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(req: NextRequest) {
  const parsed = QuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { q, city, region, bloodType, donationType, supportsOnlineReservation, page, pageSize } = parsed.data;

  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (city)   where.city   = { contains: city, mode: "insensitive" };
  if (region) where.region = { contains: region, mode: "insensitive" };
  if (supportsOnlineReservation !== undefined) where.supportsOnlineReservation = supportsOnlineReservation;
  if (donationType) where.supportedDonationTypes = { has: donationType as DonationType };
  if (q) {
    where.OR = [
      { name:    { contains: q, mode: "insensitive" } },
      { city:    { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
    ];
  }
  if (bloodType) {
    where.bloodDemands = { some: { bloodType: bloodType as BloodType } };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

  const stations = await prisma.station.findMany({
    where,
    include: {
      bloodDemands: true,
      _count: { select: { slots: { where: { available: true, date: { gte: today } } } } },
      slots: {
        where: { available: true, date: { gte: today, lte: threeDaysLater } },
        take: 10,
      },
    },
    orderBy: { name: "asc" },
  });

  // Score and sort
  const scored = stations.map((s) => ({
    ...s,
    score: scoreStation(s as StationWithDemands & { slots: typeof s.slots }, {
      userBloodType: bloodType as BloodType | undefined,
    }),
    availableSlotCount: s._count.slots,
  }));
  const sorted = sortByScore(scored);

  const total = sorted.length;
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({
    data: paginated,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}
