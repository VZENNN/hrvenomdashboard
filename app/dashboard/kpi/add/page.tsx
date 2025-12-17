import { prisma } from "@/lib/prisma";
import AddKpiForm from "@/components/forms/AddKpiForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AddKpiPage() {
    const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/kpi" className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800">
                    <ArrowLeft />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tambah KPI Baru</h1>
                    <p className="text-slate-500 text-sm">Buat kriteria penilaian baru.</p>
                </div>
            </div>

            <AddKpiForm departments={departments} />
        </div>
    );
}
