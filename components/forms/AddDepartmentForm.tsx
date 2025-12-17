'use client';

import { useState } from 'react';
import { createDepartment } from '@/app/actions/departments';
import { Loader2, Save } from 'lucide-react';

export default function AddDepartmentForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const res = await createDepartment(formData);

        if (res?.error) {
            setError(res.error);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">Nama Departemen <span className="text-red-500">*</span></label>
                    <input
                        name="name"
                        placeholder="Contoh: IT & Digital Transformation"
                        className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Deskripsi</label>
                    <textarea
                        name="description"
                        rows={3}
                        placeholder="Deskripsi singkat tentang departemen ini..."
                        className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                    />
                </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Simpan</>}
                </button>
            </div>
        </form>
    );
}
