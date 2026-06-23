import { prisma } from "@/lib/prisma";
import { BaseAdapter, type AdapterResult } from "./base";

/**
 * ManualAdapter: reads slots that were entered by an admin via the panel.
 * It doesn't fetch external data; it just validates that the DB records
 * still exist and returns them. Useful to run a sanity-check on manual entries.
 */
export class ManualAdapter extends BaseAdapter {
  async run(_config: Record<string, unknown>, stationId: string): Promise<AdapterResult> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = await prisma.slot.findMany({
      where: {
        stationId,
        date: { gte: today },
        sourceId: null, // manual slots have no sourceId set
      },
    });

    return {
      slots: slots.map((s) => ({
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime ?? undefined,
        available: s.available,
        donationType: s.donationType ?? undefined,
      })),
    };
  }
}
