import { prisma } from "@/lib/prisma";
import { getAdapter } from "@/lib/adapters/registry";
import { Prisma, type LogStatus } from "@prisma/client";

interface RunResult {
  ok: number;
  errors: number;
  skipped: number;
}

/**
 * Uruchamia wszystkie włączone źródła (Sources) dla aktywnych stacji.
 * Wywoływane przez cron lub ręcznie z panelu admina.
 */
export async function runAllSources(): Promise<RunResult> {
  const sources = await prisma.source.findMany({
    where: { isEnabled: true, station: { status: "ACTIVE" } },
    include: { station: true },
  });

  const result: RunResult = { ok: 0, errors: 0, skipped: 0 };

  for (const source of sources) {
    try {
      await runSource(source.id);
      result.ok++;
    } catch (err) {
      result.errors++;
      console.error(`[runner] Source ${source.id} failed:`, err);
    }
  }

  return result;
}

/**
 * Uruchamia konkretne źródło i zapisuje wyniki do bazy.
 */
export async function runSource(sourceId: string): Promise<void> {
  const source = await prisma.source.findUniqueOrThrow({
    where: { id: sourceId },
  });

  if (!source.isEnabled) {
    await logRun(sourceId, "SKIPPED", "Source is disabled", undefined, 0);
    return;
  }

  const startedAt = Date.now();
  let status: LogStatus = "OK";
  let message: string | undefined;
  let details: Record<string, unknown> = {};

  try {
    const adapter = getAdapter(source.adapterType);
    const config = (source.config ?? {}) as Record<string, unknown>;
    const result = await adapter.run(config, source.stationId);

    if (result.error) {
      throw new Error(result.error);
    }

    // Upsert slots
    if (result.slots && result.slots.length > 0) {
      // Delete future slots from this source, then re-insert
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await prisma.slot.deleteMany({
        where: { stationId: source.stationId, sourceId, date: { gte: today } },
      });
      await prisma.slot.createMany({
        data: result.slots.map((s) => ({
          stationId: source.stationId,
          sourceId,
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
          available: s.available,
          donationType: s.donationType,
        })),
        skipDuplicates: true,
      });
      details.slotsCreated = result.slots.length;
    }

    // Upsert blood demands
    if (result.bloodDemands && result.bloodDemands.length > 0) {
      for (const d of result.bloodDemands) {
        await prisma.bloodDemand.upsert({
          where: { stationId_bloodType: { stationId: source.stationId, bloodType: d.bloodType } },
          update: { level: d.level, note: d.note, validUntil: d.validUntil, sourceId },
          create: { stationId: source.stationId, bloodType: d.bloodType, level: d.level, note: d.note, validUntil: d.validUntil, sourceId },
        });
      }
      details.demandsUpserted = result.bloodDemands.length;
    }

    details.adapterType = source.adapterType;
    message = `OK – sloty: ${details.slotsCreated ?? 0}, zapotrzebowanie: ${details.demandsUpserted ?? 0}`;
  } catch (err) {
    status = "ERROR";
    message = (err as Error).message;
    details = { error: message };
  }

  const duration = Date.now() - startedAt;
  await logRun(sourceId, status, message, details, duration);

  await prisma.source.update({
    where: { id: sourceId },
    data: { lastRunAt: new Date(), lastStatus: status },
  });
}

async function logRun(
  sourceId: string,
  status: LogStatus,
  message: string | undefined,
  details: Record<string, unknown> | undefined,
  duration: number,
) {
  await prisma.log.create({
    data: {
      sourceId,
      status,
      message,
      details: (details ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      duration,
    },
  });
}
