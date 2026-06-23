import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = { title: "Panel Admina – KiedyKrew" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-8">
      <aside className="w-56 shrink-0">
        <AdminNav />
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
