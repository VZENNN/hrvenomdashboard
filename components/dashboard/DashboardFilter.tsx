'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';

const MONTHS = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
];

export default function DashboardFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentMonth = searchParams.get('month') || (new Date().getMonth() + 1).toString();
    const currentYear = searchParams.get('year') || new Date().getFullYear().toString();

    // Generate last 5 years
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const handleFilterChange = (key: 'month' | 'year', value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set(key, value);

        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div className="flex gap-2 items-center bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
            <select
                value={currentMonth}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                disabled={isPending}
                className="w-32 p-2 rounded-md bg-slate-50 dark:bg-slate-900 border-none text-sm font-medium focus:ring-2 focus:ring-amber-500"
            >
                {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                ))}
            </select>

            <select
                value={currentYear}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                disabled={isPending}
                className="w-24 p-2 rounded-md bg-slate-50 dark:bg-slate-900 border-none text-sm font-medium focus:ring-2 focus:ring-amber-500"
            >
                {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
        </div>
    );
}
