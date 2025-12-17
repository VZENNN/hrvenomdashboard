import { prisma } from "@/lib/prisma";
import EditEmployeeForm from "@/components/forms/EditEmployeeForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  const employee = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!employee) {
    return <div>Employee not found</div>;
  }

  const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });
  const managers = await prisma.user.findMany({
    where: { role: { in: ["MANAGER", "ADMIN"] }, status: "ACTIVE" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/employees" className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Employee</h1>
          <p className="text-slate-500 text-sm">Update employee information.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm">
        <EditEmployeeForm
          employee={employee}
          departments={departments}
          managers={managers}
        />
      </div>
    </div>
  );
}
