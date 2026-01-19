'use client'

import { createPsychotestCategory } from "@/app/actions/psychotest";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCategoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError("");

        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const timeLimit = parseInt(formData.get("timeLimit") as string);
        const order = parseInt(formData.get("order") as string);

        try {
            await createPsychotestCategory({
                name,
                description,
                timeLimit,
                order
            });
            router.push("/dashboard/psychotest");
        } catch (e) {
            setError("Failed to create category. Check inputs.");
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Category</h1>

            <form action={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border space-y-4">
                {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

                <div>
                    <label className="block text-sm font-medium mb-1">Category Name</label>
                    <input name="name" required className="w-full border rounded p-2 bg-transparent" placeholder="e.g. Logical Reasoning" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                    <textarea name="description" className="w-full border rounded p-2 bg-transparent" rows={3} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Time Limit (Seconds)</label>
                        <input name="timeLimit" type="number" required min="10" defaultValue="60" className="w-full border rounded p-2 bg-transparent" />
                        <p className="text-xs text-slate-500 mt-1">Total time for this section.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Sequence Order</label>
                        <input name="order" type="number" required defaultValue="1" className="w-full border rounded p-2 bg-transparent" />
                        <p className="text-xs text-slate-500 mt-1">Order in which user takes test.</p>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50">
                        {loading ? "Creating..." : "Create Category"}
                    </button>
                </div>
            </form>
        </div>
    );
}
