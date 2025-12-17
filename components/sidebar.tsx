"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Network,
  LogOut,
  Target
} from "lucide-react";

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Karyawan", path: "/dashboard/employees", icon: Users },
  { name: "Kelola KPI", path: "/dashboard/kpi", icon: Target },
  { name: "Penilaian", path: "/dashboard/evaluation", icon: ClipboardCheck },
  { name: "Struktur Organisasi", path: "/dashboard/organization", icon: Network },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950 text-white h-screen flex flex-col p-4 border-r border-slate-800 shadow-xl fixed left-0 top-0">
      <div className="mb-10 px-2 mt-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-lg">
          V
        </div>
        <h1 className="text-xl font-bold tracking-wider">VENOM HR</h1>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {menu.map((item) => {
          // Logic: Dashboard must be exact match. Others can be sub-paths (e.g. /dashboard/employees/add)
          const isActive = item.path === '/dashboard'
            ? pathname === item.path
            : pathname.startsWith(item.path);

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group focus:outline-none ${isActive
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                }`}
            >
              <item.icon size={20} className={isActive ? "text-white" : "group-hover:text-purple-300 transition-colors"} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-autoflex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-950/30 hover:text-red-400 rounded-lg transition-all duration-200 w-full text-left flex"
      >
        <LogOut size={20} />
        <span className="font-medium text-sm">Logout</span>
      </button>
    </aside>
  );
}
