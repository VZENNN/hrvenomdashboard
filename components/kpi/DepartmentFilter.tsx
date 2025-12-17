'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Department } from '@prisma/client';
import { useTransition } from 'react';

interface Props {
    departments: Department[];
}

export default function DepartmentFilter({ departments }: Props) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const currentDept = searchParams.get('dept') || '';

    const handleChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set('dept', value);
        } else {
            params.delete('dept');
        }
        params.set('page', '1');
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div className={`flex gap-3 items-center transition-opacity ${isPending ? 'opacity-60' : ''}`}>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Filter Departemen:</label>
            <select
                value={currentDept}
                onChange={(e) => handleChange(e.target.value)}
                disabled={isPending}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-900 disabled:opacity-50"
            >
                <option value="">Semua Departemen</option>
                {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                ))}
            </select>
            {isPending && <span className="text-xs text-slate-400">Loading...</span>}
        </div>
    );
}
