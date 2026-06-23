/**
 * HtmlAdapter â€“ szkielet scrapera HTML opartego na Cheerio.
 *
 * Adapter NIE jest uruchamiany automatycznie w MVP â€“ wymaga rÄ™cznej
 * konfiguracji selektorĂłw CSS dla kaĹĽdego ĹşrĂłdĹ‚a.
 *
 * Config shape (HtmlAdapterConfig):
 *   url            â€“ adres strony do pobrania
 *   slotsSelector  â€“ CSS selektor elementĂłw ze slotami (opcjonalny)
 *   dateFormat     â€“ format daty w atrybutach / tekĹ›cie (opcjonalny)
 *
 * Parseowanie slotĂłw i zapotrzebowania na krew wymaga implementacji
 * metod parseSlots() i parseBloodDemands() dla konkretnego ĹşrĂłdĹ‚a.
 */
import * as cheerio from "cheerio";
import { BaseAdapter, type AdapterResult, type SlotData } from "./base";
import type { HtmlAdapterConfig } from "@/types";

export class HtmlAdapter extends BaseAdapter {
  async run(config: Record<string, unknown>): Promise<AdapterResult> {
    const cfg = config as unknown as HtmlAdapterConfig;

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
      return { error: `HtmlAdapter: fetch error â€“ ${(err as Error).message}` };
    }

    const $ = cheerio.load(html);
    const slots: SlotData[] = [];

    if (cfg.slotsSelector) {
      $(cfg.slotsSelector).each((_i, el) => {
        // â”€â”€ IMPLEMENTACJA SPECYFICZNA DLA ĹąRĂ“DĹA â”€â”€
        // Tutaj naleĹĽy wyciÄ…gnÄ…Ä‡ datÄ™, startTime, endTime, available
        // ze struktury HTML konkretnej strony RCKiK.
        //
        // PrzykĹ‚ad (do nadpisania):
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

