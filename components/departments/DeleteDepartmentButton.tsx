'use client';

import { deleteDepartment } from "@/app/actions/departments";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmDeleteModal";

interface Props {
    id: string;
    employeeCount: number;
}

export default function DeleteDepartmentButton({ id, employeeCount }: Props) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const result = await deleteDepartment(id);
            if (result?.error) {
                toast.error(result.error);
                setLoading(false);
                return;
            }
            toast.success("Department deleted successfully");
            setOpen(false);
        } catch (error) {
            toast.error("An unexpected error occurred");
            console.error(error);
            setLoading(false);
        }
    };

    const handleOpen = () => {
        if (employeeCount > 0) {
            toast.warning(`Cannot delete department with ${employeeCount} active employees.`);
            return;
        }
        setOpen(true);
    };

    return (
        <>
            <button
                onClick={handleOpen}
                disabled={loading || employeeCount > 0}
                className={`p-2 transition disabled:opacity-50 ${employeeCount > 0
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-400 hover:text-red-600'
                    }`}
                title={employeeCount > 0 ? `Cannot delete (${employeeCount} employees)` : 'Delete department'}
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            </button>

            <ConfirmModal
                open={open}
                title="Delete Department"
                description="Are you sure you want to delete this department? This action cannot be undone."
                loading={loading}
                onCancel={() => setOpen(false)}
                onConfirm={handleDelete}
            />
        </>
    );
}
