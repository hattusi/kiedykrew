import { prisma } from "@/lib/prisma";
import { StationCard } from "@/components/stations/StationCard";

export const dynamic = "force-dynamic";

export const metadata = { title: "Katalog punktów – KiedyKrew" };

export default async function StationsPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stations = await prisma.station.findMany({
    where: { status: "ACTIVE" },
    include: {
      bloodDemands: true,
      _count: { select: { slots: { where: { available: true, date: { gte: today } } } } },
    },
    orderBy: [{ region: "asc" }, { city: "asc" }, { name: "asc" }],
  });

  // Group by region
  const grouped = stations.reduce<Record<string, typeof stations>>((acc, s) => {
    (acc[s.region] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Katalog punktów krwiodawstwa ({stations.length})
      </h1>

      {Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b, "pl")).map(([region, list]) => (
        <section key={region} className="mb-10">
          <h2 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4 capitalize">
            {region}
          </h2>
          <div className="space-y-3">
            {list.map((s) => (
              <StationCard key={s.id} station={{ ...s, availableSlotCount: s._count.slots }} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
