import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const station = await prisma.station.findUnique({
    where: { id: params.id },
    include: { sources: true, bloodDemands: true, _count: { select: { slots: true } } },
  });
  if (!station) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: station });
}

const UpdateSchema = z.object({
  name:                       z.string().min(3).optional(),
  city:                       z.string().min(2).optional(),
  region:                     z.string().min(2).optional(),
  address:                    z.string().min(5).optional(),
  latitude:                   z.number().nullable().optional(),
  longitude:                  z.number().nullable().optional(),
  phone:                      z.string().nullable().optional(),
  websiteUrl:                 z.string().url().nullable().optional().or(z.literal("")),
  reservationUrl:             z.string().url().nullable().optional().or(z.literal("")),
  openingHours:               z.record(z.any()).nullable().optional(),
  supportsOnlineReservation:  z.boolean().optional(),
  supportedDonationTypes:     z.array(z.string()).optional(),
  status:                     z.enum(["ACTIVE","INACTIVE","TEST"]).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const station = await prisma.station.update({
    where: { id: params.id },
    data: parsed.data as Parameters<typeof prisma.station.update>[0]["data"],
  });
  return NextResponse.json({ data: station });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.station.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
