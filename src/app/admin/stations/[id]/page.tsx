import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StationForm } from "@/components/admin/StationForm";
import { SourcesManager } from "@/components/admin/SourcesManager";

export const dynamic = "force-dynamic";

export default async function EditStationPage({ params }: { params: { id: string } }) {
  const station = await prisma.station.findUnique({
    where: { id: params.id },
    include: { sources: { orderBy: { createdAt: "desc" } } },
  });

  if (!station) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{station.name}</h1>
        <p className="text-gray-500 text-sm">{station.city} · {station.region}</p>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Dane stacji</h2>
        <StationForm station={station} />
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Źródła danych (adaptery)</h2>
        <SourcesManager stationId={station.id} sources={station.sources} />
      </div>

      <div className="flex justify-end">
        <a href={`/stations/${station.id}`} target="_blank" className="btn-secondary text-sm">
          Podgląd publiczny →
        </a>
      </div>
    </div>
  );
}
