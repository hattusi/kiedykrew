import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminStationsPage() {
  const stations = await prisma.station.findMany({
    orderBy: [{ region: "asc" }, { city: "asc" }],
    include: { _count: { select: { sources: true, slots: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stacje ({stations.length})</h1>
        <Link href="/admin/stations/new" className="btn-primary">+ Dodaj stację</Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nazwa</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Miasto</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Województwo</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Źródła</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Sloty</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {stations.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-gray-600">{s.city}</td>
                <td className="px-4 py-3 text-gray-600 capitalize">{s.region}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    s.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                    s.status === "INACTIVE" ? "bg-gray-100 text-gray-600" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{s._count.sources}</td>
                <td className="px-4 py-3 text-center text-gray-600">{s._count.slots}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/stations/${s.id}`} className="text-blood-600 hover:underline text-sm">
                    Edytuj
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
