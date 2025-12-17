'use client';

import { deleteKpiCriteria } from "@/app/actions/kpi";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import ConfirmModal from "@/components/ui/ConfirmDeleteModal";

export default function DeleteKpiButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    const result = await deleteKpiCriteria(id);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
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
            {error && (
              <p className="mt-2 text-sm text-red-500">
                {error}
              </p>
            )}
          </>
        }
        confirmText="Delete KPI"
        loading={loading}
        onCancel={() => {
          setError(null);
          setOpen(false);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}
