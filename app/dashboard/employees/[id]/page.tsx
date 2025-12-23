import { getEmployeeEvaluationHistory } from '@/app/actions/employees';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, Award, Filter } from 'lucide-react';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';

export default async function EmployeeDetailsPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ year?: string; month?: string }>;
}) {
    const { id } = await params;

    // Resolve searchParams (since it is a Promise in newer Next.js versions/types)
    const sp = await searchParams;
    const currentYear = new Date().getFullYear();
    const year = Number(sp.year) || currentYear;
    const month = sp.month ? Number(sp.month) : undefined;

    const data = await getEmployeeEvaluationHistory(id, year);

    if (!data) {
        notFound();
    }

    const { user, evaluations, annualAverage } = data;

    // Filter evaluations by month if selected
    const filteredEvaluations = month
        ? evaluations.filter(e => e.month === month)
        : evaluations;

    // Helper to get month name
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/dashboard/employees" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4 transition">
                    <ArrowLeft size={16} className="mr-1" /> Back to Employees
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {user.name}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {user.status}
                            </span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">{user.position} • {user.department?.name || 'No Department'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Basic Info & Stats */}
                <div className="space-y-6">
                    {/* Annual Score Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm font-medium">
                            <Award size={16} /> Annual Performance ({year})
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="text-4xl font-bold text-slate-900 dark:text-white">
                                {annualAverage.toFixed(2)}
                            </div>
                            <div className="text-sm text-slate-400 mb-1.5">/ 5.0</div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Based on {evaluations.length} evaluation{evaluations.length !== 1 ? 's' : ''} in {year}.
                        </p>
                    </div>

                    {/* Basic Info Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <User size={16} /> Employee Details
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <div className="text-slate-500 text-xs">Employee ID</div>
                                <div className="font-medium">{user.employeeId}</div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-xs">Email</div>
                                <div className="font-medium">{user.email}</div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-xs">Joined Date</div>
                                <div className="font-medium">{user.joinDate ? new Date(user.joinDate).toLocaleDateString() : '-'}</div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-xs">Manager</div>
                                <div className="font-medium text-slate-400 italic">Not assigned</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: History & Filters */}
                <div className="md:col-span-2 space-y-6">
                    {/* Filters */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Evaluation History</h3>

                        <form className="flex gap-2">
                            {/* Hidden input to keep existing filters if any, though here we just want year/month */}

                            <select
                                name="year"
                                defaultValue={year}
                                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                            // Add automated submit on change using basic JS or keep a submit button.
                            // For simplicity in Server Components without Client Component wrapping, we need a button or use a Client Component for auto-submit.
                            // Let's simplify with a standard form + button or just standard form that requires manual submit if not using JS.
                            // Actually, standard practice for simple filters: Client Component wrapper or just standard form submit.
                            // Let's use a simple submit button for "Apply".
                            >
                                {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>

                            <select
                                name="month"
                                defaultValue={month || ""}
                                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                            >
                                <option value="">All Months</option>
                                {months.map((m, idx) => (
                                    <option key={idx} value={idx + 1}>{m}</option>
                                ))}
                            </select>

                            <button type="submit" className="px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg hover:bg-slate-800 transition">
                                Filter
                            </button>
                        </form>
                    </div>

                    {/* History List */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                    <th className="p-4 font-semibold text-sm text-slate-500">Period</th>
                                    <th className="p-4 font-semibold text-sm text-slate-500">Appraiser</th>
                                    <th className="p-4 font-semibold text-sm text-slate-500">Behavior</th>
                                    <th className="p-4 font-semibold text-sm text-slate-500">Technical</th>
                                    <th className="p-4 font-semibold text-sm text-slate-500">Final Score</th>
                                    <th className="p-4 font-semibold text-sm text-slate-500">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEvaluations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">No evaluations found for this period.</td>
                                    </tr>
                                ) : (
                                    filteredEvaluations.map(eva => (
                                        <tr key={eva.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                            <td className="p-4 font-medium text-slate-900 dark:text-white">
                                                {months[eva.month - 1]} {eva.year}
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                                {eva.appraiser?.name || 'Unknown'}
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                                {eva.behaviorScore.toFixed(2)}
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                                {eva.technicalScore.toFixed(2)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${eva.finalScore >= 4 ? 'bg-green-100 text-green-800' :
                                                        eva.finalScore >= 3 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {eva.finalScore.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-slate-400">
                                                {new Date(eva.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
