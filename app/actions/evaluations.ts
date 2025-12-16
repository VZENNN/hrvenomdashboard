'use server'

import { prisma } from "@/lib/prisma";
import { KpiType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getEvaluationMetadata(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { department: true }
    });

    if (!user) throw new Error("User not found");

    // 1. Behavioral KPIs (Fixed / Global)
    const behavioral = await prisma.kpiCriteria.findMany({
        where: { type: KpiType.BEHAVIORAL },
        orderBy: { title: 'asc' }
    });

    // 2. Technical KPIs (Dynamic based on Dept & Position)
    // Logic: Get criteria where (deptId == user.deptId OR deptId is null) AND (position == user.position OR position is null)
    // Actually, standard is usually specific. Let's try to find matches.
    // Using explicit query for now.
    const technical = await prisma.kpiCriteria.findMany({
        where: {
            type: KpiType.TECHNICAL,
            departmentId: user.departmentId,
            OR: [
                { position: user.position }, // Specific match
                { position: null }           // Or general dept KPI (fallback)
            ]
        }
    });

    return { user, behavioral, technical };
}

export async function createEvaluation(data: any) {
    // Parsing logic handled in component usually, but here we expect clean data structure
    // data = { userId, appraiserId, month, year, items: [{ kpiId, target, actual, score }] }

    const { userId, appraiserId, month, year, items, feedback } = data;

    // Calculate Scores Server Side for security
    let totalBehaviorScore = 0;
    let countBehavior = 0;

    let totalTechnicalScoreWeighted = 0; // Sum of (Score * Weight%)
    let totalTechnicalWeight = 0;

    // We need to re-fetch KPIs to adhere to weight rules if dynamic, but for now we trust the inputs 
    // or better, we classify items by Type based on DB.

    // Let's simplified: We trust the "Score" and "Weight" sent from client for now, 
    // BUT proper way is recalculating. I will recalculate final score.

    const behaviorItems = items.filter((i: any) => i.type === 'BEHAVIORAL');
    const technicalItems = items.filter((i: any) => i.type === 'TECHNICAL');

    // Behavior: Simple Average
    if (behaviorItems.length > 0) {
        const sum = behaviorItems.reduce((acc: number, item: any) => acc + Number(item.score), 0);
        totalBehaviorScore = sum / behaviorItems.length;
    }

    // Technical: Weighted Sum
    // In the screenshot: Bobot (30%) * Nilai (3) = 0.9
    // Total Nilai = Sum of these.
    // So Score is Sum (Weight/100 * Score)

    if (technicalItems.length > 0) {
        technicalItems.forEach((item: any) => {
            totalTechnicalScoreWeighted += (Number(item.weight) / 100) * Number(item.score);
            totalTechnicalWeight += Number(item.weight);
        });
    }

    // Final Score: (Behavior * 40%) + (Technical * 60%)
    // Wait, in screenshot E. NILAI TOTAL
    // Bagian C (Perilaku) 4.25 (Rata-rata) * 40% = 1.7
    // Bagian D (KPI) 2.9 (Total Nilai from weighted sum) * 60% = 1.74
    // Total = 3.44.

    const finalScore = (totalBehaviorScore * 0.4) + (totalTechnicalScoreWeighted * 0.6);

    try {
        await prisma.evaluation.create({
            data: {
                userId,
                appraiserId, // Need to pass this from session
                month: Number(month),
                year: Number(year),
                behaviorScore: totalBehaviorScore,
                technicalScore: totalTechnicalScoreWeighted,
                finalScore: finalScore,
                feedback,
                items: {
                    create: items.map((item: any) => ({
                        criteriaId: item.criteriaId,
                        target: item.target,
                        actual: item.actual,
                        weight: Number(item.weight),
                        score: Number(item.score),
                        comment: item.comment // Added comment field
                    }))
                }
            }
        });
    } catch (e) {
        console.error(e);
        return { error: "Failed to save evaluation." };
    }

    revalidatePath("/dashboard/evaluation");
    redirect("/dashboard/evaluation");
}
