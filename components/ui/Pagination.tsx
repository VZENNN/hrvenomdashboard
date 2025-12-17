'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Props {
    totalPages: number;
}

export default function Pagination({ totalPages }: Props) {
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `?${params.toString()}`;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <Link
                href={createPageURL(currentPage - 1)}
                className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
                    }`}
            >
                <ChevronLeft size={20} />
            </Link>

            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Page {currentPage} of {totalPages}
            </div>

            <Link
                href={createPageURL(currentPage + 1)}
                className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''
                    }`}
            >
                <ChevronRight size={20} />
            </Link>
        </div>
    );
}
