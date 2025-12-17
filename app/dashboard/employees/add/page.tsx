import { prisma } from "@/lib/prisma";
import AddEmployeeForm from "@/components/forms/AddEmployeeForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AddEmployeePage() {
    const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    const managers = await prisma.user.findMany({
        where: { role: { in: ['MANAGER', 'ADMIN'] }, status: 'ACTIVE' },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/employees" className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800">
                    <ArrowLeft />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Employee</h1>
                    <p className="text-slate-500 text-sm">Create a new user account.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <AddEmployeeForm departments={departments} managers={managers} />
            </div>
        </div>
    );
}
