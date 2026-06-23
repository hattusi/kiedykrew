import type { BloodDemand } from "@prisma/client";
import { BLOOD_TYPE_LABELS, DEMAND_LEVEL_LABELS, demandLevelColor } from "@/lib/utils";

const ALL_BLOOD_TYPES = [
  "O_MINUS","O_PLUS","A_MINUS","A_PLUS","B_MINUS","B_PLUS","AB_MINUS","AB_PLUS",
] as const;

export function BloodDemandGrid({ demands }: { demands: BloodDemand[] }) {
  const map = Object.fromEntries(demands.map((d) => [d.bloodType, d]));

  return (
    <div className="grid grid-cols-2 gap-2">
      {ALL_BLOOD_TYPES.map((bt) => {
        const demand = map[bt];
        return (
          <div
            key={bt}
            className={`rounded-lg border px-3 py-2 text-xs ${
              demand ? demandLevelColor(demand.level) : "bg-gray-50 text-gray-400 border-gray-200"
            }`}
          >
            <div className="font-bold text-sm">{BLOOD_TYPE_LABELS[bt]}</div>
            {demand ? (
              <>
                <div className="font-medium mt-0.5">{DEMAND_LEVEL_LABELS[demand.level]}</div>
                {demand.note && <div className="mt-0.5 opacity-80">{demand.note}</div>}
              </>
            ) : (
              <div className="mt-0.5">Brak danych</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
