'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Settings, Users, Building2, ChevronRight } from 'lucide-react';
import DeleteDepartmentButton from '@/components/departments/DeleteDepartmentButton';
import DepartmentDetailDrawer from '@/components/departments/DepartmentDetailDrawer';

type Department = {
    id: string;
    name: string;
    description: string | null;
    _count: {
        users: number;
        kpiCriteria: number;
    };
};

interface DepartmentsClientProps {
    departments: Department[];
}

export default function DepartmentsClient({ departments }: DepartmentsClientProps) {
    const [selectedDepartment, setSelectedDepartment] = useState<{ id: string; name: string } | null>(null);

    const handleRowClick = (dept: Department) => {
        setSelectedDepartment({ id: dept.id, name: dept.name });
    };

    const handleCloseDrawer = () => {
        setSelectedDepartment(null);
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Departemen</h1>
                        <p className="text-slate-500 text-sm">Kelola struktur departemen perusahaan.</p>
                    </div>
                    <Link
                        href="/dashboard/departments/add"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none"
                    >
                        <Plus size={18} /> Tambah Departemen
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover-lift">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl transition-transform duration-300 hover:scale-110 hover:rotate-3">
                                <Building2 className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{departments.length}</p>
                                <p className="text-sm text-slate-500">Total Departemen</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover-lift">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl transition-transform duration-300 hover:scale-110 hover:rotate-3">
                                <Users className="text-green-600" size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {departments.reduce((acc, d) => acc + d._count.users, 0)}
                                </p>
                                <p className="text-sm text-slate-500">Total Karyawan</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover-lift">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl transition-transform duration-300 hover:scale-110 hover:rotate-3">
                                <Settings className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {departments.reduce((acc, d) => acc + d._count.kpiCriteria, 0)}
                                </p>
                                <p className="text-sm text-slate-500">Total KPI Criteria</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hint */}
                <p className="text-xs text-slate-400 flex items-center gap-1">
                    <ChevronRight size={12} />
                    Klik pada baris departemen untuk melihat detail karyawan dan evaluasi
                </p>

                {/* Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                <th className="p-4 font-semibold text-sm text-slate-500">Nama Departemen</th>
                                <th className="p-4 font-semibold text-sm text-slate-500">Deskripsi</th>
                                <th className="p-4 font-semibold text-sm text-slate-500 text-center">Karyawan</th>
                                <th className="p-4 font-semibold text-sm text-slate-500 text-center">KPI</th>
                                <th className="p-4 font-semibold text-sm text-slate-500 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        Belum ada departemen. Klik &quot;Tambah Departemen&quot; untuk membuat.
                                    </td>
                                </tr>
                            ) : (
                                departments.map(dept => (
                                    <tr
                                        key={dept.id}
                                        onClick={() => handleRowClick(dept)}
                                        className="border-b border-slate-50 dark:border-slate-800 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition cursor-pointer group"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                                                    {dept.name.charAt(0)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900 dark:text-white">{dept.name}</span>
                                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{dept.description || '-'}</td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                                <Users size={12} /> {dept._count.users}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium">
                                                {dept._count.kpiCriteria}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Link
                                                    href={`/dashboard/departments/${dept.id}/edit`}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
                                                >
                                                    <Settings size={16} />
                                                </Link>
                                                <DeleteDepartmentButton id={dept.id} employeeCount={dept._count.users} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Department Detail Drawer */}
            <DepartmentDetailDrawer
                departmentId={selectedDepartment?.id || null}
                departmentName={selectedDepartment?.name || ''}
                isOpen={selectedDepartment !== null}
                onClose={handleCloseDrawer}
            />
        </>
    );
}
