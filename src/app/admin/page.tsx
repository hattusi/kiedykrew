import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stationCount, sourceCount, slotCount, logCount, recentLogs] = await Promise.all([
    prisma.station.count(),
    prisma.source.count(),
    prisma.slot.count({ where: { date: { gte: new Date() } } }),
    prisma.log.count(),
    prisma.log.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { source: { include: { station: { select: { name: true } } } } },
    }),
  ]);

  const stats = [
    { label: "Stacje", value: stationCount, href: "/admin/stations", emoji: "🏥" },
    { label: "Źródła (adaptery)", value: sourceCount, href: "/admin/adapters", emoji: "⚙️" },
    { label: "Przyszłe sloty", value: slotCount, href: "/admin/stations", emoji: "📅" },
    { label: "Logi", value: logCount, href: "/admin/logs", emoji: "📋" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel admina</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <a key={s.label} href={s.href} className="card p-5 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">{s.emoji}</div>
            <div className="text-3xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
          </a>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Ostatnie logi</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-medium text-gray-600">Stacja</th>
                <th className="text-left py-2 pr-4 font-medium text-gray-600">Adapter</th>
                <th className="text-left py-2 pr-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-2 pr-4 font-medium text-gray-600">Czas</th>
                <th className="text-left py-2 font-medium text-gray-600">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 pr-4">{log.source.station.name}</td>
                  <td className="py-2 pr-4 text-gray-500">{log.source.adapterType}</td>
                  <td className="py-2 pr-4">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      log.status === "OK" ? "bg-green-100 text-green-700" :
                      log.status === "ERROR" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-gray-500">{log.duration ?? 0}ms</td>
                  <td className="py-2 text-gray-400 text-xs">
                    {new Date(log.createdAt).toLocaleString("pl-PL")}
                  </td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">Brak logów</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
