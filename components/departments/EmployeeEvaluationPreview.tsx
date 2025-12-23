'use client';

import { TrendingUp, TrendingDown, Minus, ChevronRight, Award, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import { getDepartmentWithEmployees } from '@/app/actions/departmentDetails';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis } from 'recharts';

// Derive employee type from the department data
type DepartmentData = Awaited<ReturnType<typeof getDepartmentWithEmployees>>;
type EmployeeType = NonNullable<DepartmentData>['users'][number];

interface EmployeeEvaluationPreviewProps {
    employee: EmployeeType;
    isExpanded: boolean;
    onToggle: () => void;
}

const getGrade = (score: number) => {
    if (score <= 1.50) return { label: 'Poor', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dotColor: '#ef4444' }; // red-500
    if (score <= 2.50) return { label: 'Unsatisfactory', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', dotColor: '#f97316' }; // orange-500
    if (score <= 3.50) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', dotColor: '#eab308' }; // yellow-500
    if (score <= 4.50) return { label: 'Good', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dotColor: '#3b82f6' }; // blue-500
    return { label: 'Excellent', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dotColor: '#10b981' }; // emerald-500
};

const getTrend = (evaluations: EmployeeType['evaluations']) => {
    if (evaluations.length < 2) return null;
    const diff = evaluations[0].finalScore - evaluations[1].finalScore;
    if (diff > 0.1) return { icon: TrendingUp, color: 'text-emerald-500', label: 'Improving' };
    if (diff < -0.1) return { icon: TrendingDown, color: 'text-red-500', label: 'Declining' };
    return { icon: Minus, color: 'text-slate-400', label: 'Stable' };
};

const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function EmployeeEvaluationPreview({
    employee,
    isExpanded,
    onToggle
}: EmployeeEvaluationPreviewProps) {
    const latestEval = employee.evaluations[0];
    const trend = getTrend(employee.evaluations);
    const grade = latestEval ? getGrade(latestEval.finalScore) : null;

    // Prepare chart data
    const chartData = employee.evaluations.slice().reverse().map(ev => ({
        month: monthNames[ev.month],
        score: ev.finalScore,
        fullDate: `${monthNames[ev.month]} ${ev.year}`
    }));

    return (
        <div className="group">
            {/* Employee Row */}
            <button
                onClick={onToggle}
                className={`
                    w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300
                    ${isExpanded
                        ? 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 shadow-md'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }
                `}
            >
                {/* Avatar */}
                <div className={`
                    relative w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg
                    bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-200 dark:shadow-purple-900/30
                    transform transition-transform duration-300 ${isExpanded ? 'scale-110' : 'group-hover:scale-105'}
                `}>
                    {employee.avatarUrl ? (
                        <img src={employee.avatarUrl} alt={employee.name} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                        employee.name.charAt(0).toUpperCase()
                    )}
                    {/* Status indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${employee.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                </div>

                {/* Info */}
                <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">{employee.name}</span>
                        {trend && (
                            <trend.icon size={14} className={trend.color} />
                        )}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{employee.position}</div>
                    <div className="text-xs text-slate-400 font-mono">{employee.employeeId}</div>
                </div>

                {/* Score Preview */}
                {latestEval && grade ? (
                    <div className="text-right">
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                            {latestEval.finalScore.toFixed(1)}
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${grade.color}`}>
                            {grade.label}
                        </span>
                    </div>
                ) : (
                    <div className="text-right">
                        <span className="text-xs text-slate-400 italic">No evaluation</span>
                    </div>
                )}

                {/* Chevron */}
                <ChevronRight
                    size={20}
                    className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                />
            </button>

            {/* Expanded Evaluation History */}
            {isExpanded && (
                <div className="mt-2 ml-16 mr-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                    {employee.evaluations.length === 0 ? (
                        <div className="text-center py-6 text-slate-400">
                            <Award size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Belum ada data evaluasi</p>
                        </div>
                    ) : (
                        <>
                            {/* Recharts Implementation */}
                            <div className="h-32 w-full mt-2 mb-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                                        />
                                        <YAxis
                                            hide
                                            domain={[0, 5]}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-slate-900 text-white text-xs rounded-lg px-2 py-1 shadow-xl">
                                                            <div className="font-bold">{data.score.toFixed(2)}</div>
                                                            <div className="text-slate-400 text-[10px]">{data.fullDate}</div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={getGrade(entry.score).dotColor} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Recent Evaluations List */}
                            <div className="space-y-2">
                                {employee.evaluations.slice(0, 3).map(ev => {
                                    const gradeInfo = getGrade(ev.finalScore);
                                    return (
                                        <div
                                            key={ev.id}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm"
                                        >
                                            <div className={`w-2 h-2 rounded-full ${gradeInfo.dotColor}`} />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar size={12} className="text-slate-400" />
                                                    <span className="font-medium text-slate-700 dark:text-slate-200">
                                                        {monthNames[ev.month]} {ev.year}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-slate-900 dark:text-white">{ev.finalScore.toFixed(2)}</span>
                                            </div>
                                            <Link
                                                href={`/dashboard/evaluation/${ev.id}`}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition"
                                            >
                                                <Eye size={14} />
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>

                            {employee.evaluations.length > 3 && (
                                <Link
                                    href={`/dashboard/evaluation?userId=${employee.id}`}
                                    className="block text-center text-sm text-purple-600 hover:text-purple-700 font-medium py-2"
                                >
                                    Lihat semua ({employee.evaluations.length}) evaluasi →
                                </Link>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
