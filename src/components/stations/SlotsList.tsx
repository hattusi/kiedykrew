import type { Slot } from "@prisma/client";
import { DONATION_TYPE_LABELS, formatDateShort } from "@/lib/utils";

export function SlotsList({ slots }: { slots: Slot[] }) {
  // Group by date
  const grouped = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const key = new Date(slot.date).toISOString().slice(0, 10);
    (acc[key] ??= []).push(slot);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-5">
      {sortedDates.map((dateKey) => {
        const daySlots = grouped[dateKey];
        const date = new Date(dateKey + "T00:00:00");
        const dayName = date.toLocaleDateString("pl-PL", { weekday: "long" });
        const hasAny = daySlots.some((s) => s.available);

        return (
          <div key={dateKey}>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-gray-900 capitalize">{dayName}</h3>
              <span className="text-sm text-gray-400">{formatDateShort(date)}</span>
              {!hasAny && (
                <span className="text-xs text-gray-400 ml-auto">Wszystkie zajęte</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {daySlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`text-sm rounded-lg border px-3 py-1.5 ${
                    slot.available
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-gray-50 border-gray-200 text-gray-400 line-through"
                  }`}
                  title={slot.donationType ? DONATION_TYPE_LABELS[slot.donationType] : undefined}
                >
                  {slot.startTime}
                  {slot.endTime && ` – ${slot.endTime}`}
                  {slot.donationType && (
                    <span className="ml-1.5 text-xs opacity-70">
                      ({DONATION_TYPE_LABELS[slot.donationType]?.slice(0, 6) ?? slot.donationType})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
