'use client'

import { createPsychotestQuestion, updatePsychotestQuestion } from "@/app/actions/psychotest";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, X, Upload } from "lucide-react";

interface QuestionFormProps {
    categoryId: string;
    initialData?: {
        id: string;
        content: string;
        type: string; // "ESSAY" | "MULTIPLE_CHOICE"
        image?: string | null;
        options?: any;
    } | null;
}

export default function QuestionForm({ categoryId, initialData }: QuestionFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Initialize state from initialData or defaults
    const [type, setType] = useState(initialData?.type || "ESSAY");
    const getDefaultOptions = (questionType: string) => {
        if (questionType === "MOST_AND_LEAST") {
            return [
                { label: "A", text: "" },
                { label: "B", text: "" },
                { label: "C", text: "" },
                { label: "D", text: "" }
            ];
        }
        return [{ label: "A", text: "" }, { label: "B", text: "" }];
    };
    const [options, setOptions] = useState(
        (initialData?.options as any[]) ||
        getDefaultOptions(initialData?.type || "ESSAY")
    );
    const [imageBase64, setImageBase64] = useState<string | null>(initialData?.image || null);
    const [content, setContent] = useState(initialData?.content || "");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                alert("File too large. Max 1MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addOption = () => {
        const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        setOptions([...options, { label: labels[options.length % 26], text: "" }]);
    };

    const removeOption = (idx: number) => {
        setOptions(options.filter((_, i) => i !== idx));
    };

    const updateOption = (idx: number, text: string) => {
        const newOpts = [...options];
        newOpts[idx].text = text;
        setOptions(newOpts);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const data = {
            content,
            categoryId,
            type,
            image: imageBase64,
            options: (type === "MULTIPLE_CHOICE" || type === "MOST_AND_LEAST") ? options : undefined
        };

        try {
            if (initialData) {
                await updatePsychotestQuestion(initialData.id, data);
            } else {
                await createPsychotestQuestion(data);
            }
            router.push(`/dashboard/psychotest/questions?category=${categoryId}`);
            router.refresh();
        } catch (err) {
            console.error(err);
            alert("Failed to save question");
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border space-y-6">

            {/* Question Type */}
            <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg inline-flex flex-wrap">
                <button type="button" onClick={() => { setType("ESSAY"); setOptions(getDefaultOptions("ESSAY")); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${type === "ESSAY" ? 'bg-white text-blue-600 shadow' : 'text-slate-500'}`}>
                    Essay / Text
                </button>
                <button type="button" onClick={() => { setType("MULTIPLE_CHOICE"); setOptions(getDefaultOptions("MULTIPLE_CHOICE")); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${type === "MULTIPLE_CHOICE" ? 'bg-white text-blue-600 shadow' : 'text-slate-500'}`}>
                    Multiple Choice
                </button>
                <button type="button" onClick={() => { setType("MOST_AND_LEAST"); setOptions(getDefaultOptions("MOST_AND_LEAST")); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${type === "MOST_AND_LEAST" ? 'bg-white text-blue-600 shadow' : 'text-slate-500'}`}>
                    Mirip / Tidak Mirip
                </button>
            </div>

            {/* Content */}
            <div>
                <label className="block text-sm font-medium mb-1">Question Content</label>
                <textarea
                    name="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="w-full border rounded p-2 bg-transparent min-h-[100px]"
                    placeholder="Enter the question text here..."
                />
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-medium mb-1">Image Attachment (Optional)</label>
                <div className="flex items-center gap-4">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                        <Upload size={16} /> Choose Image
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                    {imageBase64 && (
                        <div className="relative h-20 w-20 border rounded overflow-hidden">
                            <img src={imageBase64} className="h-full w-full object-cover" alt="Question" />
                            <button type="button" onClick={() => setImageBase64(null)} className="absolute top-0 right-0 bg-red-500 text-white p-1">
                                <X size={12} />
                            </button>
                        </div>
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-1">Max 1MB. Copied as Base64 to DB.</p>
            </div>

            {/* Options (Only if MC or MOST_AND_LEAST) */}
            {(type === "MULTIPLE_CHOICE" || type === "MOST_AND_LEAST") && (
                <div className="space-y-3 border-t pt-4">
                    <label className="block text-sm font-medium">
                        {type === "MOST_AND_LEAST" ? "Statement Options (A, B, C, D)" : "Answer Options"}
                    </label>
                    {type === "MOST_AND_LEAST" && (
                        <p className="text-xs text-slate-500 -mt-2">User will pick one "Mirip" (most like me) and one "Tidak Mirip" (least like me).</p>
                    )}
                    {options.map((opt, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                            <div className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded font-bold shrink-0">
                                {opt.label}
                            </div>
                            <input
                                value={opt.text}
                                onChange={(e) => updateOption(idx, e.target.value)}
                                required
                                className="flex-1 border rounded p-2 bg-transparent"
                                placeholder={`Option ${opt.label} text`}
                            />
                            {type === "MULTIPLE_CHOICE" && options.length > 2 && (
                                <button type="button" onClick={() => removeOption(idx)} className="text-slate-400 hover:text-red-500">
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                    {type === "MULTIPLE_CHOICE" && (
                        <button type="button" onClick={addOption} className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
                            <Plus size={16} /> Add Option
                        </button>
                    )}
                </div>
            )}

            <div className="pt-6 flex justify-end gap-3 border-t">
                <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                    Cancel
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50">
                    {loading ? "Saving..." : (initialData ? "Save Changes" : "Create Question")}
                </button>
            </div>
        </form>
    );
}
