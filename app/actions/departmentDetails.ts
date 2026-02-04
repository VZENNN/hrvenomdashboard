'use server';

import { prisma } from '@/lib/prisma';

import { auth } from '@/auth';

export async function getDepartmentWithEmployees(departmentId: string) {
    const session = await auth();
    const currentUser = session?.user;

    // RBAC: If MANAGER, check if they have access to this department
    if (currentUser?.role === 'MANAGER') {
        const allowedIds = [
            currentUser.departmentId,
            ...(currentUser.managedDepartmentIds || [])
        ].filter(Boolean) as string[];

        if (!allowedIds.includes(departmentId)) {
            return null;
        }
    }

    const department = await prisma.department.findUnique({
        where: { id: departmentId },
        include: {
            users: {
                include: {
                    evaluations: {
                        orderBy: { createdAt: 'desc' },
                        take: 5, // Last 5 evaluations
                        select: {
                            id: true,
                            month: true,
                            year: true,
                            finalScore: true,
                            behaviorScore: true,
                            technicalScore: true,
                            createdAt: true,
                        }
                    }
                },
                orderBy: { name: 'asc' }
            },
            kpiCriteria: {
                select: { id: true, title: true, type: true }
            },
            _count: {
                select: { users: true, kpiCriteria: true }
            }
        }
    });

    return department;
}

export async function getEmployeeEvaluationHistory(userId: string) {
    const evaluations = await prisma.evaluation.findMany({
        where: { userId },
        include: {
            appraiser: { select: { name: true } },
            items: {
                include: {
                    criteria: { select: { title: true, type: true, category: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 12 // Last 12 months
    });

    return evaluations;
}
