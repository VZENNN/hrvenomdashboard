"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import { Menu } from "lucide-react";

interface DashboardShellProps {
    children: React.ReactNode;
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string;
        id?: string;
    };
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // On desktop (lg+), sidebar is always "open" (visible via CSS)
    // On mobile, we control visibility via sidebarOpen state
    // Set initial collapse state based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                // Mobile: sidebar hidden by default
                setSidebarOpen(false);
                setSidebarCollapsed(false);
            } else if (window.innerWidth < 1024) {
                // Tablet: collapsed by default
                setSidebarCollapsed(true);
            } else {
                // Desktop: expanded by default
                setSidebarCollapsed(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const sidebarWidth = sidebarCollapsed ? "md:ml-[72px]" : "md:ml-64";

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
            <Sidebar
                user={user}
                isOpen={sidebarOpen}
                isCollapsed={sidebarCollapsed}
                onClose={() => setSidebarOpen(false)}
                onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
            />

            {/* Main Content */}
            <main
                className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarWidth}`}
            >
                {/* Mobile Top Bar */}
                <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-slate-950 border-b border-slate-800 shadow-sm flex-shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        aria-label="Open sidebar"
                    >
                        <Menu size={22} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-purple-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">V</span>
                        </div>
                        <span className="text-white font-semibold text-sm tracking-wide">VENOM HR</span>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
