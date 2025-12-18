import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus, Settings } from 'lucide-react';
import { getKpiCriteria } from '@/app/actions/kpi';
import DeleteKpiButton from '@/components/kpi/DeleteKpiButton';
import Pagination from '@/components/ui/Pagination';
import DepartmentFilter from '@/components/kpi/DepartmentFilter';
import SortableHeader from '@/components/ui/SortableHeader';

export default async function KpiListPage({ searchParams }: { searchParams: Promise<{ page?: string; dept?: string; sortBy?: string; order?: string }> }) {
    const params = await searchParams;
    const currentPage = Number(params?.page) || 1;
    const itemsPerPage = 10;
    const deptFilter = params?.dept || '';
    const sortBy = params?.sortBy || 'category';
    const sortOrder = (params?.order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';

    const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });

    const where = deptFilter ? { departmentId: deptFilter } : {};
    const totalItems = await prisma.kpiCriteria.count({ where });
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Dynamic orderBy based on sortBy param
    const orderByField = ['category', 'title', 'type', 'position', 'defaultWeight'].includes(sortBy) ? sortBy : 'category';
    const orderBy = { [orderByField]: sortOrder };

    const kpis = await prisma.kpiCriteria.findMany({
        where,
        include: { department: true },
        orderBy,
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kelola KPI</h1>
                    <p className="text-slate-500 text-sm">Manage Key Performance Indicators per department.</p>
                </div>
                <Link
                    href="/dashboard/kpi/add"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-purple-700 transition shadow-lg shadow-purple-200 dark:shadow-none"
                >
                    <Plus size={18} /> Tambah KPI
                </Link>
            </div>

            {/* Department Filter */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <DepartmentFilter departments={departments} />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <th className="p-4 font-semibold text-sm text-slate-500">
                                <SortableHeader column="category" label="Kategori" />
                            </th>
                            <th className="p-4 font-semibold text-sm text-slate-500">
                                <SortableHeader column="title" label="Judul" />
                            </th>
                            <th className="p-4 font-semibold text-sm text-slate-500">
                                <SortableHeader column="type" label="Tipe" />
                            </th>
                            <th className="p-4 font-semibold text-sm text-slate-500">Departemen</th>
                            <th className="p-4 font-semibold text-sm text-slate-500">
                                <SortableHeader column="position" label="Posisi" />
                            </th>
                            <th className="p-4 font-semibold text-sm text-slate-500">
                                <SortableHeader column="defaultWeight" label="Bobot" />
                            </th>
                            <th className="p-4 font-semibold text-sm text-slate-500 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kpis.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-500">
                                    Belum ada KPI. Klik &quot;Tambah KPI&quot; untuk membuat.
                                </td>
                            </tr>
                        ) : (
                            kpis.map(kpi => (
                                <tr key={kpi.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">{kpi.category}</td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{kpi.title}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${kpi.type === 'BEHAVIORAL'
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                            {kpi.type === 'BEHAVIORAL' ? 'Perilaku' : 'Teknis'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{kpi.department?.name || 'Semua'}</td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{kpi.position || 'Semua'}</td>
                                    <td className="p-4 text-sm font-mono">{kpi.defaultWeight}%</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/dashboard/kpi/${kpi.id}/edit`}
                                                className="p-2 text-slate-400 hover:text-purple-600 transition"
                                            >
                                                <Settings size={16} />
                                            </Link>
                                            <DeleteKpiButton id={kpi.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && <Pagination totalPages={totalPages} />}
        </div>
    );
}
