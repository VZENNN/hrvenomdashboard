import { auth } from "@/auth";
import { getPsychotestCategoryById, isCategoryCompleted } from "@/app/actions/psychotest";
import { redirect } from "next/navigation";
import TestEngine from "@/components/psychotest/TestEngine";

export const dynamic = 'force-dynamic';

export default async function TestPage({ params }: { params: Promise<{ categoryId: string }> }) {
    const { categoryId } = await params;
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const category = await getPsychotestCategoryById(categoryId);
    const completed = await isCategoryCompleted(session.user.id, categoryId);

    if (!category || completed) redirect("/applicant/dashboard");

    return <TestEngine category={category} userId={session.user.id} />;
}
