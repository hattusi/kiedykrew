import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const sourceId = req.nextUrl.searchParams.get("sourceId");
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, parseInt(req.nextUrl.searchParams.get("pageSize") ?? "50"));

  const where = sourceId ? { sourceId } : {};
  const [total, logs] = await Promise.all([
    prisma.log.count({ where }),
    prisma.log.findMany({
      where,
      include: { source: { select: { adapterType: true, station: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    data: logs,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

// Truncate old logs
export async function DELETE() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const { count } = await prisma.log.deleteMany({ where: { createdAt: { lt: cutoff } } });
  return NextResponse.json({ deleted: count });
}
