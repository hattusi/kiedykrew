import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { StationCard } from "@/components/stations/StationCard";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchFilters } from "@/components/search/SearchFilters";
import { scoreStation, sortByScore } from "@/lib/scoring";
import type { BloodType, DonationType } from "@prisma/client";
import type { StationWithDemands } from "@/types";

interface PageProps {
  searchParams: {
    q?: string;
    city?: string;
    region?: string;
    bloodType?: string;
    donationType?: string;
    page?: string;
  };
}

async function StationResults({ searchParams }: PageProps) {
  const { q, city, region, bloodType, donationType } = searchParams;

  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (city)   where.city   = { contains: city,   mode: "insensitive" };
  if (region) where.region = { contains: region, mode: "insensitive" };
  if (donationType) where.supportedDonationTypes = { has: donationType as DonationType };
  if (q) {
    where.OR = [
      { name:    { contains: q, mode: "insensitive" } },
      { city:    { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
    ];
  }
  if (bloodType) {
    where.bloodDemands = { some: { bloodType: bloodType as BloodType } };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

  const stations = await prisma.station.findMany({
    where,
    include: {
      bloodDemands: true,
      slots: {
        where: { available: true, date: { gte: today, lte: threeDaysLater } },
        take: 5,
      },
      _count: { select: { slots: { where: { available: true, date: { gte: today } } } } },
    },
    orderBy: { name: "asc" },
  });

  const scored = stations.map((s) => ({
    ...s,
    score: scoreStation(s as StationWithDemands & { slots: typeof s.slots }, {
      userBloodType: bloodType as BloodType | undefined,
    }),
    availableSlotCount: s._count.slots,
  }));
  const sorted = sortByScore(scored);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="text-4xl mb-3">🔍</div>
        <p className="font-medium">Brak wyników dla podanych kryteriów</p>
        <p className="text-sm mt-1">Spróbuj zmienić filtry lub wpisz inne miasto</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{sorted.length} punktów</p>
      {sorted.map((station) => (
        <StationCard key={station.id} station={station} />
      ))}
    </div>
  );
}

export default function HomePage({ searchParams }: PageProps) {
  const hasSearch = Object.values(searchParams).some(Boolean);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      {!hasSearch && (
        <div className="text-center mb-10 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🩸 KiedyKrew
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Znajdź najbliższy punkt krwiodawstwa, sprawdź dostępne terminy
            i zapotrzebowanie na Twoją grupę krwi.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="card p-5 mb-6">
        <SearchBar defaultValue={searchParams.q} />
        <div className="mt-4">
          <SearchFilters searchParams={searchParams} />
        </div>
      </div>

      {/* Results */}
      {hasSearch ? (
        <Suspense fallback={<div className="text-center py-8 text-gray-500">Ładowanie...</div>}>
          <StationResults searchParams={searchParams} />
        </Suspense>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Wszystkie punkty</h2>
          <Suspense fallback={<div className="text-center py-8 text-gray-500">Ładowanie...</div>}>
            <StationResults searchParams={{}} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
