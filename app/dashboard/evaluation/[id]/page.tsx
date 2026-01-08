import { getEvaluationById } from "@/app/actions/evaluationDetail";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Building2, Award, Target } from "lucide-react";
import PrintButton from "@/components/ui/PrintButton";

export default async function EvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const evaluation = await getEvaluationById(id);

    if (!evaluation) return notFound();

    const behavioralItems = evaluation.items.filter(item => item.criteria.type === 'BEHAVIORAL');
    const technicalItems = evaluation.items.filter(item => item.criteria.type === 'TECHNICAL');

    const getGradeInfo = (score: number) => {
        if (score <= 1.50) return { label: 'Poor', color: 'text-red-600 bg-red-100' };
        if (score <= 2.50) return { label: 'Unsatisfactory', color: 'text-orange-600 bg-orange-100' };
        if (score <= 3.50) return { label: 'Fair / Need Improvement', color: 'text-yellow-600 bg-yellow-100' };
        if (score <= 4.50) return { label: 'Good / Meet Expectation', color: 'text-blue-600 bg-blue-100' };
        return { label: 'Very Good / Exceed Expectation', color: 'text-green-600 bg-green-100' };
    };

    const grade = getGradeInfo(evaluation.finalScore);
    const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/evaluation" className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800">
                        <ArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Detail Evaluasi</h1>
                        <p className="text-slate-500 text-sm">Laporan penilaian kinerja karyawan</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <PrintButton />
                </div>
            </div>

            {/* Employee Info Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <User className="text-purple-600" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Karyawan</p>
                            <p className="font-bold text-slate-900 dark:text-white">{evaluation.user.name}</p>
                            <p className="text-xs text-slate-500">{evaluation.user.position}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Building2 className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Departemen</p>
                            <p className="font-bold text-slate-900 dark:text-white">{evaluation.user.department?.name || '-'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Calendar className="text-green-600" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Periode</p>
                            <p className="font-bold text-slate-900 dark:text-white">{monthNames[evaluation.month]} {evaluation.year}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Award className="text-orange-600" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Penilai</p>
                            <p className="font-bold text-slate-900 dark:text-white">{evaluation.appraiser.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final Score Card */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-purple-200 text-sm">Nilai Akhir</p>
                        <p className="text-5xl font-black">{evaluation.finalScore.toFixed(2)}</p>
                        <p className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold ${grade.color}`}>
                            {grade.label}
                        </p>
                    </div>
                    <div className="text-right space-y-2">
                        <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
                            <p className="text-xs text-purple-200">Perilaku (40%)</p>
                            <p className="text-xl font-bold">{evaluation.behaviorScore.toFixed(2)}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
                            <p className="text-xs text-purple-200">Teknis (60%)</p>
                            <p className="text-xl font-bold">{evaluation.technicalScore.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-purple-200 mt-4 font-mono">
                    Formula: ({evaluation.behaviorScore.toFixed(2)} × 40%) + ({evaluation.technicalScore.toFixed(2)} × 60%) = {evaluation.finalScore.toFixed(2)}
                </p>
            </div>

            {/* Behavioral Scores */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20">
                    <h2 className="font-bold text-blue-900 dark:text-blue-300">Bagian C - Penilaian Perilaku</h2>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Rata-rata: {evaluation.behaviorScore.toFixed(2)}</p>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <th className="p-3 text-left text-xs font-semibold text-slate-500">Kriteria</th>
                            <th className="p-3 text-center text-xs font-semibold text-slate-500 w-24">Nilai</th>
                        </tr>
                    </thead>
                    <tbody>
                        {behavioralItems.map(item => (
                            <tr key={item.id} className="border-b border-slate-50 dark:border-slate-800">
                                <td className="p-3">
                                    <p className="font-medium text-slate-900 dark:text-white">{item.criteria.title}</p>
                                    <p className="text-xs text-slate-400">{item.criteria.category}</p>
                                    {item.comment && (
                                        <p className="text-xs text-slate-500 italic mt-1 bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                            "{item.comment}"
                                        </p>
                                    )}
                                </td>
                                <td className="p-3 text-center">
                                    <span className="inline-block w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold leading-10">
                                        {item.score}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Technical Scores */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-green-50 dark:bg-green-900/20">
                    <h2 className="font-bold text-green-900 dark:text-green-300">Bagian D - Penilaian KPI Teknis</h2>
                    <p className="text-xs text-green-600 dark:text-green-400">Total Nilai Tertimbang: {evaluation.technicalScore.toFixed(2)}</p>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <th className="p-3 text-left text-xs font-semibold text-slate-500">Kriteria</th>
                            <th className="p-3 text-center text-xs font-semibold text-slate-500">Target</th>
                            <th className="p-3 text-center text-xs font-semibold text-slate-500">Aktual</th>
                            <th className="p-3 text-center text-xs font-semibold text-slate-500">Bobot</th>
                            <th className="p-3 text-center text-xs font-semibold text-slate-500">Nilai</th>
                            <th className="p-3 text-center text-xs font-semibold text-slate-500">Kontribusi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {technicalItems.map(item => (
                            <tr key={item.id} className="border-b border-slate-50 dark:border-slate-800">
                                <td className="p-3">
                                    <p className="font-medium text-slate-900 dark:text-white">{item.criteria.title}</p>
                                    <p className="text-xs text-slate-400">{item.criteria.category}</p>
                                    {item.comment && (
                                        <p className="text-xs text-slate-500 italic mt-1 bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                            "{item.comment}"
                                        </p>
                                    )}
                                </td>
                                <td className="p-3 text-center text-sm">{item.target || '-'}</td>
                                <td className="p-3 text-center text-sm font-medium">{item.actual || '-'}</td>
                                <td className="p-3 text-center text-sm">{item.weight}%</td>
                                <td className="p-3 text-center">
                                    <span className="inline-block w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold leading-8 text-sm">
                                        {item.score}
                                    </span>
                                </td>
                                <td className="p-3 text-center text-sm font-mono text-slate-600">
                                    {((item.weight / 100) * item.score).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Feedback Section */}
            {evaluation.feedback && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-3">Catatan / Feedback</h2>
                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{evaluation.feedback}</p>
                </div>
            )}


        </div>
    );
}
