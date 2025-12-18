'use server'

import { prisma } from "@/lib/prisma";
import { KpiType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { z } from "zod";

const KpiSchema = z.object({
    category: z.string().min(1, "Category is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.nativeEnum(KpiType),
    departmentId: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
    defaultWeight: z.number().min(0).max(100).default(0),
});

export async function getKpiCriteria() {
    const kpis = await prisma.kpiCriteria.findMany({
        include: { department: true },
        orderBy: [{ type: 'asc' }, { category: 'asc' }, { title: 'asc' }]
    });
    return kpis;
}

export async function getKpiById(id: string) {
    const kpi = await prisma.kpiCriteria.findUnique({
        where: { id },
        include: { department: true }
    });
    return kpi;
}

export async function createKpiCriteria(formData: FormData) {
    // RBAC
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
        return { error: "Unauthorized. Only Admins or Managers can create KPIs." };
    }

    const rawData = {
        category: formData.get("category") as string,
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        type: formData.get("type") as KpiType,
        departmentId: (formData.get("departmentId") as string) || null,
        position: (formData.get("position") as string) || null,
        defaultWeight: Number(formData.get("defaultWeight")) || 0,
    };

    const validated = KpiSchema.safeParse(rawData);
    if (!validated.success) {
        return { error: "Validation failed: " + validated.error.issues.map(e => e.message).join(", ") };
    }

    try {
        await prisma.kpiCriteria.create({
            data: {
                category: validated.data.category,
                title: validated.data.title,
                description: validated.data.description,
                type: validated.data.type,
                departmentId: validated.data.departmentId,
                position: validated.data.position,
                defaultWeight: validated.data.defaultWeight,
            }
        });
    } catch (error) {
        console.error("Failed to create KPI:", error);
        return { error: "Failed to create KPI criteria." };
    }

    revalidatePath("/dashboard/kpi");
    revalidatePath("/dashboard/kpi");
    return { success: true };
}

export async function updateKpiCriteria(id: string, formData: FormData) {
    // RBAC
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
        return { error: "Unauthorized" };
    }

    const rawData = {
        category: formData.get("category") as string,
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        type: formData.get("type") as KpiType,
        departmentId: (formData.get("departmentId") as string) || null,
        position: (formData.get("position") as string) || null,
        defaultWeight: Number(formData.get("defaultWeight")) || 0,
    };

    try {
        await prisma.kpiCriteria.update({
            where: { id },
            data: {
                category: rawData.category,
                title: rawData.title,
                description: rawData.description,
                type: rawData.type,
                departmentId: rawData.departmentId,
                position: rawData.position,
                defaultWeight: rawData.defaultWeight,
            }
        });
    } catch (error) {
        console.error("Failed to update KPI:", error);
        return { error: "Failed to update KPI criteria." };
    }

    revalidatePath("/dashboard/kpi");
    revalidatePath("/dashboard/kpi");
    return { success: true };
}

export async function deleteKpiCriteria(id: string) {
    // RBAC
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
        return { error: "Unauthorized" };
    }

    try {
        await prisma.kpiCriteria.delete({
            where: { id }
        });
    } catch (error) {
        console.error("Failed to delete KPI:", error);
        return { error: "Failed to delete KPI. It might be in use by evaluations." };
    }

    revalidatePath("/dashboard/kpi");
}
