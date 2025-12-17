
import { prisma } from "@/lib/prisma";
import EditEmployeeForm from "@/components/forms/EditEmployeeForm";
import { notFound } from "next/navigation";
import { getEmployeeById } from "@/app/actions/employees";

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getEmployeeById(id);
    if (!user) return notFound();

    const departments = await prisma.department.findMany();
    const managers = await prisma.user.findMany({
        where: { NOT: { id: user.id } }, // Prevent selecting self as manager
        select: { id: true, name: true, position: true }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Employee</h1>
                    <p className="text-slate-500 text-sm">Update employee information.</p>
                </div>
            </div>

            <EditEmployeeForm user={user} departments={departments} managers={managers} />
        </div>
    );
}
