import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const stations = await prisma.station.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sources: true, slots: true, bloodDemands: true } } },
  });
  return NextResponse.json({ data: stations });
}

const CreateSchema = z.object({
  name:                       z.string().min(3),
  city:                       z.string().min(2),
  region:                     z.string().min(2),
  address:                    z.string().min(5),
  latitude:                   z.number().optional(),
  longitude:                  z.number().optional(),
  phone:                      z.string().optional(),
  websiteUrl:                 z.string().url().optional().or(z.literal("")),
  reservationUrl:             z.string().url().optional().or(z.literal("")),
  openingHours:               z.record(z.any()).optional(),
  supportsOnlineReservation:  z.boolean().default(false),
  supportedDonationTypes:     z.array(z.string()).default([]),
  status:                     z.enum(["ACTIVE","INACTIVE","TEST"]).default("ACTIVE"),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { websiteUrl, reservationUrl, ...rest } = parsed.data;
  const station = await prisma.station.create({
    data: {
      ...rest,
      websiteUrl: websiteUrl || null,
      reservationUrl: reservationUrl || null,
    } as Parameters<typeof prisma.station.create>[0]["data"],
  });
  return NextResponse.json({ data: station }, { status: 201 });
}
