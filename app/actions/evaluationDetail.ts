'use server'

import { prisma } from "@/lib/prisma";

export async function getEvaluationById(id: string) {
    const evaluation = await prisma.evaluation.findUnique({
        where: { id },
        include: {
            user: {
                include: { department: true }
            },
            appraiser: true,
            items: {
                include: { criteria: true },
                orderBy: { criteria: { type: 'asc' } }
            }
        }
    });
    return evaluation;
}
