"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Source, AdapterType } from "@prisma/client";

const ADAPTER_TYPES: AdapterType[] = ["MOCK","STATIC","MANUAL","HTML","JSON","BLOOD_DEMAND"];

const ADAPTER_DESCRIPTIONS: Record<AdapterType, string> = {
  MOCK: "Generuje losowe sloty testowe",
  STATIC: "Statyczne dane z config JSON",
  MANUAL: "Sloty dodawane ręcznie przez admina",
  HTML: "Scrapuje HTML zewnętrznej strony",
  JSON: "Odpytuje JSON API",
  BLOOD_DEMAND: "Pobiera zapotrzebowanie na krew",
};

interface Props {
  stationId: string;
  sources: Source[];
}

export function SourcesManager({ stationId, sources: initialSources }: Props) {
  const router = useRouter();
  const [sources, setSources] = useState(initialSources);
  const [showAdd, setShowAdd] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [newType, setNewType] = useState<AdapterType>("MOCK");
  const [newConfig, setNewConfig] = useState("{}");
  const [adding, setAdding] = useState(false);

  const runSource = async (sourceId: string) => {
    setRunning(sourceId);
    try {
      const res = await fetch(`/api/admin/sources/${sourceId}/run`, { method: "POST" });
      const data = await res.json();
      alert(data.message ?? data.error ?? "Gotowe");
      router.refresh();
    } catch {
      alert("Błąd uruchamiania adaptera");
    } finally {
      setRunning(null);
    }
  };

  const addSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    let config: Record<string, unknown>;
    try {
      config = JSON.parse(newConfig);
    } catch {
      alert("Nieprawidłowy JSON w polu config");
      setAdding(false);
      return;
    }
    const res = await fetch("/api/admin/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId, adapterType: newType, config, isEnabled: true }),
    });
    if (res.ok) {
      const data = await res.json();
      setSources((s) => [data.data, ...s]);
      setShowAdd(false);
      setNewConfig("{}");
    } else {
      alert("Błąd dodawania źródła");
    }
    setAdding(false);
  };

  return (
    <div>
      {sources.length > 0 && (
        <div className="space-y-3 mb-4">
          {sources.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm">
              <code className="bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs">{s.adapterType}</code>
              <span className="text-gray-500 flex-1">{ADAPTER_DESCRIPTIONS[s.adapterType]}</span>
              <span className={`text-xs ${s.lastStatus === "OK" ? "text-green-600" : s.lastStatus === "ERROR" ? "text-red-600" : "text-gray-400"}`}>
                {s.lastStatus ?? "–"}
              </span>
              {s.lastRunAt && (
                <span className="text-xs text-gray-400">
                  {new Date(s.lastRunAt).toLocaleString("pl-PL")}
                </span>
              )}
              <button
                onClick={() => runSource(s.id)}
                disabled={running === s.id}
                className="btn-secondary py-1 px-3 text-xs"
              >
                {running === s.id ? "..." : "▶ Uruchom"}
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd ? (
        <form onSubmit={addSource} className="border border-dashed border-gray-300 rounded-lg p-4 space-y-3">
          <div>
            <label className="label">Typ adaptera</label>
            <select className="input w-auto" value={newType} onChange={(e) => setNewType(e.target.value as AdapterType)}>
              {ADAPTER_TYPES.map((t) => (
                <option key={t} value={t}>{t} – {ADAPTER_DESCRIPTIONS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Config (JSON)</label>
            <textarea
              className="input font-mono text-xs"
              rows={4}
              value={newConfig}
              onChange={(e) => setNewConfig(e.target.value)}
              placeholder='{"daysAhead": 14, "slotsPerDay": 8}'
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={adding} className="btn-primary text-sm">
              {adding ? "Dodawanie..." : "Dodaj źródło"}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary text-sm">
              Anuluj
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowAdd(true)} className="btn-secondary text-sm">
          + Dodaj źródło
        </button>
      )}
    </div>
  );
}
