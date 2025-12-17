'use client';

import { deleteEmployee } from "@/app/actions/employees";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import ConfirmModal from "@/components/ui/ConfirmDeleteModal";

export default function DeleteEmployeeButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteEmployee(id);
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
        title="Delete Employee"
        description={`Are you sure you want to delete this employee?\nThis action cannot be undone.`}
        loading={loading}
        onCancel={() => setOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
