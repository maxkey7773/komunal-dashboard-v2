import Link from "next/link";
import { getSession } from "@/lib/auth";

export default function Shell({ children, admin=false }: { children: React.ReactNode, admin?: boolean }) {
  const user = getSession();
  const links = admin ? [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/objects", label: "Obyektlar" },
    { href: "/admin/expenses", label: "Harajatlar" },
    { href: "/admin/categories", label: "Harajat turlari" }
  ] : [
    { href: "/dashboard", label: "Dashboard" }
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-4">
        <div className="text-lg font-bold mb-6">Kommunal</div>
        <nav className="space-y-2">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className="block px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-100">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 text-sm text-slate-400">
          {user?.fullName} ({user?.role})
        </div>
        <form action="/api/auth/logout" method="post" className="mt-3">
          <button className="btn btn-ghost w-full">Chiqish</button>
        </form>
      </aside>
      <main className="flex-1 p-6 bg-gradient-to-b from-slate-950 to-slate-900">
        {children}
      </main>
    </div>
  );
}
