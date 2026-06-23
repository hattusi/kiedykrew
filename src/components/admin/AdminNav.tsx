"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", emoji: "📊" },
  { href: "/admin/stations", label: "Stacje", emoji: "🏥" },
  { href: "/admin/adapters", label: "Adaptery", emoji: "⚙️" },
  { href: "/admin/logs", label: "Logi", emoji: "📋" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="card p-3 space-y-1">
      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Panel Admina
      </div>
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-blood-50 text-blood-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
            )}
          >
            <span>{item.emoji}</span>
            {item.label}
          </Link>
        );
      })}
      <div className="pt-2 border-t border-gray-200 mt-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        >
          ← Wróć do serwisu
        </Link>
      </div>
    </nav>
  );
}
