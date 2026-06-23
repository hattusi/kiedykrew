"use client";

import { useRouter } from "next/navigation";
import { BLOOD_TYPE_LABELS, DONATION_TYPE_LABELS, REGION_LABELS } from "@/lib/utils";
import type { BloodType, DonationType } from "@prisma/client";

const BLOOD_TYPES = Object.keys(BLOOD_TYPE_LABELS) as BloodType[];
const DONATION_TYPES = Object.keys(DONATION_TYPE_LABELS) as DonationType[];

interface Props {
  searchParams: {
    q?: string;
    city?: string;
    region?: string;
    bloodType?: string;
    donationType?: string;
  };
}

export function SearchFilters({ searchParams }: Props) {
  const router = useRouter();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/?${params.toString()}`);
  };

  const hasFilters = Object.values(searchParams).some(Boolean);

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Region */}
      <select
        value={searchParams.region ?? ""}
        onChange={(e) => update("region", e.target.value)}
        className="input w-auto text-sm py-1.5"
      >
        <option value="">Wszystkie województwa</option>
        {Object.entries(REGION_LABELS).map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>

      {/* Blood type */}
      <select
        value={searchParams.bloodType ?? ""}
        onChange={(e) => update("bloodType", e.target.value)}
        className="input w-auto text-sm py-1.5"
      >
        <option value="">Wszystkie grupy krwi</option>
        {BLOOD_TYPES.map((bt) => (
          <option key={bt} value={bt}>{BLOOD_TYPE_LABELS[bt]}</option>
        ))}
      </select>

      {/* Donation type */}
      <select
        value={searchParams.donationType ?? ""}
        onChange={(e) => update("donationType", e.target.value)}
        className="input w-auto text-sm py-1.5"
      >
        <option value="">Wszystkie rodzaje donacji</option>
        {DONATION_TYPES.map((dt) => (
          <option key={dt} value={dt}>{DONATION_TYPE_LABELS[dt]}</option>
        ))}
      </select>

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-500 hover:text-gray-900 underline"
        >
          Wyczyść filtry
        </button>
      )}
    </div>
  );
}
