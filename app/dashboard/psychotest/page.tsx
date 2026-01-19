import { getPsychotestCategories } from "@/app/actions/psychotest";
import Link from "next/link";
import { Plus, List, Settings, FileText } from "lucide-react";

export default async function PsychotestDashboardPage() {
    const categories = await getPsychotestCategories();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Psychotest Management</h1>
                <Link href="/dashboard/psychotest/categories/new">
                    <button className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2">
                        <Plus size={16} /> New Category
                    </button>
                </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <List size={20} /> Active Categories
                    </h2>
                    <div className="grid gap-4">
                        {categories.map(cat => (
                            <div key={cat.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border shadow-sm flex justify-between items-center group">
                                <div>
                                    <h3 className="font-medium text-lg">{cat.name}</h3>
                                    <p className="text-sm text-slate-500">{cat.questions.length} Questions • {cat.timeLimit}s • Order: {cat.order}</p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/dashboard/psychotest/questions?category=${cat.id}`}>
                                        <button className="text-sm border px-3 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                                            Manage Questions
                                        </button>
                                    </Link>
                                    <Link href={`/dashboard/psychotest/categories/${cat.id}/edit`}>
                                        <button className="text-sm border px-3 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                                            Edit
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed">
                                No categories found. Create one to start.
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Settings size={20} /> Quick Actions
                    </h2>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border shadow-sm space-y-2">
                        <Link href="/dashboard/psychotest/results" className="block">
                            <button className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded flex items-center gap-3">
                                <FileText size={18} /> View Applicant Results
                            </button>
                        </Link>
                        {/* More actions... */}
                    </div>
                </div>
            </div>
        </div>
    );
}
