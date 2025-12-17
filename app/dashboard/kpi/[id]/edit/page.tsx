import { prisma } from "@/lib/prisma";
import EditKpiForm from "@/components/forms/EditKpiForm";
import { notFound } from "next/navigation";
import { getKpiById } from "@/app/actions/kpi";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditKpiPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const kpi = await getKpiById(id);

    if (!kpi) return notFound();

    const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/kpi" className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800">
                    <ArrowLeft />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit KPI</h1>
                    <p className="text-slate-500 text-sm">Perbarui kriteria penilaian.</p>
                </div>
            </div>

            <EditKpiForm kpi={kpi} departments={departments} />
        </div>
    );
}
