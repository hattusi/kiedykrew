import type { BloodType, DemandLevel, DonationType } from "@prisma/client";

export interface SlotData {
  date: Date;
  startTime: string;
  endTime?: string;
  available: boolean;
  donationType?: DonationType;
}

export interface BloodDemandData {
  bloodType: BloodType;
  level: DemandLevel;
  note?: string;
  validUntil?: Date;
}

export interface AdapterResult {
  slots?: SlotData[];
  bloodDemands?: BloodDemandData[];
  error?: string;
}

export abstract class BaseAdapter {
  abstract run(config: Record<string, unknown>, stationId: string): Promise<AdapterResult>;
}
