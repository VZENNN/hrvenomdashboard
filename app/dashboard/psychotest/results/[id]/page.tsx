import { getPsychotestResultById } from "@/app/actions/psychotest";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getPsychotestResultById(id);

    if (!result) {
        return <div className="p-8">Result not found</div>;
    }

    const answers = result.answers as Record<string, any>;
    const questions = result.category.questions;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Link href="/dashboard/psychotest/results" className="inline-flex items-center text-slate-500 hover:text-slate-900">
                <ArrowLeft size={16} className="mr-1" /> Back to Results
            </Link>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border">
                <div className="flex justify-between items-start mb-6 border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold">{result.user.name}</h1>
                        <p className="text-slate-500">{result.category.name}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-500">Submitted</div>
                        <div className="font-medium">{new Date(result.createdAt).toLocaleString()}</div>
                    </div>
                </div>

                <div className="space-y-8">
                    {questions.map((q, idx) => {
                        const answer = answers[q.id];
                        return (
                            <div key={q.id} className="border-b last:border-0 pb-6 last:pb-0">
                                <div className="flex gap-4">
                                    <div className="flex-none font-bold text-slate-400 text-lg">Q{idx + 1}</div>
                                    <div className="flex-1 space-y-3">
                                        <div className="font-medium text-lg">{q.content}</div>
                                        {q.image && (
                                            <div className="h-32 w-auto bg-slate-100 dark:bg-slate-900 rounded overflow-hidden inline-block">
                                                <img src={q.image} className="h-full object-contain" alt="Question" />
                                            </div>
                                        )}

                                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
                                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Applicant Answer</div>
                                            <div className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                                                {q.type === 'MULTIPLE_CHOICE' ? (
                                                    answer || <span className="text-red-500 italic">No Answer</span>
                                                ) : q.type === 'MOST_AND_LEAST' ? (
                                                    answer && typeof answer === 'object' && 'most' in answer ? (
                                                        <table className="w-full border-collapse text-sm">
                                                            <thead>
                                                                <tr className="bg-slate-100 dark:bg-slate-700">
                                                                    <th className="border p-2 text-center w-20">Mirip</th>
                                                                    <th className="border p-2 text-center w-20">Tidak Mirip</th>
                                                                    <th className="border p-2 text-left">Pernyataan</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {(q.options as { label: string; text: string }[] | null)?.map((opt) => (
                                                                    <tr key={opt.label} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                                        <td className="border p-2 text-center">
                                                                            {answer.most === opt.label && <span className="text-green-600 font-bold">✓</span>}
                                                                        </td>
                                                                        <td className="border p-2 text-center">
                                                                            {answer.least === opt.label && <span className="text-red-600 font-bold">✓</span>}
                                                                        </td>
                                                                        <td className="border p-2">
                                                                            <span className="font-bold text-slate-500 mr-2">{opt.label}.</span>
                                                                            {opt.text}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : <span className="text-red-500 italic">No Answer</span>
                                                ) : (
                                                    answer || <span className="text-red-500 italic">No Answer</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
