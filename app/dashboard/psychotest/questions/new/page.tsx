'use client'

import { useSearchParams } from "next/navigation";
import QuestionForm from "../_components/QuestionForm";

export default function NewQuestionPage() {
    const searchParams = useSearchParams();
    const categoryId = searchParams.get("category");

    // If no category selected, maybe redirect back?
    if (!categoryId) {
        return <div className="p-8">Error: No Category Specified.</div>
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Add New Question</h1>
            <QuestionForm categoryId={categoryId} />
        </div>
    );
}
