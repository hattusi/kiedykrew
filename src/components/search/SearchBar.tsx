"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface Props {
  defaultValue?: string;
}

export function SearchBar({ defaultValue = "" }: Props) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Wpisz miasto, nazwę punktu lub adres..."
        className="input flex-1"
        autoComplete="off"
      />
      <button type="submit" className="btn-primary">
        Szukaj
      </button>
    </form>
  );
}
