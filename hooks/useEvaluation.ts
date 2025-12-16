
import { useState, useMemo } from 'react';
import { KpiCriteria } from '@prisma/client';

type ScoreType = {
    target: string;
    actual: string;
    score: number;
    weight: number;
    comment: string;
};

export const useEvaluationScoring = (
    behavioralKpis: KpiCriteria[],
    technicalKpis: KpiCriteria[]
) => {
    const [scores, setScores] = useState<Record<string, ScoreType>>({});

    const updateScore = (id: string, field: string, value: any) => {
        setScores(prev => {
            const newItem = { ...prev[id], [field]: value };

            // Auto-calculate score for technical if Actual changes
            // Logic: >101% = 5, 95.1-100 = 4, 75.1-95 = 3, 50.1-75 = 2, <50 = 1
            if (field === 'actual' && technicalKpis.find(k => k.id === id)) {
                const num = parseFloat(value);
                if (!isNaN(num)) {
                    if (num > 101) newItem.score = 5;
                    else if (num > 95) newItem.score = 4;
                    else if (num > 75) newItem.score = 3;
                    else if (num > 50) newItem.score = 2;
                    else newItem.score = 1;
                }
            }

            return { ...prev, [id]: newItem };
        });
    };

    const results = useMemo(() => {
        // Behavior Avg
        const bIds = behavioralKpis.map(k => k.id);
        const bSum = bIds.reduce((acc, id) => acc + (scores[id]?.score || 0), 0);
        const bAvg = bIds.length ? bSum / bIds.length : 0;

        // Technical Weighted Sum
        const tIds = technicalKpis.map(k => k.id);
        let tSum = 0;
        tIds.forEach(id => {
            const item = scores[id];
            if (item) {
                tSum += (item.weight / 100) * item.score;
            }
        });

        // Final Formula: C (40%) + D (60%)
        const final = (bAvg * 0.4) + (tSum * 0.6);

        // Grade
        let grade = '';
        if (final <= 1.50) grade = 'Poor';
        else if (final <= 2.50) grade = 'Unsatisfactory';
        else if (final <= 3.50) grade = 'Fair/Need Improvement';
        else if (final <= 4.50) grade = 'Good/Meet Expectation';
        else grade = 'Very Good/Exceed Expectation';

        return { behavior: bAvg, technical: tSum, final, grade };
    }, [scores, behavioralKpis, technicalKpis]);

    return { scores, setScores, updateScore, results };
};
