import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus, Search as SearchIcon, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import DeleteEmployeeButton from '@/components/employees/DeleteEmployeeButton';
import EmployeeFilter from '@/components/employees/EmployeeFilter';

import Pagination from '@/components/ui/Pagination';

import Search from '@/components/ui/Search';

import { EmployeeStatus } from '@prisma/client';

export default async function EmployeesPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string; page?: string; departmentId?: string; position?: string; status?: string }>
}) {
    const params = await searchParams;
    const query = params?.q || '';
    const currentPage = Number(params?.page) || 1;
    const itemsPerPage = 10;

    const departmentId = params?.departmentId;
    const position = params?.position;
    const status = params?.status as EmployeeStatus | undefined;

    // Build Where Clause
    const where: any = {
        AND: [
            {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { employeeId: { contains: query, mode: 'insensitive' } }
                ]
            }
        ]
    };

    if (departmentId) where.AND.push({ departmentId });
    if (position) where.AND.push({ position });
    if (status) where.AND.push({ status });

    const totalItems = await prisma.user.count({ where });
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const departments = await prisma.department.findMany({
        orderBy: { name: 'asc' }
    });

    const distinctPositions = await prisma.user.findMany({
        select: { position: true },
        distinct: ['position'],
        orderBy: { position: 'asc' }
    });

    const employees = await prisma.user.findMany({
        where,
        include: {
            department: true
        },
        orderBy: {
            createdAt: 'desc'
        },
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Employees</h1>
                    <p className="text-slate-500 text-sm">Manage your human capital.</p>
                </div>
                <Link
                    href="/dashboard/employees/add"
                    className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:opacity-90 transition"
                >
                    <Plus size={18} /> Add Employee
                </Link>
            </div>

            {/* Search and Filter */}
            <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <Search placeholder="Search by name or ID..." />
                </div>

                <EmployeeFilter
                    departments={departments}
                    positions={distinctPositions.map(p => p.position)}
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <th className="p-4 font-semibold text-sm text-slate-500">Employee</th>
                            <th className="p-4 font-semibold text-sm text-slate-500">Department</th>
                            <th className="p-4 font-semibold text-sm text-slate-500">Position</th>
                            <th className="p-4 font-semibold text-sm text-slate-500">Status</th>
                            <th className="p-4 font-semibold text-sm text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">No employees found.</td>
                            </tr>
                        ) : (
                            employees.map(emp => (
                                <tr key={emp.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                                {emp.avatarUrl ? <img src={emp.avatarUrl} className="w-full h-full rounded-full object-cover" /> : emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white">{emp.name}</div>
                                                <div className="text-xs text-slate-400">{emp.employeeId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{emp.department?.name || '-'}</td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{emp.position}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/dashboard/employees/${emp.id}/edit`} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                                                <Pencil size={16} />
                                            </Link>
                                            <DeleteEmployeeButton id={emp.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && <Pagination totalPages={totalPages} />}
        </div>
    );
}
