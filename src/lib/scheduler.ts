/**
 * Scheduler – uruchamia adaptery dla wszystkich aktywnych źródeł.
 *
 * W środowisku serverless (Vercel) używaj endpointu /api/cron zamiast
 * node-cron, który działa tylko na serwerze Node.js z długo żyjącym procesem.
 *
 * Do lokalnego devu / serwera VPS możesz uruchomić:
 *   import "@/lib/scheduler" w src/app/layout.tsx lub custom server.
 */
import cron from "node-cron";
import { runAllSources } from "./runner";

let started = false;

export function startScheduler() {
  if (started) return;
  started = true;

  // Co 6 godzin aktualizuj wszystkie źródła
  cron.schedule("0 */6 * * *", async () => {
    console.log("[scheduler] Running all sources...");
    const result = await runAllSources();
    console.log(`[scheduler] Done. OK: ${result.ok}, Errors: ${result.errors}`);
  });

  console.log("[scheduler] Started – adapters will run every 6 hours");
}
