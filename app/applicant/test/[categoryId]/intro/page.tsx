import { auth } from "@/auth";
import { getPsychotestCategoryById, isCategoryCompleted } from "@/app/actions/psychotest";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function TestIntroPage({ params }: { params: Promise<{ categoryId: string }> }) {
    const { categoryId } = await params;
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const category = await getPsychotestCategoryById(categoryId);
    const completed = await isCategoryCompleted(session.user.id, categoryId);

    if (!category || completed) {
        redirect("/applicant/dashboard");
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border text-center max-w-2xl mx-auto my-auto">
            <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
            {category.description && (
                <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg">{category.description}</p>
            )}

            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border w-full mb-8">
                <div className="text-slate-500 mb-1 uppercase text-xs font-bold tracking-wider">Batas Waktu</div>
                <div className="text-4xl font-mono font-bold text-red-600 flex items-center justify-center gap-2">
                    <Clock size={32} />
                    {Math.floor(category.timeLimit / 60)}m {category.timeLimit % 60}s
                </div>
            </div>

            <div className="space-y-4 w-full">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded text-sm text-left">
                    <p className="font-bold">Petunjuk:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Waktu akan segera dimulai ketika anda menekan tombol mulai.</li>
                        <li>Anda tidak dapat menjeda tes setelah dimulai.</li>
                        <li>Jawab sebanyak mungkin pertanyaan sebelum waktu habis.</li>
                        <li>Sistem akan submit secara otomatis ketika waktu habis.</li>
                    </ul>
                </div>

                <Link href={`/applicant/test/${category.id}`} className="block w-full">
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2">
                        Mulai <ArrowRight className="ml-2" />
                    </button>
                </Link>
            </div>
        </div>
    );
}
