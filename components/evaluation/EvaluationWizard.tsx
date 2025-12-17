'use client';

import { useState, useEffect } from 'react';
import { User, Department, KpiCriteria, KpiType } from '@prisma/client';
import { getEvaluationMetadata, createEvaluation } from '@/app/actions/evaluations';
import { useEvaluationScoring } from '@/hooks/useEvaluation';
import { Loader2, Save, Calculator, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserWithDept extends User {
    department: Department | null;
}

interface Props {
    users: User[];
    currentUserId: string;
}

export default function EvaluationWizard({ users, currentUserId }: Props) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Selection State
    const [selectedUserId, setSelectedUserId] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    // Data State
    const [targetUser, setTargetUser] = useState<UserWithDept | null>(null);
    const [behavioralKpis, setBehavioralKpis] = useState<KpiCriteria[]>([]);
    const [technicalKpis, setTechnicalKpis] = useState<KpiCriteria[]>([]);

    // Derived State (Hook)
    const { scores, setScores, updateScore, results: finalResult } = useEvaluationScoring(behavioralKpis, technicalKpis);
    const [feedback, setFeedback] = useState('');

    const handleStart = async () => {
        if (!selectedUserId) return;
        setLoading(true);
        try {
            const data = await getEvaluationMetadata(selectedUserId);
            setTargetUser(data.user);
            setBehavioralKpis(data.behavioral);
            setTechnicalKpis(data.technical);

            // Initialize Scores
            const initialScores: any = {};
            data.behavioral.forEach(k => {
                initialScores[k.id] = { target: '-', actual: '-', score: 3, weight: 0, comment: '' };
            });
            const defaultWeight = data.technical.length > 0 ? (100 / data.technical.length) : 0;
            data.technical.forEach(k => {
                initialScores[k.id] = { target: '100%', actual: '', score: 0, weight: defaultWeight, comment: '' };
            });

            setScores(initialScores);
            setStep(2);
        } catch (err) {
            alert("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        const items = [
            ...behavioralKpis.map(k => ({ ...scores[k.id], criteriaId: k.id, type: 'BEHAVIORAL' })),
            ...technicalKpis.map(k => ({ ...scores[k.id], criteriaId: k.id, type: 'TECHNICAL' }))
        ];

        const payload = {
            userId: selectedUserId,
            appraiserId: currentUserId,
            month,
            year,
            items,
            feedback
        };

        await createEvaluation(payload);
    };

    if (step === 1) {
        return (
            <div className="max-w-xl mx-auto space-y-6">
                <div className="space-y-2">
                    <label className="font-semibold">Select Employee to Evaluate</label>
                    <select
                        className="w-full p-3 border rounded-lg bg-white dark:bg-slate-900"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                        <option value="">-- Select Employee --</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} - {u.position}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="font-semibold">Month</label>
                        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="w-full p-3 border rounded-lg">
                            {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="font-semibold">Year</label>
                        <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-full p-3 border rounded-lg" />
                    </div>
                </div>

                <button
                    onClick={handleStart}
                    disabled={!selectedUserId || loading}
                    className="w-full bg-purple-600 text-white p-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "Start Evaluation"}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Info */}
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl flex justify-between items-center border border-slate-200 dark:border-slate-800">
                <div>
                    <h2 className="text-xl font-bold">{targetUser?.name}</h2>
                    <p className="text-slate-500">{targetUser?.position} | {targetUser?.department?.name}</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-slate-400">Period</div>
                    <div className="font-bold">{month}/{year}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">

                    {/* Bagian C: Behavioral */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold mb-4 text-purple-600 border-b pb-2">C. Behavioral Competencies (40%)</h3>
                        <div className="space-y-6">
                            {behavioralKpis.map((kpi, idx) => (
                                <div key={kpi.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                    <div className="md:col-span-2">
                                        <p className="font-semibold">{idx + 1}. {kpi.title}</p>
                                        <p className="text-xs text-slate-500">{kpi.category}</p>
                                    </div>
                                    <div className="md:col-span-2 flex gap-2 items-center">
                                        <div className='flex-1'>
                                            <select
                                                className="w-full p-2 border rounded"
                                                value={scores[kpi.id]?.score}
                                                onChange={(e) => updateScore(kpi.id, 'score', Number(e.target.value))}
                                            >
                                                <option value={1}>1 - Buruk</option>
                                                <option value={2}>2 - Kurang</option>
                                                <option value={3}>3 - Cukup</option>
                                                <option value={4}>4 - Baik</option>
                                                <option value={5}>5 - Sangat Baik</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bagian D: Technical */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold mb-4 text-blue-600 border-b pb-2">D. Key Performance Indicators (60%)</h3>
                        {technicalKpis.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded italic">
                                No specific KPIs found for this specific Position/Department.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {/* Header */}
                                <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                                    <div className="col-span-4">Objective</div>
                                    <div className="col-span-2">Target</div>
                                    <div className="col-span-2">Actual %</div>
                                    <div className="col-span-2">Weight %</div>
                                    <div className="col-span-2">Score</div>
                                </div>

                                {technicalKpis.map((kpi) => (
                                    <div key={kpi.id} className="grid grid-cols-12 gap-2 items-start py-3 border-b border-slate-50 last:border-0">
                                        <div className="col-span-4 pr-2">
                                            <p className="font-semibold text-sm">{kpi.title}</p>
                                            <p className="text-xs text-slate-400">{kpi.category}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                value={scores[kpi.id]?.target}
                                                onChange={(e) => updateScore(kpi.id, 'target', e.target.value)}
                                                className="w-full p-1 border rounded text-sm"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                placeholder="%"
                                                value={scores[kpi.id]?.actual}
                                                onChange={(e) => updateScore(kpi.id, 'actual', e.target.value)}
                                                className="w-full p-1 border rounded text-sm bg-blue-50 focus:bg-white transition"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                value={scores[kpi.id]?.weight}
                                                onChange={(e) => updateScore(kpi.id, 'weight', Number(e.target.value))}
                                                className="w-full p-1 border rounded text-sm"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <div className={`font-bold text-center py-1 rounded ${scores[kpi.id]?.score >= 4 ? 'bg-green-100 text-green-700' :
                                                scores[kpi.id]?.score <= 2 ? 'bg-red-100 text-red-700' : 'bg-slate-100'
                                                }`}>
                                                {scores[kpi.id]?.score || 0}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Feedback */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">Feedback & Comments</h3>
                        <textarea
                            className="w-full p-4 border rounded-xl h-32"
                            placeholder="Write constructive feedback here..."
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                        ></textarea>
                    </div>
                </div>

                {/* Sidebar Score */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-purple-100 sticky top-4">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Calculator size={20} /> Score Preview
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Behavioral (40%)</span>
                                <span className="font-bold">{finalResult.behavior.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Technical (60%)</span>
                                <span className="font-bold">{finalResult.technical.toFixed(2)}</span>
                            </div>

                            <div className="h-px bg-slate-100 my-4"></div>

                            <div className="text-center">
                                <span className="text-slate-500 text-sm uppercase tracking-wide">Final Score</span>
                                <div className="text-5xl font-black text-purple-600 my-2">
                                    {finalResult.final.toFixed(2)}
                                </div>
                                <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${finalResult.grade.includes('Very Good') ? 'bg-green-100 text-green-700' :
                                    finalResult.grade.includes('Good') ? 'bg-blue-100 text-blue-700' :
                                        finalResult.grade.includes('Fair') ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                    }`}>
                                    {finalResult.grade}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 shadow-xl flex justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Submit Evaluation</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
