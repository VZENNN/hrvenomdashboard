'use client';

import { Printer } from "lucide-react";

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
            <Printer size={16} /> Cetak
        </button>
    );
}
