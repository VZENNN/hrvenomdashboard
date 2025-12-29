import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-md border border-slate-100 dark:border-slate-700">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
                        <ShieldAlert size={48} className="text-red-600 dark:text-red-400" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    You do not have permission to view this page. This area is restricted to Managers and Administrators.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/login"
                        className="block w-full py-2.5 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        Back to Login
                    </Link>
                    <Link
                        href="/"
                        className="block w-full py-2.5 px-4 bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg font-medium transition-colors"
                    >
                        Go to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
