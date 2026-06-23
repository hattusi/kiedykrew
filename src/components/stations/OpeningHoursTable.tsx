import type { OpeningHours } from "@/types";
import { DAY_LABELS, DAYS_OF_WEEK, todayDayOfWeek } from "@/lib/utils";

export function OpeningHoursTable({ hours }: { hours: OpeningHours }) {
  const today = todayDayOfWeek();

  return (
    <table className="w-full text-sm">
      <tbody>
        {DAYS_OF_WEEK.map((day) => {
          const sched = hours[day];
          const isToday = day === today;
          return (
            <tr key={day} className={isToday ? "font-semibold text-blood-700" : "text-gray-600"}>
              <td className="py-1 pr-3 capitalize">{DAY_LABELS[day]}</td>
              <td className="py-1 text-right">
                {sched ? `${sched.open}–${sched.close}` : <span className="text-gray-400">Zamknięte</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
