import type { DonationType } from "@prisma/client";
import { addDays } from "@/lib/utils";
import { BaseAdapter, type AdapterResult, type SlotData } from "./base";
import type { MockAdapterConfig } from "@/types";

const SLOT_TIMES = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
                    "12:00","13:00","13:30","14:00","14:30","15:00","15:30","16:00"];

export class MockAdapter extends BaseAdapter {
  async run(config: Record<string, unknown>): Promise<AdapterResult> {
    const cfg = config as MockAdapterConfig;
    const daysAhead = cfg.daysAhead ?? 14;
    const slotsPerDay = Math.min(cfg.slotsPerDay ?? 8, SLOT_TIMES.length);
    const donationType: DonationType = cfg.donationType ?? "WHOLE_BLOOD";

    const slots: SlotData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < daysAhead; i++) {
      const date = addDays(today, i);
      // Skip Sunday (deterministic based on day index)
      if (date.getDay() === 0) continue;

      // Randomly skip some days (seed with date for reproducibility)
      const dayKey = date.toISOString().slice(0, 10);
      const hash = dayKey.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      if (hash % 5 === 0) continue; // skip ~20% of days

      const times = [...SLOT_TIMES]
        .sort(() => Math.sin(hash) - 0.5)
        .slice(0, slotsPerDay);

      for (const startTime of times) {
        const [h, m] = startTime.split(":").map(Number);
        const endMinutes = (h * 60 + m + 30) % (24 * 60);
        const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
        const available = (hash + h) % 3 !== 0; // ~66% available

        slots.push({ date, startTime, endTime, available, donationType });
      }
    }

    return { slots };
  }
}
