
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus, Search as SearchIcon, Eye } from 'lucide-react';

import Pagination from '@/components/ui/Pagination';
import Search from '@/components/ui/Search';
import MonthFilter from '@/components/evaluation/MonthFilter';

export default async function EvaluationListPage({ searchParams }: {
    searchParams: Promise<{
        page?: string;
        month?: string;
    }>;
}) {
    const params = await searchParams;
    const currentPage = Number(params?.page) || 1;
    const itemsPerPage = 10;

    const monthFilter = params?.month ? Number(params.month) : null;

    const where = monthFilter
    ? { month: monthFilter }
    : {};


    const totalItems = await prisma.evaluation.count({ where });
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const evaluations = await prisma.evaluation.findMany({
        where,
        include: {
            user: { include: { department: true } },
            appraiser: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage
    });

    const getGrade = (score: number) => {
        if (score <= 1.50) return { label: 'Poor', color: 'bg-red-100 text-red-700' };
        if (score <= 2.50) return { label: 'Unsatisfactory', color: 'bg-orange-100 text-orange-700' };
        if (score <= 3.50) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-700' };
        if (score <= 4.50) return { label: 'Good', color: 'bg-blue-100 text-blue-700' };
        return { label: 'Very Good', color: 'bg-green-100 text-green-700' };
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Evaluations</h1>
                    <p className="text-slate-500 text-sm">Track and manage employee assessments.</p>
                </div>
                <Link
                    href="/dashboard/evaluation/create"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-purple-700 transition shadow-lg shadow-purple-200 dark:shadow-none"
                >
                    <Plus size={18} /> New Evaluation
                </Link>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <MonthFilter />
                </div>

            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <th className="p-4 font-semibold text-sm text-slate-500">Employee</th>
                            <th className="p-4 font-semibold text-sm text-slate-500">Period</th>
                            <th className="p-4 font-semibold text-sm text-slate-500">Score</th>
                            <th className="p-4 font-semibold text-sm text-slate-500">Grade</th>
                            <th className="p-4 font-semibold text-sm text-slate-500">Appraiser</th>
                            <th className="p-4 font-semibold text-sm text-slate-500 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {evaluations.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    No evaluations data found.
                                </td>
                            </tr>
                        ) : (
                            evaluations.map(ev => {
                                const grade = getGrade(ev.finalScore);
                                return (
                                    <tr key={ev.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900 dark:text-white">{ev.user.name}</div>
                                            <div className="text-xs text-slate-400">{ev.user.position}</div>
                                        </td>
                                        <td className="p-4 font-mono text-sm">
                                            {ev.month}/{ev.year}
                                        </td>
                                        <td className="p-4 font-bold text-slate-700 dark:text-slate-200">
                                            {ev.finalScore.toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${grade.color}`}>
                                                {grade.label}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">
                                            {ev.appraiser.name}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                href={`/dashboard/evaluation/${ev.id}`}
                                                className="p-2 text-slate-400 hover:text-purple-600 transition inline-block"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && <Pagination totalPages={totalPages} />}
        </div>
    );
}
