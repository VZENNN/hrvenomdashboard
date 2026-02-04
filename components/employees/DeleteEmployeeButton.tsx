'use client';

import { deleteEmployee } from "@/app/actions/employees";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import ConfirmModal from "@/components/ui/ConfirmDeleteModal";

export default function DeleteEmployeeButton({ id, userRole }: { id: string; userRole?: string }) {
  // Only Admin and Manager can delete
  if (userRole !== 'ADMIN' && userRole !== 'MANAGER') return null;
  // Actually, typically only ADMIN reduces risk. But USER said "Assign dept to manager...". 
  // Let's stick to: SUPERVISOR cannot delete.
  // Manager can delete? Prompt didn't explicitly forbid, but usually Managers can manage their own team.
  // Let's allow Manager for now as per `app/actions/employees.ts` logic (Line 145: "Admin or Manager").

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteEmployee(id);

      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      toast.success("Employee deleted successfully");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to delete employee");
      console.error(error);
    } finally {
      if (open) setLoading(false); // Only unset loading if modal is still open (on error), otherwise component might unmount or page navigates
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
        title="Delete Employee"
        description={`Are you sure you want to delete this employee?\nThis action cannot be undone.`}
        loading={loading}
        onCancel={() => setOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
