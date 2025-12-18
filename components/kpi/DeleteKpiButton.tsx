'use client';

import { deleteKpiCriteria } from "@/app/actions/kpi";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import ConfirmModal from "@/components/ui/ConfirmDeleteModal";

export default function DeleteKpiButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    // setError(null); // No longer needed with toast

    try {
      const result = await deleteKpiCriteria(id);

      if (result?.error) {
        toast.error(result.error);
        // setError(result.error);
        return;
      }

      toast.success("KPI deleted successfully");
      setOpen(false);
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={loading}
        className="p-2 text-slate-400 hover:text-red-600 transition disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}
      </button>

      <ConfirmModal
        open={open}
        title="Delete KPI"
        description={
          <>
            <p>Yakin ingin menghapus KPI ini?</p>
            <p className="text-red-600 font-medium">
              Data yang sudah digunakan di evaluasi mungkin akan terpengaruh.
            </p>
          </>
        }
        confirmText="Delete KPI"
        loading={loading}
        onCancel={() => setOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
