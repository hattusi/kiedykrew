import { BaseAdapter, type AdapterResult } from "./base";
import type { StaticAdapterConfig } from "@/types";

export class StaticAdapter extends BaseAdapter {
  async run(config: Record<string, unknown>): Promise<AdapterResult> {
    const cfg = config as StaticAdapterConfig;

    const slots = (cfg.slots ?? []).map((s) => ({
      date: new Date(s.date),
      startTime: s.startTime,
      endTime: s.endTime,
      available: s.available ?? true,
      donationType: s.donationType,
    }));

    const bloodDemands = cfg.bloodDemands?.map((d) => ({
      bloodType: d.bloodType,
      level: d.level,
      note: d.note,
    }));

    return { slots, bloodDemands };
  }
}
