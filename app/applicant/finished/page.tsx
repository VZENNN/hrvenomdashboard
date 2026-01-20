'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";

export default function FinishedPage() {
    const [redirecting, setRedirecting] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.href = "https://teskoran.com/";
        }, 3000); // 3 second delay to read the message

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-6 rounded-full mb-6">
                <CheckCircle size={64} />
            </div>
            <h1 className="text-3xl font-bold mb-4">Assessment Complete</h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg max-w-md mx-auto mb-8">
                Thank you for completing the psychotest assessment. Your answers have been recorded.
                <br /><br />
                <span className="font-semibold text-purple-600 flex items-center justify-center gap-2">
                    {redirecting && <Loader2 className="animate-spin" size={16} />}
                    Redirecting you to the next step...
                </span>
            </p>

            <Link href="/applicant/dashboard">
                <button className="bg-slate-900 dark:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 text-sm">
                    Return to Dashboard (Manual)
                </button>
            </Link>
        </div>
    );
}
