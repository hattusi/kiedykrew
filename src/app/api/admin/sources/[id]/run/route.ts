import { NextRequest, NextResponse } from "next/server";
import { runSource } from "@/lib/runner";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await runSource(params.id);
    return NextResponse.json({ ok: true, message: "Adapter uruchomiony pomyślnie" });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
