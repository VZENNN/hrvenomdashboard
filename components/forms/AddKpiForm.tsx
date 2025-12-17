'use client';

import { useState } from 'react';
import { createKpiCriteria } from '@/app/actions/kpi';
import { Department, KpiType } from '@prisma/client';
import { Loader2, Save } from 'lucide-react';

interface Props {
    departments: Department[];
}

export default function AddKpiForm({ departments }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const res = await createKpiCriteria(formData);

        if (res?.error) {
            setError(res.error);
            setLoading(false);
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
                        placeholder="Contoh: Kedisiplinan, Sales Target"
                        className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Judul KPI <span className="text-red-500">*</span></label>
                    <input
                        name="title"
                        placeholder="Contoh: Kehadiran Tepat Waktu"
                        className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Deskripsi</label>
                    <textarea
                        name="description"
                        rows={3}
                        placeholder="Penjelasan detail tentang KPI ini..."
                        className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Tipe KPI <span className="text-red-500">*</span></label>
                        <select name="type" className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600" required>
                            <option value={KpiType.BEHAVIORAL}>Perilaku (Behavioral)</option>
                            <option value={KpiType.TECHNICAL}>Teknis (Technical/KPI)</option>
                        </select>
                        <p className="text-xs text-slate-400 mt-1">Perilaku = sama semua karyawan, Teknis = per departemen</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Bobot Default (%)</label>
                        <input
                            name="defaultWeight"
                            type="number"
                            min="0"
                            max="100"
                            defaultValue="0"
                            className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Departemen</label>
                        <select name="departmentId" className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600">
                            <option value="">-- Semua Departemen --</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-400 mt-1">Kosongkan jika berlaku untuk semua</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Posisi/Jabatan</label>
                        <input
                            name="position"
                            placeholder="Contoh: Staff, Manager"
                            className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                        />
                        <p className="text-xs text-slate-400 mt-1">Kosongkan jika berlaku semua posisi</p>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Simpan KPI</>}
                </button>
            </div>
        </form>
    );
}
