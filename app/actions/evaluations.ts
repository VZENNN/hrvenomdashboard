'use server'

import { prisma } from "@/lib/prisma";
import { KpiType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";

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

export async function checkExistingEvaluation(userId: string, month: number, year: number) {
    const exists = await prisma.evaluation.findFirst({
        where: {
            userId,
            month,
            year
        }
    });
    return !!exists;
}

const EvaluationItemSchema = z.object({
    criteriaId: z.string(),
    target: z.string().optional().nullable(),
    actual: z.string().optional().nullable(),
    score: z.union([z.number(), z.string()]).transform((val) => Number(val)),
    weight: z.union([z.number(), z.string()]).transform((val) => Number(val)),
    comment: z.string().optional().nullable(),
    type: z.enum(['BEHAVIORAL', 'TECHNICAL'])
});

const CreateEvaluationSchema = z.object({
    userId: z.string().min(1, "Employee ID is required"),
    appraiserId: z.string().min(1, "Appraiser ID is required"),
    month: z.union([z.number(), z.string()]).transform((val) => Number(val)),
    year: z.union([z.number(), z.string()]).transform((val) => Number(val)),
    items: z.array(EvaluationItemSchema),
    feedback: z.string().optional().nullable()
});

type CreateEvaluationInput = z.input<typeof CreateEvaluationSchema>;

export async function createEvaluation(data: CreateEvaluationInput) {
    // 1. Validate Input
    const result = CreateEvaluationSchema.safeParse(data);

    if (!result.success) {
        console.error("Validation Error:", result.error);
        return { error: "Invalid evaluation data." };
    }

    const { userId, appraiserId, month, year, items, feedback } = result.data;

    // Calculate Scores Server Side for security
    let totalBehaviorScore = 0;
    let totalTechnicalScoreWeighted = 0;

    const behaviorItems = items.filter(i => i.type === 'BEHAVIORAL');
    const technicalItems = items.filter(i => i.type === 'TECHNICAL');

    // Behavior: Simple Average
    if (behaviorItems.length > 0) {
        const sum = behaviorItems.reduce((acc, item) => acc + item.score, 0);
        totalBehaviorScore = sum / behaviorItems.length;
    }

    // Technical: Weighted Sum (Score * Weight%)
    if (technicalItems.length > 0) {
        technicalItems.forEach(item => {
            totalTechnicalScoreWeighted += (item.weight / 100) * item.score;
        });
    }

    // Final Score: (Behavior * 40%) + (Technical * 60%)
    const finalScore = (totalBehaviorScore * 0.4) + (totalTechnicalScoreWeighted * 0.6);

    try {
        await prisma.evaluation.create({
            data: {
                userId,
                appraiserId,
                month,
                year,
                behaviorScore: totalBehaviorScore,
                technicalScore: totalTechnicalScoreWeighted,
                finalScore: finalScore,
                feedback,
                items: {
                    create: items.map(item => ({
                        criteriaId: item.criteriaId,
                        target: item.target,
                        actual: item.actual,
                        weight: item.weight,
                        score: item.score,
                        comment: item.comment
                    }))
                }
            }
        });
    } catch (e) {
        console.error("Database Error:", e);
        return { error: "Failed to save evaluation." };
    }

    revalidatePath("/dashboard/evaluation");
    redirect("/dashboard/evaluation");
}

export async function deleteEvaluation(id: string) {
    const session = await auth();

    // RBAC: Only ADMIN or MANAGER can delete
    if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
        return { error: "Unauthorized. Only Admins or Managers can delete evaluations." };
    }

    try {
        await prisma.evaluation.delete({
            where: { id }
        });
    } catch (error) {
        console.error("Delete Error:", error);
        return { error: "Failed to delete evaluation." };
    }

    revalidatePath("/dashboard/evaluation");
    return { success: true };
}

// Update Schema - nearly identical to creation but ID specific
const UpdateEvaluationSchema = z.object({
    id: z.string().min(1, "Evaluation ID is required"),
    items: z.array(EvaluationItemSchema),
    feedback: z.string().optional().nullable()
});

type UpdateEvaluationInput = z.input<typeof UpdateEvaluationSchema>;

export async function updateEvaluation(data: UpdateEvaluationInput) {
    const session = await auth();

    // STRICT RBAC: Only ADMIN can edit
    if (session?.user?.role !== 'ADMIN') {
        return { error: "Unauthorized. Only Admins can edit evaluations." };
    }

    // 1. Validate Input
    const result = UpdateEvaluationSchema.safeParse(data);

    if (!result.success) {
        console.error("Validation Error:", result.error);
        return { error: "Invalid evaluation update data." };
    }

    const { id, items, feedback } = result.data;

    // Calculate Scores Server Side for security
    let totalBehaviorScore = 0;
    let totalTechnicalScoreWeighted = 0;

    const behaviorItems = items.filter(i => i.type === 'BEHAVIORAL');
    const technicalItems = items.filter(i => i.type === 'TECHNICAL');

    // Behavior: Simple Average
    if (behaviorItems.length > 0) {
        const sum = behaviorItems.reduce((acc, item) => acc + item.score, 0);
        totalBehaviorScore = sum / behaviorItems.length;
    }

    // Technical: Weighted Sum (Score * Weight%)
    if (technicalItems.length > 0) {
        technicalItems.forEach(item => {
            totalTechnicalScoreWeighted += (item.weight / 100) * item.score;
        });
    }

    // Final Score: (Behavior * 40%) + (Technical * 60%)
    const finalScore = (totalBehaviorScore * 0.4) + (totalTechnicalScoreWeighted * 0.6);

    try {
        await prisma.evaluation.update({
            where: { id },
            data: {
                behaviorScore: totalBehaviorScore,
                technicalScore: totalTechnicalScoreWeighted,
                finalScore: finalScore,
                feedback,
                // Transactional update of items: delete old, create new? Or update?
                // Easiest for consistency is delete all items and recreate them, 
                // BUT that changes IDs. Better to update if possible, or upsert.
                // Given the structure, recreating is safer to ensure no stale data remains (e.g. removed KPIs).
                items: {
                    deleteMany: {},
                    create: items.map(item => ({
                        criteriaId: item.criteriaId,
                        target: item.target,
                        actual: item.actual,
                        weight: item.weight,
                        score: item.score,
                        comment: item.comment
                    }))
                }
            }
        });
    } catch (e) {
        console.error("Database Error:", e);
        return { error: "Failed to update evaluation." };
    }

    revalidatePath(`/dashboard/evaluation`);
    revalidatePath(`/dashboard/evaluation/${id}`);
    redirect(`/dashboard/evaluation/${id}`);
}
