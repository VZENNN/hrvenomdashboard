import { getPsychotestQuestionById } from "@/app/actions/psychotest";
import QuestionForm from "../../_components/QuestionForm";
import { notFound } from "next/navigation";

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const question = await getPsychotestQuestionById(id);

    if (!question) {
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Question</h1>
            <QuestionForm
                categoryId={question.categoryId}
                initialData={question as any}
            />
        </div>
    );
}
