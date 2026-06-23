import type {
  Station,
  Source,
  Slot,
  BloodDemand,
  Log,
  StationStatus,
  DonationType,
  BloodType,
  DemandLevel,
  AdapterType,
  LogStatus,
} from "@prisma/client";

export type {
  Station,
  Source,
  Slot,
  BloodDemand,
  Log,
  StationStatus,
  DonationType,
  BloodType,
  DemandLevel,
  AdapterType,
  LogStatus,
};

// Station with relations (for detail view)
export type StationWithRelations = Station & {
  sources: Source[];
  slots: Slot[];
  bloodDemands: BloodDemand[];
};

// Station with just blood demands (for list/search)
export type StationWithDemands = Station & {
  bloodDemands: BloodDemand[];
  _count?: { slots: number };
};

// Search params
export interface SearchParams {
  q?: string;
  city?: string;
  region?: string;
  bloodType?: BloodType;
  donationType?: DonationType;
  dayOfWeek?: string;
  supportsOnlineReservation?: boolean;
  page?: number;
  pageSize?: number;
}

// Scored station for search results
export interface ScoredStation extends StationWithDemands {
  score: number;
  availableSlotCount?: number;
}

// Opening hours shape stored in JSON field
export type DaySchedule = { open: string; close: string } | null;
export interface OpeningHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

// Adapter-specific config shapes
export interface MockAdapterConfig {
  daysAhead?: number;      // default 14
  slotsPerDay?: number;    // default 8
  donationType?: DonationType;
}

export interface StaticAdapterConfig {
  slots?: Array<{
    date: string; // ISO date "2024-06-01"
    startTime: string;
    endTime?: string;
    available?: boolean;
    donationType?: DonationType;
  }>;
  bloodDemands?: Array<{
    bloodType: BloodType;
    level: DemandLevel;
    note?: string;
  }>;
}

export interface HtmlAdapterConfig {
  url: string;
  slotsSelector?: string;    // CSS selector for slot elements
  dateFormat?: string;       // e.g. "DD.MM.YYYY"
  bloodDemandSelector?: string;
}

export interface JsonAdapterConfig {
  url: string;
  headers?: Record<string, string>;
  // JSONPath-like mapping for parsing the response
  slotsPath?: string;
  bloodDemandsPath?: string;
}

export interface BloodDemandAdapterConfig {
  url: string;
  stationCode?: string;
  selector?: string;
}
