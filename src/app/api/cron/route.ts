import { NextRequest, NextResponse } from "next/server";
import { runAllSources } from "@/lib/runner";

// POST /api/cron - Wyzwala uruchomienie wszystkich adapterow.
// Chroniony naglowkiem Authorization: Bearer <CRON_SECRET>
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth   = req.headers.get("authorization");

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runAllSources();
  return NextResponse.json({ ok: true, result });
}
