import { prisma } from "@/lib/prisma";
import AddEmployeeForm from "@/components/forms/AddEmployeeForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";

export default async function AddEmployeePage() {
    const session = await auth();
    let departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });

    // RBAC: Filter Departments for Manager
    if (session?.user?.role === 'MANAGER') {
        const allowedDeptIds = [
            session.user.departmentId,
            ...(session.user.managedDepartmentIds || []) // Typescript might complain pending generation
        ].filter(Boolean) as string[];

        departments = departments.filter(d => allowedDeptIds.includes(d.id));
    }

    const managers = await prisma.user.findMany({
        where: { role: { in: ['MANAGER', 'ADMIN'] }, status: 'ACTIVE' },
        orderBy: { name: 'asc' }
    });

    // Optional: Filter Managers too? 
    // Usually Managers assign themselves or no one.
    // If Manager is creating, they likely assign themselves or someone in their structure.
    // Let's leave managers list as is for now, or filter to only THEMSELVES if they cannot assign others?
    // Requirement says: "if a Manager creates an employee, the employee is automatically assigned to the Manager's department."
    // It implies Manager is the manager? Or allows picking?
    // If we strict assigning Dept, the direct manager might be the creating Manager themselves.
    // Let's filter managers list to just the current user if role is Manager?
    // Decision: Keep managers list open or restricted? 
    // Let's restrict: Managers can only select themselves as manager? 
    // Or maybe other managers in the same department?
    // Simplest: Left as is (all managers), but Dept is restricted.

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
