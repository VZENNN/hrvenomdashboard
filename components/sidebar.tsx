"use client";

import Link from "next/link";
import Image from 'next/image'
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Network,
  LogOut,
  Target,
  Building2,
  Calendar,
  CalendarDays,
  NotebookPen
} from "lucide-react";

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Karyawan", path: "/dashboard/employees", icon: Users },
  { name: "Departemen", path: "/dashboard/departments", icon: Building2 },
  { name: "Kelola KPI", path: "/dashboard/kpi", icon: Target },
  { name: "Penilaian", path: "/dashboard/evaluation", icon: NotebookPen },
  { name: "Struktur Organisasi", path: "/dashboard/organization", icon: Network },
  { name: "Kalender", path: "/dashboard/calendar", icon: CalendarDays },
];

// ... imports

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950 text-white h-screen flex flex-col p-4 border-r border-slate-800 shadow-xl fixed left-0 top-0">
      <div className="mb-10 px-2 mt-4 flex items-center gap-3">
        <Image
          src="/venom-logo.png"
          alt="Venom HR Logo"
          className="w-8 h-8 rounded-lg object-cover"
          width={800}
          height={800}
        />
        <h1 className="text-xl font-bold tracking-wider">VENOM  HR <span>DASHBOARD</span></h1>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {menu.map((item, index) => {
          // Logic: Dashboard must be exact match. Others can be sub-paths (e.g. /dashboard/employees/add)
          const isActive = item.path === '/dashboard'
            ? pathname === item.path
            : pathname.startsWith(item.path);

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group focus:outline-none transform-gpu hover:translate-x-1 ${isActive
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon size={20} className={`transition-all duration-300 ${isActive ? "text-white" : "group-hover:text-purple-400 group-hover:scale-110"}`} />
              <span className="font-medium text-sm">{item.name}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      {user && (
        <div className="mb-4 px-4 py-3 bg-slate-900/50 rounded-xl border border-slate-800/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold border border-purple-500/30">
            {user.image ? <img src={user.image} className="w-full h-full rounded-full" /> : user.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user.role?.toLowerCase() || 'User'}</p>
          </div>
        </div>
      )}

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-950/30 hover:text-red-400 rounded-lg transition-all duration-200 w-full text-left"
      >
        <LogOut size={20} />
        <span className="font-medium text-sm">Logout</span>
      </button>
    </aside>
  );
}
