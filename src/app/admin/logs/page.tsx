import { prisma } from "@/lib/prisma";

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const pageSize = 50;

  const [total, logs] = await Promise.all([
    prisma.log.count(),
    prisma.log.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        source: {
          select: {
            adapterType: true,
            station: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Logi ({total})</h1>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Stacja</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Adapter</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Wiadomość</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Czas (ms)</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Data</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{log.source.station.name}</td>
                <td className="px-4 py-2"><code className="text-xs bg-gray-100 text-gray-700 rounded px-1.5 py-0.5">{log.source.adapterType}</code></td>
                <td className="px-4 py-2 text-center">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    log.status === "OK" ? "bg-green-100 text-green-700" :
                    log.status === "ERROR" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{log.status}</span>
                </td>
                <td className="px-4 py-2 text-gray-500 text-xs max-w-xs truncate">{log.message ?? "–"}</td>
                <td className="px-4 py-2 text-right text-gray-400 text-xs">{log.duration ?? "–"}</td>
                <td className="px-4 py-2 text-right text-gray-400 text-xs whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("pl-PL")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {page > 1 && (
            <a href={`?page=${page - 1}`} className="btn-secondary px-3 py-1.5 text-xs">← Poprzednia</a>
          )}
          <span className="text-sm text-gray-500 self-center">Strona {page} / {totalPages}</span>
          {page < totalPages && (
            <a href={`?page=${page + 1}`} className="btn-secondary px-3 py-1.5 text-xs">Następna →</a>
          )}
        </div>
      )}
    </div>
  );
}
