import Link from "next/link";
import type { BloodDemand } from "@prisma/client";
import type { Station } from "@/types";
import { DONATION_TYPE_LABELS, demandLevelDot, BLOOD_TYPE_LABELS } from "@/lib/utils";
import type { OpeningHours } from "@/types";

interface Props {
  station: Station & {
    bloodDemands: BloodDemand[];
    availableSlotCount?: number;
  };
}

function todayHours(openingHours: unknown): string | null {
  if (!openingHours || typeof openingHours !== "object") return null;
  const oh = openingHours as OpeningHours;
  const dayMap = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"] as const;
  const today = dayMap[new Date().getDay()];
  const sched = oh[today];
  if (!sched) return "Zamknięte dzisiaj";
  return `Dzisiaj: ${sched.open}–${sched.close}`;
}

export function StationCard({ station }: Props) {
  const criticalDemands = station.bloodDemands.filter((d) => d.level === "CRITICAL");
  const lowDemands = station.bloodDemands.filter((d) => d.level === "LOW");
  const hours = todayHours(station.openingHours);

  return (
    <Link
      href={`/stations/${station.id}`}
      className="card p-4 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow cursor-pointer block"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{station.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{station.address}, {station.city}</p>
          </div>
          <span className={`shrink-0 text-xs rounded-full px-2 py-0.5 ml-auto ${
            station.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}>
            {station.status === "ACTIVE" ? "Aktywna" : station.status}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
          {hours && <span>{hours}</span>}
          {station.supportsOnlineReservation && (
            <span className="text-green-600 font-medium">✓ Rezerwacja online</span>
          )}
          {station.availableSlotCount !== undefined && station.availableSlotCount > 0 && (
            <span className="text-blood-600 font-medium">
              {station.availableSlotCount} wolnych terminów
            </span>
          )}
          {station.supportedDonationTypes.slice(0, 2).map((t) => (
            <span key={t} className="bg-gray-100 rounded px-1.5 py-0.5">
              {DONATION_TYPE_LABELS[t as keyof typeof DONATION_TYPE_LABELS] ?? t}
            </span>
          ))}
        </div>
      </div>

      {/* Blood demand indicators */}
      {(criticalDemands.length > 0 || lowDemands.length > 0) && (
        <div className="shrink-0 flex flex-col gap-1.5 justify-center">
          {criticalDemands.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-600 mb-1">Pilnie potrzebne:</p>
              <div className="flex flex-wrap gap-1">
                {criticalDemands.map((d) => (
                  <span key={d.bloodType} className="flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${demandLevelDot("CRITICAL")}`} />
                    {BLOOD_TYPE_LABELS[d.bloodType]}
                  </span>
                ))}
              </div>
            </div>
          )}
          {lowDemands.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-1">
                {lowDemands.slice(0, 3).map((d) => (
                  <span key={d.bloodType} className="flex items-center gap-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-2 py-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${demandLevelDot("LOW")}`} />
                    {BLOOD_TYPE_LABELS[d.bloodType]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
