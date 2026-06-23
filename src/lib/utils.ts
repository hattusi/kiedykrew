import type { BloodType, DemandLevel, DonationType } from "@prisma/client";
import type { OpeningHours, DaySchedule } from "@/types";

// ── Labels ────────────────────────────────────────────────────────────────────

export const BLOOD_TYPE_LABELS: Record<BloodType, string> = {
  A_PLUS: "A Rh+",
  A_MINUS: "A Rh−",
  B_PLUS: "B Rh+",
  B_MINUS: "B Rh−",
  AB_PLUS: "AB Rh+",
  AB_MINUS: "AB Rh−",
  O_PLUS: "0 Rh+",
  O_MINUS: "0 Rh−",
};

export const DEMAND_LEVEL_LABELS: Record<DemandLevel, string> = {
  CRITICAL: "Krytyczne",
  LOW: "Niskie",
  NORMAL: "Normalne",
  HIGH: "Wysokie",
  SURPLUS: "Nadmiar",
};

export const DONATION_TYPE_LABELS: Record<DonationType, string> = {
  WHOLE_BLOOD: "Krew pełna",
  PLASMA: "Osocze",
  PLATELETS: "Płytki krwi",
  ERYTHROCYTES: "Erytrocyty",
};

export const DAY_LABELS: Record<string, string> = {
  monday: "Poniedziałek",
  tuesday: "Wtorek",
  wednesday: "Środa",
  thursday: "Czwartek",
  friday: "Piątek",
  saturday: "Sobota",
  sunday: "Niedziela",
};

export const REGION_LABELS: Record<string, string> = {
  dolnośląskie: "Dolnośląskie",
  "kujawsko-pomorskie": "Kujawsko-Pomorskie",
  lubelskie: "Lubelskie",
  lubuskie: "Lubuskie",
  łódzkie: "Łódzkie",
  małopolskie: "Małopolskie",
  mazowieckie: "Mazowieckie",
  opolskie: "Opolskie",
  podkarpackie: "Podkarpackie",
  podlaskie: "Podlaskie",
  pomorskie: "Pomorskie",
  śląskie: "Śląskie",
  "świętokrzyskie": "Świętokrzyskie",
  "warmińsko-mazurskie": "Warmińsko-Mazurskie",
  wielkopolskie: "Wielkopolskie",
  "zachodniopomorskie": "Zachodniopomorskie",
};

// ── Date / time helpers ───────────────────────────────────────────────────────

export const DAYS_OF_WEEK = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];

export function todayDayOfWeek(): DayOfWeek {
  const d = new Date().getDay(); // 0=Sun
  const map: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return map[d];
}

export function isOpenToday(openingHours: OpeningHours | null): boolean {
  if (!openingHours) return false;
  const today = todayDayOfWeek();
  return !!(openingHours[today] as DaySchedule);
}

export function formatHours(schedule: DaySchedule): string {
  if (!schedule) return "Zamknięte";
  return `${schedule.open}–${schedule.close}`;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ── Demand level helpers ──────────────────────────────────────────────────────

export function demandLevelColor(level: DemandLevel): string {
  switch (level) {
    case "CRITICAL": return "bg-red-100 text-red-800 border-red-300";
    case "LOW":      return "bg-orange-100 text-orange-800 border-orange-300";
    case "NORMAL":   return "bg-gray-100 text-gray-700 border-gray-300";
    case "HIGH":     return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "SURPLUS":  return "bg-blue-100 text-blue-800 border-blue-300";
  }
}

export function demandLevelDot(level: DemandLevel): string {
  switch (level) {
    case "CRITICAL": return "bg-red-500";
    case "LOW":      return "bg-orange-400";
    case "NORMAL":   return "bg-gray-400";
    case "HIGH":     return "bg-yellow-400";
    case "SURPLUS":  return "bg-blue-400";
  }
}

// ── Distance (Haversine) ─────────────────────────────────────────────────────

export function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Misc ──────────────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
