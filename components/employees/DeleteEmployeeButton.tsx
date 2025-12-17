'use client';

import { deleteEmployee } from "@/app/actions/employees";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function DeleteEmployeeButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this employee? This action cannot be undone.")) return;

        setLoading(true);
        await deleteEmployee(id);
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
