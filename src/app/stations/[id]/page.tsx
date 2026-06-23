import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BloodDemandGrid } from "@/components/stations/BloodDemandGrid";
import { SlotsList } from "@/components/stations/SlotsList";
import { OpeningHoursTable } from "@/components/stations/OpeningHoursTable";
import { DONATION_TYPE_LABELS } from "@/lib/utils";
import type { OpeningHours } from "@/types";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const s = await prisma.station.findUnique({ where: { id: params.id }, select: { name: true, city: true } });
  if (!s) return {};
  return { title: `${s.name} – KiedyKrew` };
}

export default async function StationDetailPage({ params }: { params: { id: string } }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const station = await prisma.station.findUnique({
    where: { id: params.id },
    include: {
      bloodDemands: { orderBy: { bloodType: "asc" } },
      slots: {
        where: { date: { gte: today } },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        take: 200,
      },
    },
  });

  if (!station) notFound();

  const openingHours = station.openingHours as OpeningHours | null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{station.name}</h1>
            <p className="text-gray-500 mt-1">{station.address}, {station.city}</p>
          </div>
          {station.reservationUrl && (
            <a
              href={station.reservationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary shrink-0"
            >
              Zarezerwuj wizytę →
            </a>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
          {station.phone && (
            <span>📞 <a href={`tel:${station.phone}`} className="text-blood-600 hover:underline">{station.phone}</a></span>
          )}
          {station.websiteUrl && (
            <span>🌐 <a href={station.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blood-600 hover:underline">Strona WWW</a></span>
          )}
          {station.supportsOnlineReservation && (
            <span className="text-green-600 font-medium">✓ Rezerwacja online</span>
          )}
        </div>

        {/* Donation types */}
        {station.supportedDonationTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {station.supportedDonationTypes.map((t) => (
              <span key={t} className="text-xs rounded-full bg-blood-50 text-blood-700 border border-blood-200 px-2.5 py-1">
                {DONATION_TYPE_LABELS[t as keyof typeof DONATION_TYPE_LABELS] ?? t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Opening hours */}
          {openingHours && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Godziny otwarcia</h2>
              <OpeningHoursTable hours={openingHours} />
            </div>
          )}

          {/* Blood demand */}
          {station.bloodDemands.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Zapotrzebowanie na krew</h2>
              <BloodDemandGrid demands={station.bloodDemands} />
            </div>
          )}
        </div>

        {/* Right column – slots */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Dostępne terminy</h2>
            {station.slots.length > 0 ? (
              <SlotsList slots={station.slots} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">📅</div>
                <p>Brak dostępnych terminów w systemie.</p>
                {station.reservationUrl && (
                  <p className="mt-2 text-sm">
                    Sprawdź bezpośrednio na{" "}
                    <a href={station.reservationUrl} target="_blank" rel="noopener noreferrer" className="text-blood-600 hover:underline">
                      stronie stacji
                    </a>.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-8 text-xs text-gray-400 text-center">
        Dane pobrane z publicznych źródeł. Przed wizytą zweryfikuj je na oficjalnej stronie punktu.
        KiedyKrew nie jest oficjalnym systemem RCKiK.
      </p>
    </div>
  );
}
