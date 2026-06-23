/**
 * BloodDemandAdapter – szkielet adaptera dla stron z zapotrzebowaniem na krew.
 *
 * Wiele RCKiK publikuje tabelę zapotrzebowania na krew na swojej stronie WWW.
 * Ten adapter wyspecjalizowany jest w parsowaniu tej tabeli.
 *
 * Config shape (BloodDemandAdapterConfig):
 *   url         – strona z tabelą zapotrzebowania
 *   selector    – CSS selektor tabeli / wierszy (opcjonalny)
 *   stationCode – identyfikator stacji w systemie zewnętrznym (opcjonalny)
 */
import * as cheerio from "cheerio";
import { BaseAdapter, type AdapterResult, type BloodDemandData } from "./base";
import type { BloodDemandAdapterConfig } from "@/types";
import type { BloodType, DemandLevel } from "@prisma/client";

const BLOOD_TYPE_MAP: Record<string, BloodType> = {
  "0+": "O_PLUS", "0-": "O_MINUS", "o+": "O_PLUS", "o-": "O_MINUS",
  "a+": "A_PLUS", "a-": "A_MINUS",
  "b+": "B_PLUS", "b-": "B_MINUS",
  "ab+": "AB_PLUS", "ab-": "AB_MINUS",
};

const LEVEL_KEYWORDS: Array<[string[], DemandLevel]> = [
  [["pilnie", "krytycz", "critical", "urgent"], "CRITICAL"],
  [["nisk", "brak", "niedobór", "low"], "LOW"],
  [["normal", "normalne", "standard"], "NORMAL"],
  [["wysok", "high", "potrzeb"], "HIGH"],
  [["nadmiar", "surplus", "dużo", "excess"], "SURPLUS"],
];

function guessLevel(text: string): DemandLevel {
  const t = text.toLowerCase();
  for (const [keywords, level] of LEVEL_KEYWORDS) {
    if (keywords.some((k) => t.includes(k))) return level;
  }
  return "NORMAL";
}

export class BloodDemandAdapter extends BaseAdapter {
  async run(config: Record<string, unknown>): Promise<AdapterResult> {
    const cfg = config as BloodDemandAdapterConfig;

    if (!cfg.url) {
      return { error: "BloodDemandAdapter: brak URL" };
    }

    let html: string;
    try {
      const res = await fetch(cfg.url, {
        headers: { "User-Agent": "KiedyKrew-Aggregator/1.0" },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) return { error: `HTTP ${res.status}` };
      html = await res.text();
    } catch (err) {
      return { error: (err as Error).message };
    }

    const $ = cheerio.load(html);
    const bloodDemands: BloodDemandData[] = [];
    const selector = cfg.selector ?? "table tr, .blood-type, [data-blood-type]";

    $(selector).each((_i, el) => {
      const text = $(el).text().trim();
      const bloodTypeRaw = $(el).attr("data-blood-type") ?? text.split(/\s+/)[0];
      const bloodType = BLOOD_TYPE_MAP[bloodTypeRaw?.toLowerCase()];
      if (!bloodType) return;

      const levelText = $(el).attr("data-level") ?? text;
      const level = guessLevel(levelText);

      bloodDemands.push({ bloodType, level });
    });

    return { bloodDemands };
  }
}
