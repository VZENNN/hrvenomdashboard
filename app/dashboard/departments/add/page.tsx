import AddDepartmentForm from "@/components/forms/AddDepartmentForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AddDepartmentPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/departments" className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800">
                    <ArrowLeft />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tambah Departemen</h1>
                    <p className="text-slate-500 text-sm">Buat departemen baru.</p>
                </div>
            </div>

            <AddDepartmentForm />
        </div>
    );
}
