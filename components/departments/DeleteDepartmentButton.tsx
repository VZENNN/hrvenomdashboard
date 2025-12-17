'use client';

import { deleteDepartment } from "@/app/actions/departments";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
    id: string;
    employeeCount: number;
}

export default function DeleteDepartmentButton({ id, employeeCount }: Props) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (employeeCount > 0) {
            alert(`Tidak bisa menghapus departemen ini karena masih ada ${employeeCount} karyawan yang terdaftar.`);
            return;
        }

        if (!confirm("Yakin ingin menghapus departemen ini?")) return;

        setLoading(true);
        const result = await deleteDepartment(id);
        if (result?.error) {
            alert(result.error);
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className={`p-2 transition disabled:opacity-50 ${employeeCount > 0
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-400 hover:text-red-600'
                }`}
            title={employeeCount > 0 ? `Tidak bisa dihapus (${employeeCount} karyawan)` : 'Hapus departemen'}
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
    );
}
