import { getPsychotestCategories, getQuestionsByCategory, deletePsychotestQuestion } from "@/app/actions/psychotest";
import Link from "next/link";
import { Plus, Trash2, Pencil } from "lucide-react";
import { redirect } from "next/navigation";

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const categories = await getPsychotestCategories();
    const { category: selectedCategoryId } = await searchParams;

    // If no category selected, just stay

    // Fetch questions only if category is selected
    const questions = selectedCategoryId ? await getQuestionsByCategory(selectedCategoryId) : [];
    const selectedCategory = categories.find(c => c.id === selectedCategoryId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Questions Management</h1>
                {selectedCategoryId && (
                    <Link href={`/dashboard/psychotest/questions/new?category=${selectedCategoryId}`}>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2">
                            <Plus size={16} /> Add Question
                        </button>
                    </Link>
                )}
            </div>

            {/* Category Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.length === 0 && <span className="text-sm text-slate-500">No categories found. Create one first.</span>}
                {categories.map(cat => (
                    <Link key={cat.id} href={`/dashboard/psychotest/questions?category=${cat.id}`}>
                        <button className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap ${cat.id === selectedCategoryId
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}>
                            {cat.name}
                        </button>
                    </Link>
                ))}
            </div>

            {!selectedCategoryId ? (
                <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed">
                    Select a category above to view and manage questions.
                </div>
            ) : (
                <div className="grid gap-4">
                    {questions.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed">
                            No questions in this category yet.
                        </div>
                    ) : (
                        questions.map((q, idx) => (
                            <div key={q.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border shadow-sm flex gap-4">
                                <div className="flex-none font-bold text-slate-400">#{idx + 1}</div>
                                {q.image && (
                                    <div className="flex-none w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded overflow-hidden relative">
                                        <img src={q.image} alt="Question" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <p className="font-medium whitespace-pre-wrap">{q.content}</p>
                                        <div className="flex gap-1">
                                            <Link href={`/dashboard/psychotest/questions/${q.id}/edit`}>
                                                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200">
                                                    <Pencil size={16} />
                                                </button>
                                            </Link>
                                            <form action={async () => {
                                                "use server"
                                                await deletePsychotestQuestion(q.id);
                                            }}>
                                                <button className="p-2 text-slate-400 hover:text-red-600 transition disabled:opacity-50">
                                                    <Trash2 size={16} />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-xs text-slate-500 uppercase tracking-tighter">
                                        <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{q.type}</span>
                                        {q.options && (
                                            <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                                {(q.options as any[]).length} Options
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
