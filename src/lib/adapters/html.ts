/**
 * HtmlAdapter – szkielet scrapera HTML opartego na Cheerio.
 *
 * Adapter NIE jest uruchamiany automatycznie w MVP – wymaga ręcznej
 * konfiguracji selektorów CSS dla każdego źródła.
 *
 * Config shape (HtmlAdapterConfig):
 *   url            – adres strony do pobrania
 *   slotsSelector  – CSS selektor elementów ze slotami (opcjonalny)
 *   dateFormat     – format daty w atrybutach / tekście (opcjonalny)
 *
 * Parseowanie slotów i zapotrzebowania na krew wymaga implementacji
 * metod parseSlots() i parseBloodDemands() dla konkretnego źródła.
 */
import * as cheerio from "cheerio";
import { BaseAdapter, type AdapterResult, type SlotData } from "./base";
import type { HtmlAdapterConfig } from "@/types";

export class HtmlAdapter extends BaseAdapter {
  async run(config: Record<string, unknown>): Promise<AdapterResult> {
    const cfg = config as HtmlAdapterConfig;

    if (!cfg.url) {
      return { error: "HtmlAdapter: brak URL w konfiguracji" };
    }

    let html: string;
    try {
      const res = await fetch(cfg.url, {
        headers: { "User-Agent": "KiedyKrew-Aggregator/1.0 (+https://kiedykrew.pl)" },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        return { error: `HtmlAdapter: HTTP ${res.status} dla ${cfg.url}` };
      }
      html = await res.text();
    } catch (err) {
      return { error: `HtmlAdapter: fetch error – ${(err as Error).message}` };
    }

    const $ = cheerio.load(html);
    const slots: SlotData[] = [];

    if (cfg.slotsSelector) {
      $(cfg.slotsSelector).each((_i, el) => {
        // ── IMPLEMENTACJA SPECYFICZNA DLA ŹRÓDŁA ──
        // Tutaj należy wyciągnąć datę, startTime, endTime, available
        // ze struktury HTML konkretnej strony RCKiK.
        //
        // Przykład (do nadpisania):
        const dateText = $(el).attr("data-date") ?? $(el).find(".date").text().trim();
        const timeText = $(el).attr("data-time") ?? $(el).find(".time").text().trim();
        if (!dateText || !timeText) return;

        const date = new Date(dateText);
        if (isNaN(date.getTime())) return;

        slots.push({
          date,
          startTime: timeText.slice(0, 5),
          available: !$(el).hasClass("taken"),
        });
      });
    }

    return {
      slots,
      // bloodDemands: parseBloodDemands($, cfg),
    };
  }
}
