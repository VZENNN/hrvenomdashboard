'use client';

import { useState } from 'react';
import { updateKpiCriteria } from '@/app/actions/kpi';
import { Department, KpiCriteria, KpiType } from '@prisma/client';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

interface Props {
    kpi: KpiCriteria & { department: Department | null };
    departments: Department[];
}

export default function EditKpiForm({ kpi, departments }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const res = await updateKpiCriteria(kpi.id, formData);

        if (res?.error) {
            toast.error(res.error);
            setError(res.error);
            setLoading(false);
        } else {
            toast.success("KPI berhasil diperbarui");
            router.back();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">Kategori <span className="text-red-500">*</span></label>
                    <input
                        name="category"
                        defaultValue={kpi.category}
                        className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Judul KPI <span className="text-red-500">*</span></label>
                    <input
                        name="title"
                        defaultValue={kpi.title}
                        className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Deskripsi</label>
                    <textarea
                        name="description"
                        rows={3}
                        defaultValue={kpi.description || ''}
                        className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Tipe KPI <span className="text-red-500">*</span></label>
                        <select name="type" defaultValue={kpi.type} className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600" required>
                            <option value={KpiType.BEHAVIORAL}>Perilaku (Behavioral)</option>
                            <option value={KpiType.TECHNICAL}>Teknis (Technical/KPI)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Bobot Default (%)</label>
                        <input
                            name="defaultWeight"
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={kpi.defaultWeight}
                            className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Departemen</label>
                        <select name="departmentId" defaultValue={kpi.departmentId || ''} className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600">
                            <option value="">-- Semua Departemen --</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Posisi/Jabatan</label>
                        <input
                            name="position"
                            defaultValue={kpi.position || ''}
                            className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-100 transition"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Update KPI</>}
                </button>
            </div>
        </form>
    );
}
