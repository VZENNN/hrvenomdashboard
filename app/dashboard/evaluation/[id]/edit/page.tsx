import { auth } from "@/auth";
import { getEvaluationById } from "@/app/actions/evaluationDetail";
import { notFound, redirect } from "next/navigation";
import EvaluationWizard from "@/components/evaluation/EvaluationWizard";
import { User, KpiCriteria } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();

    // STRICT RBAC: Only ADMIN can edit
    if (session?.user?.role !== 'ADMIN') {
        redirect('/dashboard/evaluation');
    }

    const { id } = await params;
    const evaluation = await getEvaluationById(id);

    if (!evaluation) return notFound();

    // Prepare Initial Data for Wizard
    const behavioralItems = evaluation.items.filter(item => item.criteria.type === 'BEHAVIORAL');
    const technicalItems = evaluation.items.filter(item => item.criteria.type === 'TECHNICAL');

    const behavioralKpis = behavioralItems.map(i => i.criteria);
    const technicalKpis = technicalItems.map(i => i.criteria);

    const initialData = {
        id: evaluation.id,
        userId: evaluation.userId,
        user: evaluation.user,
        month: evaluation.month,
        year: evaluation.year,
        feedback: evaluation.feedback,
        behavioral: behavioralKpis,
        technical: technicalKpis,
        items: evaluation.items
    };

    // We need 'users' prop for the wizard, but in edit mode it's not really used for selection.
    // However, the prop is required. We can pass a dummy list or just the current user.
    // To match the type User[], we can just pass [evaluation.user] cast appropriately or fetch all if strictly needed, 
    // but fetching all is wasteful. Let's cast evaluation.user to User (it has extra department but that's fine).
    // Actually, Wizard expects User[] to populate the select box, which is skipped in edit mode (step 2).
    // So an empty array might suffice if the component handles it, but let's pass the single user to be safe.
    // The Wizard interface: users: User[];
    // evaluation.user includes department, so it satisfies User.

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/evaluation/${id}`} className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800">
                    <ArrowLeft />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Evaluation</h1>
                    <p className="text-slate-500 text-sm">Modify existing assessment.</p>
                </div>
            </div>

            <EvaluationWizard
                users={[evaluation.user]}
                currentUserId={session?.user?.id || ''}
                mode="edit"
                initialData={initialData}
            />
        </div>
    );
}
