/**
 * JsonAdapter – szkielet adaptera dla stacji udostępniających JSON API.
 *
 * Config shape (JsonAdapterConfig):
 *   url            – endpoint JSON
 *   headers        – opcjonalne nagłówki (np. Authorization)
 *   slotsPath      – klucz w obiekcie JSON zawierający tablicę slotów
 *   bloodDemandsPath – klucz w obiekcie JSON zawierający zapotrzebowanie
 */
import { BaseAdapter, type AdapterResult, type SlotData, type BloodDemandData } from "./base";
import type { JsonAdapterConfig } from "@/types";
import type { BloodType, DemandLevel, DonationType } from "@prisma/client";

export class JsonAdapter extends BaseAdapter {
  async run(config: Record<string, unknown>): Promise<AdapterResult> {
    const cfg = config as unknown as JsonAdapterConfig;

    if (!cfg.url) {
      return { error: "JsonAdapter: brak URL w konfiguracji" };
    }

    let data: unknown;
    try {
      const res = await fetch(cfg.url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "KiedyKrew-Aggregator/1.0",
          ...cfg.headers,
        },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        return { error: `JsonAdapter: HTTP ${res.status}` };
      }
      data = await res.json();
    } catch (err) {
      return { error: `JsonAdapter: ${(err as Error).message}` };
    }

    const slots: SlotData[] = [];
    const bloodDemands: BloodDemandData[] = [];

    // ── Parse slots ───────────────────────────────────────────────────────────
    if (cfg.slotsPath && data && typeof data === "object") {
      const rawSlots = getPath(data as Record<string, unknown>, cfg.slotsPath);
      if (Array.isArray(rawSlots)) {
        for (const s of rawSlots) {
          if (!s.date || !s.startTime) continue;
          slots.push({
            date: new Date(s.date),
            startTime: s.startTime,
            endTime: s.endTime,
            available: s.available !== false,
            donationType: s.donationType as DonationType,
          });
        }
      }
    }

    // ── Parse blood demands ───────────────────────────────────────────────────
    if (cfg.bloodDemandsPath && data && typeof data === "object") {
      const rawDemands = getPath(data as Record<string, unknown>, cfg.bloodDemandsPath);
      if (Array.isArray(rawDemands)) {
        for (const d of rawDemands) {
          if (!d.bloodType || !d.level) continue;
          bloodDemands.push({
            bloodType: d.bloodType as BloodType,
            level: d.level as DemandLevel,
            note: d.note,
          });
        }
      }
    }

    return { slots, bloodDemands };
  }
}

function getPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((cur, key) => {
    if (cur && typeof cur === "object") return (cur as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

