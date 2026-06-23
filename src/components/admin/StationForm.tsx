"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Station, DonationType } from "@prisma/client";
import { DONATION_TYPE_LABELS } from "@/lib/utils";

const DONATION_TYPES = Object.keys(DONATION_TYPE_LABELS) as DonationType[];

interface Props {
  station?: Station;
}

export function StationForm({ station }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name:                       station?.name ?? "",
    city:                       station?.city ?? "",
    region:                     station?.region ?? "",
    address:                    station?.address ?? "",
    phone:                      station?.phone ?? "",
    websiteUrl:                 station?.websiteUrl ?? "",
    reservationUrl:             station?.reservationUrl ?? "",
    latitude:                   station?.latitude?.toString() ?? "",
    longitude:                  station?.longitude?.toString() ?? "",
    supportsOnlineReservation:  station?.supportsOnlineReservation ?? false,
    supportedDonationTypes:     station?.supportedDonationTypes ?? [] as DonationType[],
    status:                     station?.status ?? "ACTIVE",
  });

  const toggleDonationType = (t: DonationType) => {
    setForm((f) => ({
      ...f,
      supportedDonationTypes: f.supportedDonationTypes.includes(t)
        ? f.supportedDonationTypes.filter((x) => x !== t)
        : [...f.supportedDonationTypes, t],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body = {
      ...form,
      latitude:  form.latitude  ? parseFloat(form.latitude)  : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
    };

    const url    = station ? `/api/admin/stations/${station.id}` : "/api/admin/stations";
    const method = station ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(JSON.stringify(data.error, null, 2));
      return;
    }

    const data = await res.json();
    if (!station) {
      router.push(`/admin/stations/${data.data.id}`);
    } else {
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!station) return;
    if (!confirm(`Usunąć stację "${station.name}"? Tej operacji nie można cofnąć.`)) return;
    await fetch(`/api/admin/stations/${station.id}`, { method: "DELETE" });
    router.push("/admin/stations");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Nazwa stacji *</label>
          <input className="input" value={form.name} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} required />
        </div>
        <div>
          <label className="label">Miasto *</label>
          <input className="input" value={form.city} onChange={(e) => setForm(f => ({...f, city: e.target.value}))} required />
        </div>
        <div>
          <label className="label">Województwo *</label>
          <input className="input" value={form.region} onChange={(e) => setForm(f => ({...f, region: e.target.value}))} required placeholder="np. mazowieckie" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Adres *</label>
          <input className="input" value={form.address} onChange={(e) => setForm(f => ({...f, address: e.target.value}))} required />
        </div>
        <div>
          <label className="label">Telefon</label>
          <input className="input" value={form.phone} onChange={(e) => setForm(f => ({...f, phone: e.target.value}))} />
        </div>
        <div>
          <label className="label">Strona WWW</label>
          <input className="input" type="url" value={form.websiteUrl} onChange={(e) => setForm(f => ({...f, websiteUrl: e.target.value}))} placeholder="https://" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">URL rezerwacji</label>
          <input className="input" type="url" value={form.reservationUrl} onChange={(e) => setForm(f => ({...f, reservationUrl: e.target.value}))} placeholder="https://" />
        </div>
        <div>
          <label className="label">Szerokość geograficzna (lat)</label>
          <input className="input" type="number" step="any" value={form.latitude} onChange={(e) => setForm(f => ({...f, latitude: e.target.value}))} placeholder="52.2297" />
        </div>
        <div>
          <label className="label">Długość geograficzna (lon)</label>
          <input className="input" type="number" step="any" value={form.longitude} onChange={(e) => setForm(f => ({...f, longitude: e.target.value}))} placeholder="21.0122" />
        </div>
      </div>

      {/* Checkboxes */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.supportsOnlineReservation}
            onChange={(e) => setForm(f => ({...f, supportsOnlineReservation: e.target.checked}))}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Obsługa rezerwacji online</span>
        </label>
      </div>

      {/* Donation types */}
      <div>
        <label className="label">Rodzaje donacji</label>
        <div className="flex flex-wrap gap-2">
          {DONATION_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={form.supportedDonationTypes.includes(t)}
                onChange={() => toggleDonationType(t)}
                className="rounded border-gray-300"
              />
              {DONATION_TYPE_LABELS[t]}
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="label">Status</label>
        <select className="input w-auto" value={form.status} onChange={(e) => setForm(f => ({...f, status: e.target.value as "ACTIVE"|"INACTIVE"|"TEST"}))}>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="TEST">TEST</option>
        </select>
      </div>

      <div className="flex justify-between pt-2">
        {station && (
          <button type="button" onClick={handleDelete} className="text-sm text-red-600 hover:text-red-700 underline">
            Usuń stację
          </button>
        )}
        <button type="submit" disabled={saving} className="btn-primary ml-auto">
          {saving ? "Zapisywanie..." : station ? "Zapisz zmiany" : "Utwórz stację"}
        </button>
      </div>
    </form>
  );
}
