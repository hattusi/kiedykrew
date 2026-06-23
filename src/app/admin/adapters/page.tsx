import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminAdaptersPage() {
  const sources = await prisma.source.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      station: { select: { name: true, city: true } },
      _count: { select: { logs: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Adaptery ({sources.length})</h1>
      <p className="text-sm text-gray-500 mb-6">
        Adaptery zarządzaj na poziomie konkretnej stacji. Tutaj widoczne jest zbiorcze podsumowanie.
      </p>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Stacja</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Typ adaptera</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Aktywny</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Ostatnie uruchomienie</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Logi</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{s.station.name}</div>
                  <div className="text-gray-400 text-xs">{s.station.city}</div>
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs bg-gray-100 text-gray-700 rounded px-1.5 py-0.5">{s.adapterType}</code>
                </td>
                <td className="px-4 py-3 text-center">
                  {s.isEnabled ? <span className="text-green-600">✓</span> : <span className="text-gray-400">–</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {s.lastRunAt ? new Date(s.lastRunAt).toLocaleString("pl-PL") : "–"}
                </td>
                <td className="px-4 py-3 text-center">
                  {s.lastStatus ? (
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.lastStatus === "OK" ? "bg-green-100 text-green-700" :
                      s.lastStatus === "ERROR" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{s.lastStatus}</span>
                  ) : <span className="text-gray-300 text-xs">—</span>}
                </td>
                <td className="px-4 py-3 text-center text-gray-500">{s._count.logs}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/stations/${s.stationId}`} className="text-blood-600 hover:underline text-xs">
                    Edytuj stację
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
