import EditDepartmentForm from "@/components/forms/EditDepartmentForm";
import { notFound } from "next/navigation";
import { getDepartmentById } from "@/app/actions/departments";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditDepartmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const department = await getDepartmentById(id);

    if (!department) return notFound();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/departments" className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800">
                    <ArrowLeft />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Departemen</h1>
                    <p className="text-slate-500 text-sm">Perbarui informasi departemen.</p>
                </div>
            </div>

            <EditDepartmentForm department={department} />
        </div>
    );
}
