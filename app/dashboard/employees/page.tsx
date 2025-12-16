
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

export default async function EmployeesPage({ searchParams }: { searchParams: { q?: string } }) {
    const query = searchParams?.q || '';

    const employees = await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { employeeId: { contains: query, mode: 'insensitive' } }
            ]
        },
        include: {
            department: true
        },
        orderBy: {
            createdAt: 'desc'
        }
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

            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <form className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        name="q"
                        defaultValue={query}
                        placeholder="Search by name or ID..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                </form>
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
                                            <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                                                <Pencil size={16} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-red-600 transition">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
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
