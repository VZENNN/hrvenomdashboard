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
  NotebookPen,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Departemen", path: "/dashboard/departments", icon: Building2 },
  { name: "Karyawan", path: "/dashboard/employees", icon: Users },
  { name: "Kelola KPI", path: "/dashboard/kpi", icon: Target },
  { name: "Penilaian", path: "/dashboard/evaluation", icon: NotebookPen },
  { name: "Psikotes", path: "/dashboard/psychotest", icon: BrainCircuit },
  { name: "Struktur Organisasi", path: "/dashboard/organization", icon: Network },
  { name: "Kalender", path: "/dashboard/calendar", icon: CalendarDays },
];

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    id?: string;
  };
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export default function Sidebar({ user, isOpen, isCollapsed, onClose, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  // Filter menu based on role
  const isEmployee = user?.role === 'EMPLOYEE';
  const isSupervisor = user?.role === 'SUPERVISOR';
  const isManager = user?.role === 'MANAGER';

  let displayedMenu = menu;

  if (isEmployee) {
    displayedMenu = [
      { name: "Kalender", path: "/dashboard/calendar", icon: CalendarDays },
      { name: "My Evaluation", path: `/dashboard/employees/${user?.id}`, icon: NotebookPen },
    ];
  }

  if (isSupervisor) {
    displayedMenu = [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Karyawan", path: "/dashboard/employees", icon: Users },
      { name: "Penilaian", path: "/dashboard/evaluation", icon: NotebookPen },
      { name: "Kalender", path: "/dashboard/calendar", icon: CalendarDays },
    ]
  }

  if (isManager) {
    displayedMenu = displayedMenu.filter(item =>
      item.name !== 'Psikotes' && item.name !== 'Kelola KPI'
    );
  }

  const handleNavClick = () => {
    // On mobile, close the sidebar after clicking a nav item
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen z-40
          bg-slate-950 text-white flex flex-col
          border-r border-slate-800 shadow-xl
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-[72px]' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header / Logo */}
        <div className="mb-6 px-3 mt-4 flex items-center gap-3 relative min-h-[48px]">
          <Image
            src="/venom-logo.png"
            alt="Venom HR Logo"
            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
            width={800}
            height={800}
          />
          {!isCollapsed && (
            <h1 className="text-xl font-bold tracking-wider whitespace-nowrap overflow-hidden">
              VENOM <span>HR DASHBOARD</span>
            </h1>
          )}

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="absolute right-2 top-0 p-1 text-slate-400 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Menu */}
        <nav className="flex flex-col gap-1 flex-1 px-2 overflow-y-auto">
          {displayedMenu.map((item, index) => {
            const isActive = item.path === '/dashboard'
              ? pathname === item.path
              : pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={handleNavClick}
                title={isCollapsed ? item.name : undefined}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 group
                  focus:outline-none transform-gpu hover:translate-x-1
                  ${isCollapsed ? 'justify-center' : ''}
                  ${isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                  }
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <item.icon
                  size={20}
                  className={`flex-shrink-0 transition-all duration-300 ${isActive ? "text-white" : "group-hover:text-purple-400 group-hover:scale-110"}`}
                />
                {!isCollapsed && (
                  <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
                    {item.name}
                  </span>
                )}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        {user && (
          <div className={`mx-2 mb-2 px-2 py-3 bg-slate-900/50 rounded-xl border border-slate-800/50 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold border border-purple-500/30 flex-shrink-0">
              {user.image ? <img src={user.image} className="w-full h-full rounded-full" alt={user.name ?? ''} /> : user.name?.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user.role?.toLowerCase() || 'User'}</p>
              </div>
            )}
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          title={isCollapsed ? "Logout" : undefined}
          className={`flex items-center gap-3 px-4 py-3 mx-2 mb-2 text-slate-400 hover:bg-red-950/30 hover:text-red-400 rounded-lg transition-all duration-200 w-[calc(100%-16px)] text-left ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>

        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-purple-600 hover:border-purple-500 transition-all duration-200 absolute -right-3 top-1/2 -translate-y-1/2 z-50 shadow-md"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
}
