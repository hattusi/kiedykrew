import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const CreateSchema = z.object({
  stationId:   z.string(),
  date:        z.string(), // ISO date
  startTime:   z.string().regex(/^\d{2}:\d{2}$/),
  endTime:     z.string().regex(/^\d{2}:\d{2}$/).optional(),
  available:   z.boolean().default(true),
  donationType: z.enum(["WHOLE_BLOOD","PLASMA","PLATELETS","ERYTHROCYTES"]).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const slot = await prisma.slot.create({
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date),
    } as Parameters<typeof prisma.slot.create>[0]["data"],
  });
  return NextResponse.json({ data: slot }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.slot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
