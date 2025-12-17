'use client';

import { deleteKpiCriteria } from "@/app/actions/kpi";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function DeleteKpiButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Yakin ingin menghapus KPI ini? Data yang sudah digunakan di evaluasi mungkin akan terpengaruh.")) return;

        setLoading(true);
        const result = await deleteKpiCriteria(id);
        if (result?.error) {
            alert(result.error);
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-red-600 transition disabled:opacity-50"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
    );
}
