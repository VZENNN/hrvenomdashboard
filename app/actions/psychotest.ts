'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { QuestionType } from "@prisma/client";

// --- VALIDATION SCHEMAS ---

const CategorySchema = z.object({
    name: z.string().min(1, "Name required"),
    description: z.string().optional(),
    timeLimit: z.number().min(1, "Time limit must be positive"),
    order: z.number().int(),
});

const QuestionSchema = z.object({
    content: z.string().min(1, "Content required"),
    type: z.nativeEnum(QuestionType),
    categoryId: z.string().min(1, "Category required"),
    image: z.string().optional(), // URL or Path
    options: z.array(z.object({
        label: z.string(),
        text: z.string()
    })).optional(),
});

// --- CATEGORIES ---

export async function getPsychotestCategories() {
    return await prisma.psychotestCategory.findMany({
        orderBy: { order: 'asc' },
        include: {
            questions: true,
            _count: { select: { questions: true } }
        }
    });
}

export async function createPsychotestCategory(data: z.infer<typeof CategorySchema>) {
    const parsed = CategorySchema.safeParse(data);
    if (!parsed.success) throw new Error("Invalid data");

    await prisma.psychotestCategory.create({
        data: parsed.data,
    });
    revalidatePath("/dashboard/psychotest");
}

export async function getPsychotestCategoryById(id: string) {
    return await prisma.psychotestCategory.findUnique({
        where: { id },
        include: {
            questions: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });
}

export async function updatePsychotestCategory(id: string, data: Partial<z.infer<typeof CategorySchema>>) {
    await prisma.psychotestCategory.update({
        where: { id },
        data,
    });
    revalidatePath("/dashboard/psychotest");
}

export async function deletePsychotestCategory(id: string) {
    await prisma.psychotestCategory.delete({
        where: { id },
    });
    revalidatePath("/dashboard/psychotest");
}

// --- QUESTIONS ---

export async function getQuestionsByCategory(categoryId: string) {
    return await prisma.psychotestQuestion.findMany({
        where: { categoryId },
        orderBy: { createdAt: 'asc' }
    });
}

export async function createPsychotestQuestion(data: any) {
    // Handling image upload is expected to be done before calling this, or passed as base64/url
    // For now, assuming 'image' in data is the string URL.

    // Validate simple fields
    const { content, type, categoryId, image, options } = data;

    if (!content || !categoryId) throw new Error("Missing required fields");

    // Ensure options is valid JSON if provided

    await prisma.psychotestQuestion.create({
        data: {
            content,
            type: type as QuestionType,
            categoryId,
            image,
            options: options ?? PrismaSerializable(options),
        }
    });
    revalidatePath(`/dashboard/psychotest/questions?category=${categoryId}`);
}

export async function deletePsychotestQuestion(id: string) {
    await prisma.psychotestQuestion.delete({
        where: { id },
    });
    revalidatePath("/dashboard/psychotest/questions");
}

export async function getPsychotestQuestionById(id: string) {
    return await prisma.psychotestQuestion.findUnique({
        where: { id }
    });
}

export async function updatePsychotestQuestion(id: string, data: any) {
    // Validate simple fields like create
    const { content, type, categoryId, image, options } = data;

    if (!content || !categoryId) throw new Error("Missing required fields");

    await prisma.psychotestQuestion.update({
        where: { id },
        data: {
            content,
            type: type as QuestionType,
            categoryId,
            image, // If undefined, prisma will not update it? No, we need to handle this carefully.
            // Actually in update, undefined in 'data' object usually means "do not touch" in many ORMs but Prisma treats undefined as "do nothing" only if explicitly set to undefined.
            // Let's ensure we pass explicit values.
            options: options ?? PrismaSerializable(options),
        }
    });
    revalidatePath(`/dashboard/psychotest/questions?category=${categoryId}`);
    revalidatePath("/dashboard/psychotest/questions");
}


// Helper for JSON serialization if needed
function PrismaSerializable(val: any) {
    if (val === undefined) return null;
    return val;
}

// --- RESULTS ---

export async function getPsychotestResults() {
    return await prisma.psychotestResult.findMany({
        include: {
            user: true,
            category: true
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function deletePsychotestResult(id: string) {
    await prisma.psychotestResult.delete({
        where: { id }
    });
    revalidatePath("/dashboard/psychotest/results");
}

export async function getPsychotestResultById(id: string) {
    return await prisma.psychotestResult.findUnique({
        where: { id },
        include: {
            user: true,
            category: {
                include: {
                    questions: {
                        orderBy: { createdAt: 'asc' }
                    }
                }
            }
        }
    });
}


// --- APPLICANT FLOW ---

export async function getApplicantNextCategory(userId: string) {
    // 1. Get all categories ordered
    const categories = await prisma.psychotestCategory.findMany({
        orderBy: { order: 'asc' }
    });

    // 2. Get user results
    const results = await prisma.psychotestResult.findMany({
        where: { userId },
        select: { categoryId: true }
    });
    const completedIds = new Set(results.map(r => r.categoryId));

    // 3. Find first not completed
    const nextCategory = categories.find(c => !completedIds.has(c.id));
    return nextCategory || null;
}

export async function isCategoryCompleted(userId: string, categoryId: string) {
    const count = await prisma.psychotestResult.count({
        where: { userId, categoryId }
    });
    return count > 0;
}

export async function submitPsychotestCategory(userId: string, categoryId: string, answers: Record<string, any>) {
    await prisma.psychotestResult.upsert({
        where: {
            userId_categoryId: {
                userId,
                categoryId
            }
        },
        create: {
            userId,
            categoryId,
            answers,
        },
        update: {
            // Do not update answers if already exists. This prevents resubmission via back button.
        }
    });

    // Revalidate dashboard and current test page to ensure status is updated
    revalidatePath("/applicant/dashboard");
    revalidatePath(`/applicant/test/${categoryId}`);

    const next = await getApplicantNextCategory(userId);
    return next ? `/applicant/test/${next.id}/intro` : `/applicant/finished`;
}
