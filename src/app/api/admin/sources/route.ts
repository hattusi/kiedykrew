import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const stationId = req.nextUrl.searchParams.get("stationId");
  const sources = await prisma.source.findMany({
    where: stationId ? { stationId } : undefined,
    include: { station: { select: { name: true, city: true } }, _count: { select: { logs: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: sources });
}

const CreateSchema = z.object({
  stationId:   z.string(),
  adapterType: z.enum(["MOCK","STATIC","MANUAL","HTML","JSON","BLOOD_DEMAND"]),
  config:      z.record(z.any()).optional(),
  isEnabled:   z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const source = await prisma.source.create({ data: parsed.data as Parameters<typeof prisma.source.create>[0]["data"] });
  return NextResponse.json({ data: source }, { status: 201 });
}
