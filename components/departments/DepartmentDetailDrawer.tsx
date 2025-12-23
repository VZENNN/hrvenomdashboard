'use client';

import { useState, useEffect, useTransition } from 'react';
import { Users, Target, Building2, Loader2, UserPlus, ChevronDown } from 'lucide-react';
import Drawer from '@/components/ui/Drawer';
import EmployeeEvaluationPreview from './EmployeeEvaluationPreview';
import { getDepartmentWithEmployees } from '@/app/actions/departmentDetails';
import Link from 'next/link';

type DepartmentData = Awaited<ReturnType<typeof getDepartmentWithEmployees>>;

interface DepartmentDetailDrawerProps {
    departmentId: string | null;
    departmentName: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function DepartmentDetailDrawer({
    departmentId,
    departmentName,
    isOpen,
    onClose
}: DepartmentDetailDrawerProps) {
    const [department, setDepartment] = useState<DepartmentData>(null);
    const [isPending, startTransition] = useTransition();
    const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);

    // Fetch department data when drawer opens
    useEffect(() => {
        if (isOpen && departmentId) {
            startTransition(async () => {
                const data = await getDepartmentWithEmployees(departmentId);
                setDepartment(data);
                setExpandedEmployeeId(null); // Reset expanded state
            });
        }
    }, [isOpen, departmentId]);

    const handleToggleEmployee = (employeeId: string) => {
        setExpandedEmployeeId(prev => prev === employeeId ? null : employeeId);
    };

    // Calculate stats
    const totalEmployees = department?.users.length || 0;
    const employeesWithEval = department?.users.filter(u => u.evaluations.length > 0).length || 0;
    const avgScore = department?.users.reduce((acc, u) => {
        if (u.evaluations.length > 0) {
            return acc + u.evaluations[0].finalScore;
        }
        return acc;
    }, 0) || 0;
    const avgScoreDisplay = employeesWithEval > 0 ? (avgScore / employeesWithEval).toFixed(2) : '-';

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={departmentName}
            subtitle="Detail departemen dan daftar karyawan"
            width="lg"
        >
            {isPending ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" />
                        <Loader2 className="absolute inset-0 m-auto text-white animate-spin" size={32} />
                    </div>
                    <p className="text-slate-500 animate-pulse">Memuat data...</p>
                </div>
            ) : department ? (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 p-4 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                                <Users size={16} />
                                <span className="text-xs font-medium uppercase tracking-wider">Karyawan</span>
                            </div>
                            <p className="text-2xl font-black text-purple-900 dark:text-purple-100">{totalEmployees}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                                <Target size={16} />
                                <span className="text-xs font-medium uppercase tracking-wider">KPI</span>
                            </div>
                            <p className="text-2xl font-black text-blue-900 dark:text-blue-100">{department._count.kpiCriteria}</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/30 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                                <Building2 size={16} />
                                <span className="text-xs font-medium uppercase tracking-wider">Avg Score</span>
                            </div>
                            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{avgScoreDisplay}</p>
                        </div>
                    </div>

                    {/* Description */}
                    {department.description && (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-600 dark:text-slate-300">{department.description}</p>
                        </div>
                    )}

                    {/* Employees Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Users size={18} className="text-purple-500" />
                                Daftar Karyawan
                            </h3>
                            <Link
                                href={`/dashboard/employees/add?departmentId=${departmentId}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition"
                            >
                                <UserPlus size={14} />
                                Tambah
                            </Link>
                        </div>

                        {department.users.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                <Users size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                <p className="text-slate-500 dark:text-slate-400 mb-4">Belum ada karyawan di departemen ini</p>
                                <Link
                                    href={`/dashboard/employees/add?departmentId=${departmentId}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-purple-200 dark:shadow-none"
                                >
                                    <UserPlus size={16} />
                                    Tambah Karyawan Pertama
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {/* Hint */}
                                <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                                    <ChevronDown size={12} />
                                    Klik karyawan untuk melihat riwayat evaluasi
                                </p>

                                {department.users.map(employee => (
                                    <EmployeeEvaluationPreview
                                        key={employee.id}
                                        employee={employee}
                                        isExpanded={expandedEmployeeId === employee.id}
                                        onToggle={() => handleToggleEmployee(employee.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex gap-3">
                            <Link
                                href={`/dashboard/departments/${departmentId}/edit`}
                                className="flex-1 text-center py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition"
                            >
                                Edit Departemen
                            </Link>
                            <Link
                                href={`/dashboard/kpi?departmentId=${departmentId}`}
                                className="flex-1 text-center py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition shadow-lg shadow-purple-200 dark:shadow-none"
                            >
                                Kelola KPI
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-slate-500">
                    Data tidak ditemukan
                </div>
            )}
        </Drawer>
    );
}
