'use client';

import { deleteEvaluation } from "@/app/actions/evaluations";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmDeleteModal";

interface Props {
    id: string;
}

export default function DeleteEvaluationButton({ id }: Props) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const result = await deleteEvaluation(id);
            if (result?.error) {
                toast.error(result.error);
                setLoading(false);
                return;
            }
            toast.success("Evaluation deleted successfully");
            setOpen(false);
        } catch (error) {
            toast.error("An unexpected error occurred");
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                disabled={loading}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                title="Delete evaluation"
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>

            <ConfirmModal
                open={open}
                title="Delete Evaluation"
                description="Are you sure you want to delete this evaluation? This action cannot be undone."
                loading={loading}
                onCancel={() => setOpen(false)}
                onConfirm={handleDelete}
                confirmText="Delete"
            />
        </>
    );
}
