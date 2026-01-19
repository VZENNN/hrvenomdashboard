import { auth } from "@/auth";
import { getApplicantNextCategory } from "@/app/actions/psychotest";
import Link from "next/link";

export default async function ApplicantDashboardPage() {
    const session = await auth();
    const nextCategory = await getApplicantNextCategory(session?.user?.id as string);

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border dark:border-slate-700">
                <h2 className="text-2xl font-bold mb-4">Welcome, {session?.user?.name}</h2>
                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg text-slate-600 dark:text-slate-300">
                        You have been invited to complete the Psychotest Assessment.
                        This assessment consists of multiple categories including Aptitude Test [IQ], Working Style Test [VAK], and Attitude Test [DISC].
                    </p>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                        Please ensure you have a stable internet connection and sufficient time (approx. 30-60 mins).
                        Once you start a category, the timer cannot be paused.
                    </p>
                </div>

                <div className="mt-8">
                    {nextCategory ? (
                        <Link href={`/applicant/test/${nextCategory.id}/intro`}>
                            <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all">
                                Start Assessment
                            </button>
                        </Link>
                    ) : (
                        <div className="p-4 bg-green-50 text-green-700 rounded-lg dark:bg-green-900/20 dark:text-green-300">
                            You have completed all assessments. Thank you!
                        </div>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 opacity-60">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                        <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
                        <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
