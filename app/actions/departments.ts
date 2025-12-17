'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { z } from "zod";

const DepartmentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
});

export async function getDepartments() {
    const departments = await prisma.department.findMany({
        include: { _count: { select: { users: true } } },
        orderBy: { name: 'asc' }
    });
    return departments;
}

export async function getDepartmentById(id: string) {
    const department = await prisma.department.findUnique({
        where: { id },
        include: { _count: { select: { users: true } } }
    });
    return department;
}

export async function createDepartment(formData: FormData) {
    // RBAC
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return { error: "Unauthorized. Only Admins can create departments." };
    }

    const rawData = {
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || undefined,
    };

    const validated = DepartmentSchema.safeParse(rawData);
    if (!validated.success) {
        return { error: "Validation failed: " + validated.error.issues.map(e => e.message).join(", ") };
    }

    try {
        await prisma.department.create({
            data: {
                name: validated.data.name,
                description: validated.data.description,
            }
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { error: "Department with this name already exists." };
        }
        return { error: "Failed to create department." };
    }

    revalidatePath("/dashboard/departments");
    redirect("/dashboard/departments");
}

export async function updateDepartment(id: string, formData: FormData) {
    // RBAC
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return { error: "Unauthorized" };
    }

    const rawData = {
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || undefined,
    };

    try {
        await prisma.department.update({
            where: { id },
            data: {
                name: rawData.name,
                description: rawData.description,
            }
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { error: "Department with this name already exists." };
        }
        return { error: "Failed to update department." };
    }

    revalidatePath("/dashboard/departments");
    redirect("/dashboard/departments");
}

export async function deleteDepartment(id: string) {
    // RBAC
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return { error: "Unauthorized" };
    }

    // Check if department has employees
    const dept = await prisma.department.findUnique({
        where: { id },
        include: { _count: { select: { users: true } } }
    });

    if (dept && dept._count.users > 0) {
        return { error: `Cannot delete. ${dept._count.users} employees are assigned to this department.` };
    }

    try {
        await prisma.department.delete({
            where: { id }
        });
    } catch (error) {
        return { error: "Failed to delete department." };
    }

    revalidatePath("/dashboard/departments");
}
