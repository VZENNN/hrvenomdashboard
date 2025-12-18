'use client';

import { Department, EmployeeStatus } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';

interface Props {
    departments: Department[];
    positions: string[];
}

export default function EmployeeFilter({ departments, positions }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentDept = searchParams.get('departmentId') || '';
    const currentPos = searchParams.get('position') || '';
    const currentStatus = searchParams.get('status') || '';

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set('page', '1');

        router.push(`?${params.toString()}`);
    };

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('departmentId');
        params.delete('position');
        params.delete('status');
        params.set('page', '1');

        router.push(`?${params.toString()}`);
    };

    const hasFilters = currentDept || currentPos || currentStatus;

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 items-center">

            <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Filter size={18} /> Filters:
            </div>

            {/* Department Filter */}
            <select
                className="p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                value={currentDept}
                onChange={(e) => handleFilterChange('departmentId', e.target.value)}
            >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
            </select>

            {/* Position Filter */}
            <select
                className="p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                value={currentPos}
                onChange={(e) => handleFilterChange('position', e.target.value)}
            >
                <option value="">All Positions</option>
                {positions.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                ))}
            </select>

            {/* Status Filter */}
            <select
                className="p-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                value={currentStatus}
                onChange={(e) => handleFilterChange('status', e.target.value)}
            >
                <option value="">All Statuses</option>
                <option value={EmployeeStatus.ACTIVE}>Active</option>
                <option value={EmployeeStatus.INACTIVE}>Inactive</option>
            </select>

            {hasFilters && (
                <button
                    onClick={clearFilters}
                    className="ml-auto text-sm text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                >
                    <X size={16} /> Clear Filters
                </button>
            )}
        </div>
    );
}
