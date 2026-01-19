import { getPsychotestResults, deletePsychotestResult } from "@/app/actions/psychotest";
import Link from "next/link";
import { Trash2, Eye, ArrowLeft } from "lucide-react";

export default async function ResultsPage() {
    const results = await getPsychotestResults();

    return (
        <div className="space-y-6">
            <Link href="/dashboard/psychotest" className="inline-flex items-center text-slate-500 hover:text-slate-900">
                <ArrowLeft size={16} className="mr-1" /> Back
            </Link>
            <h1 className="text-2xl font-bold">Applicant Results</h1>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow border overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                        <tr>
                            <th className="p-4 font-medium">Applicant</th>
                            <th className="p-4 font-medium">Category</th>
                            <th className="p-4 font-medium">Completed At</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {results.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500">No results found yet.</td>
                            </tr>
                        ) : (
                            results.map((res: any) => (
                                <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="p-4">
                                        <div className="font-medium text-slate-900 dark:text-slate-100">{res.user?.name}</div>
                                        <div className="text-xs text-slate-500">{res.user?.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full dark:bg-blue-900 dark:text-blue-100">
                                            {res.category?.name}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        {new Date(res.createdAt).toLocaleDateString()} {new Date(res.createdAt).toLocaleTimeString()}
                                    </td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <Link href={`/dashboard/psychotest/results/${res.id}`}>
                                            <button className="p-2 hover:bg-slate-100 rounded text-blue-600">
                                                <Eye size={18} />
                                            </button>
                                        </Link>
                                        <form action={async () => {
                                            'use server'
                                            await deletePsychotestResult(res.id);
                                        }}>
                                            <button className="p-2 hover:bg-slate-100 rounded text-red-500">
                                                <Trash2 size={18} />
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
