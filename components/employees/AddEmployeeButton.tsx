"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Role } from "@prisma/client";

interface AddEmployeeButtonProps {
    userRole?: string;
}

export default function AddEmployeeButton({ userRole }: AddEmployeeButtonProps) {
    const isAdmin = userRole === "ADMIN";

    const handleUnauthorizedClick = () => {
        toast.error("You do not have permission to add employees. Only Admins can perform this action.");
    };

    if (isAdmin) {
        return (
            <Link
                href="/dashboard/employees/add"
                className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl group"
            >
                <Plus size={18} className="transition-transform group-hover:rotate-90" /> Add Employee
            </Link>
        );
    }

    return (
        <button
            onClick={handleUnauthorizedClick}
            className="bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400 px-4 py-2 rounded-lg flex items-center gap-2 font-medium cursor-not-allowed opacity-80"
        >
            <Plus size={18} /> Add Employee
        </button>
    );
}
