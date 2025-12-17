'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTransition } from 'react';

interface Props {
    column: string;
    label: string;
}

export default function SortableHeader({ column, label }: Props) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const currentSort = searchParams.get('sortBy');
    const currentOrder = searchParams.get('order') || 'asc';
    const isActive = currentSort === column;

    const handleSort = () => {
        const params = new URLSearchParams(searchParams);

        if (isActive) {
            params.set('order', currentOrder === 'asc' ? 'desc' : 'asc');
        } else {
            params.set('sortBy', column);
            params.set('order', 'asc');
        }

        params.set('page', '1');
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <button
            onClick={handleSort}
            disabled={isPending}
            className={`flex items-center gap-1 hover:text-purple-600 transition group ${isPending ? 'opacity-60' : ''}`}
        >
            {label}
            <span className="text-slate-300 group-hover:text-purple-400">
                {isActive ? (
                    currentOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                ) : (
                    <ArrowUpDown size={14} />
                )}
            </span>
        </button>
    );
}
