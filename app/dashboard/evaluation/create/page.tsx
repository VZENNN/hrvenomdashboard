import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import EvaluationWizard from "@/components/evaluation/EvaluationWizard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CreateEvaluationPage() {
    const session = await auth();

    // List Users to Evaluate (Exclude self? Maybe allowed for test. Exclude Inactive)
    const users = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/evaluation" className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800">
                    <ArrowLeft />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Evaluation</h1>
                    <p className="text-slate-500 text-sm">Assess employee performance.</p>
                </div>
            </div>

            <EvaluationWizard users={users} currentUserId={session?.user?.id || ''} />
        </div>
    );
}
