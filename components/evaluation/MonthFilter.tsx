'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

const MONTHS = [
    { value: '', label: 'Semua Bulan' },
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

export default function MonthFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const currentMonth = searchParams.get('month') || '';

    const handleChange = (value: string) => {
        const params = new URLSearchParams(searchParams);

        if (value) {
            params.set('month', value);
        } else {
            params.delete('month');
        }

        params.set('page', '1');

        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div className={`flex gap-3 items-center transition-opacity ${isPending ? 'opacity-60' : ''}`}>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Filter Bulan:
            </label>
            <select
                value={currentMonth}
                onChange={(e) => handleChange(e.target.value)}
                disabled={isPending}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-900"
            >
                {MONTHS.map(m => (
                    <option key={m.value} value={m.value}>
                        {m.label}
                    </option>
                ))}
            </select>

            {isPending && (
                <span className="text-xs text-slate-400">Loading...</span>
            )}
        </div>
    );
}
