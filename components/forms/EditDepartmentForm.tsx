'use client';

import { useState } from 'react';
import { updateDepartment } from '@/app/actions/departments';
import { Department } from '@prisma/client';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
    department: Department;
}

export default function EditDepartmentForm({ department }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const res = await updateDepartment(department.id, formData);

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
                        defaultValue={department.name}
                        className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Deskripsi</label>
                    <textarea
                        name="description"
                        rows={3}
                        defaultValue={department.description || ''}
                        className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-600"
                    />
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
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Update</>}
                </button>
            </div>
        </form>
    );
}
