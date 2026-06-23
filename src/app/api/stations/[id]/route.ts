import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const station = await prisma.station.findUnique({
    where: { id: params.id },
    include: {
      bloodDemands: { orderBy: { bloodType: "asc" } },
      slots: {
        where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        take: 100,
      },
    },
  });

  if (!station) {
    return NextResponse.json({ error: "Nie znaleziono stacji" }, { status: 404 });
  }

  return NextResponse.json({ data: station });
}
