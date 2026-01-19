'use client'

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { submitPsychotestCategory } from "@/app/actions/psychotest";

// Type for MostAndLeast answers
type MostLeastAnswer = { most: string; least: string };

export default function TestEngine({ category, userId }: { category: any, userId: string }) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(category.timeLimit);
    // Answers can be string (for MC/Essay) or object (for MOST_AND_LEAST)
    const [answers, setAnswers] = useState<Record<string, string | MostLeastAnswer>>({});
    const [submitting, setSubmitting] = useState(false);

    // Convert questions options to usable format if MC
    const questions = category.questions.map((q: any) => ({
        ...q,
        options: q.options ? (Array.isArray(q.options) ? q.options : []) : null
    }));

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft((prev: number) => {
                if (prev <= 0) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Monitor timer for auto-submit
    useEffect(() => {
        if (timeLeft === 0 && !submitting) {
            handleSubmit();
        }
    }, [timeLeft]);

    async function handleSubmit() {
        if (submitting) return;
        setSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);

        // Submit logic
        try {
            const nextUrl = await submitPsychotestCategory(userId, category.id, answers);
            router.push(nextUrl);
        } catch (e) {
            console.error("Submission failed", e);
            alert("Submission failed. Please try again."); // Fallback
            setSubmitting(false);
        }
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (qId: string, val: string) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    // Handler for MOST_AND_LEAST questions
    const handleMostLeastChange = (qId: string, field: 'most' | 'least', label: string) => {
        setAnswers(prev => {
            const current = (prev[qId] as MostLeastAnswer) || { most: '', least: '' };
            // If the same label is already in the OTHER field, clear it
            let updated = { ...current, [field]: label };
            if (field === 'most' && current.least === label) {
                updated.least = '';
            }
            if (field === 'least' && current.most === label) {
                updated.most = '';
            }
            return { ...prev, [qId]: updated };
        });
    };

    return (
        <div className="max-w-4xl mx-auto pb-24">
            {/* Floating Timer Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b shadow-sm py-4 px-6 flex justify-between items-center mb-8 -mx-6 rounded-b-xl">
                <div>
                    <h2 className="font-bold text-lg truncate max-w-[200px] md:max-w-md">{category.name}</h2>
                    <div className="text-xs text-slate-500">{questions.length} Questions</div>
                </div>
                <div className={`font-mono text-xl font-bold px-4 py-2 rounded ${timeLeft < 30 ? 'bg-red-100 text-red-600' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Instructions from category.description */}
            {category.description && (
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-line">{category.description}</p>
                </div>
            )}

            <div className="space-y-8">
                {questions.map((q: any, idx: number) => (
                    <div key={q.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border space-y-4">
                        <div className="flex gap-4">
                            <span className="font-bold text-slate-400 text-lg">#{idx + 1}</span>
                            <div className="flex-1 space-y-4">
                                <p className="text-lg font-medium">{q.content}</p>
                                {q.image && (
                                    <div className="rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 max-w-md">
                                        <img src={q.image} className="w-full h-auto object-contain max-h-[400px]" alt="Visual" />
                                    </div>
                                )}

                                <div className="pt-2">
                                    {q.type === 'MULTIPLE_CHOICE' ? (
                                        <div className="space-y-2">
                                            {q.options?.map((opt: any, optIdx: number) => (
                                                <label key={optIdx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[q.id] === opt.text
                                                    ? 'bg-purple-50 border-purple-500 dark:bg-purple-900/20 dark:border-purple-500'
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-transparent bg-slate-50 dark:bg-slate-900'
                                                    }`}>
                                                    <input
                                                        type="radio"
                                                        name={q.id}
                                                        value={opt.text}
                                                        checked={answers[q.id] === opt.text}
                                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                        className="w-4 h-4 text-purple-600"
                                                    />
                                                    <span className="font-bold text-slate-500 w-6">{opt.label}</span>
                                                    <span>{opt.text}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : q.type === 'MOST_AND_LEAST' ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse text-sm">
                                                <thead>
                                                    <tr className="bg-slate-100 dark:bg-slate-700">
                                                        <th className="border p-2 text-center w-16">Mirip</th>
                                                        <th className="border p-2 text-center w-16">Tidak Mirip</th>
                                                        <th className="border p-2 text-left">Pernyataan</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {q.options?.map((opt: any) => {
                                                        const currentAnswer = (answers[q.id] as MostLeastAnswer) || { most: '', least: '' };
                                                        return (
                                                            <tr key={opt.label} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                                <td className="border p-2 text-center">
                                                                    <input
                                                                        type="radio"
                                                                        name={`${q.id}-most`}
                                                                        checked={currentAnswer.most === opt.label}
                                                                        onChange={() => handleMostLeastChange(q.id, 'most', opt.label)}
                                                                        className="w-4 h-4 text-green-600 accent-green-600"
                                                                    />
                                                                </td>
                                                                <td className="border p-2 text-center">
                                                                    <input
                                                                        type="radio"
                                                                        name={`${q.id}-least`}
                                                                        checked={currentAnswer.least === opt.label}
                                                                        onChange={() => handleMostLeastChange(q.id, 'least', opt.label)}
                                                                        className="w-4 h-4 text-red-600 accent-red-600"
                                                                    />
                                                                </td>
                                                                <td className="border p-2">
                                                                    <span className="font-bold text-slate-500 mr-2">{opt.label}.</span>
                                                                    {opt.text}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <textarea
                                            value={(answers[q.id] as string) || ''}
                                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                            className="w-full border rounded-lg p-3 min-h-[120px] bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="Type your answer here..."
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t flex justify-center z-20">
                <button
                    onClick={() => handleSubmit()}
                    disabled={submitting}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-12 rounded-lg shadow-lg disabled:opacity-50 min-w-[200px]"
                >
                    {submitting ? "Submitting..." : "Submit Answers"}
                </button>
            </div>
        </div>
    );
}
