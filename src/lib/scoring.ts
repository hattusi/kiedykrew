import type { BloodDemand, Slot } from "@prisma/client";
import type { BloodType } from "@prisma/client";
import type { StationWithDemands } from "@/types";
import { haversineKm } from "@/lib/utils";

/**
 * Oblicza wynik rekomendacji dla stacji krwiodawstwa.
 *
 * Czynniki:
 *  +20  – obsługa rezerwacji online
 *  +15  – ma dostępne sloty w ciągu 3 dni
 *  +2   – za każdy dostępny slot (max +20)
 *  +30  – CRITICAL zapotrzebowanie na grupę krwi użytkownika
 *  +20  – LOW zapotrzebowanie
 *  +10  – HIGH zapotrzebowanie
 *  +25  – odległość < 1 km (degresywnie do 0 przy 25 km)
 *  -100 – stacja INACTIVE lub TEST
 */
export function scoreStation(
  station: StationWithDemands & { slots?: Slot[] },
  options: {
    userBloodType?: BloodType;
    userLat?: number;
    userLon?: number;
  } = {},
): number {
  if (station.status !== "ACTIVE") return -100;

  let score = 0;
  const { userBloodType, userLat, userLon } = options;

  // Online reservation
  if (station.supportsOnlineReservation) score += 20;

  // Available slots soon
  if (station.slots && station.slots.length > 0) {
    const now = Date.now();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    const nearSlots = station.slots.filter(
      (s) => s.available && new Date(s.date).getTime() - now >= 0 &&
              new Date(s.date).getTime() - now <= threeDays,
    );
    if (nearSlots.length > 0) {
      score += 15 + Math.min(nearSlots.length * 2, 20);
    }
  }

  // Blood type demand
  if (userBloodType && station.bloodDemands.length > 0) {
    const demand = station.bloodDemands.find((d: BloodDemand) => d.bloodType === userBloodType);
    if (demand) {
      const demandScores: Record<string, number> = {
        CRITICAL: 30, LOW: 20, HIGH: 10, NORMAL: 0, SURPLUS: -5,
      };
      score += demandScores[demand.level] ?? 0;
    }
  }

  // Distance
  if (userLat && userLon && station.latitude && station.longitude) {
    const km = haversineKm(userLat, userLon, station.latitude, station.longitude);
    score += Math.max(0, 25 - km);
  }

  return score;
}

export function sortByScore<T extends { score: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.score - a.score);
}
