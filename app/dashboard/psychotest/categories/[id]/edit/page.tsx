'use client';

import { getPsychotestCategoryById, updatePsychotestCategory, deletePsychotestCategory } from "@/app/actions/psychotest";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [id, setId] = useState<string>("");

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [timeLimit, setTimeLimit] = useState(60);
    const [order, setOrder] = useState(0);

    useEffect(() => {
        params.then(p => {
            setId(p.id); // store id safely
            getPsychotestCategoryById(p.id).then(category => {
                if (!category) {
                    router.push("/dashboard/psychotest");
                    return;
                }
                setName(category.name);
                setDescription(category.description || "");
                setTimeLimit(category.timeLimit);
                setOrder(category.order);
                setLoading(false);
            });
        });
    }, [params, router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            await updatePsychotestCategory(id, {
                name,
                description,
                timeLimit: Number(timeLimit),
                order: Number(order)
            });
            toast.success("Category updated");
            router.push("/dashboard/psychotest");
            router.refresh();
        } catch (error) {
            toast.error("Failed to update category");
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this category? All related questions and results will be lost.")) return;
        setSaving(true);
        try {
            await deletePsychotestCategory(id);
            toast.success("Category deleted");
            router.push("/dashboard/psychotest");
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete category");
            setSaving(false);
        }
    }

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/psychotest" className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800">
                    <ArrowLeft />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold bg-white text-slate-900 border-none dark:bg-transparent dark:text-white">Edit Category</h1>
                </div>
                <div className="ml-auto">
                    <button type="button" onClick={handleDelete} className="text-red-500 hover:bg-red-50 p-2 rounded flex items-center gap-2">
                        <Trash2 size={18} /> Delete
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 bg-white text-slate-900 border-none dark:bg-transparent dark:text-white">Category Name</label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        className="w-full border rounded p-2 bg-transparent"
                        placeholder="e.g. Logic Test"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 bg-white text-slate-900 border-none dark:bg-transparent dark:text-white">Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full border rounded p-2 bg-transparent"
                        placeholder="Optional description..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 bg-white text-slate-900 border-none dark:bg-transparent dark:text-white">Time Limit (Seconds)</label>
                        <input
                            type="number"
                            value={timeLimit}
                            onChange={e => setTimeLimit(Number(e.target.value))}
                            required
                            min="10"
                            className="w-full border rounded p-2 bg-transparent"
                        />
                        <p className="text-xs text-slate-500 mt-1">60s = 1 minute</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 bg-white text-slate-900 border-none dark:bg-transparent dark:text-white">Sequence Order</label>
                        <input
                            type="number"
                            value={order}
                            onChange={e => setOrder(Number(e.target.value))}
                            required
                            className="w-full border rounded p-2 bg-transparent"
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t">
                    <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50">
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
