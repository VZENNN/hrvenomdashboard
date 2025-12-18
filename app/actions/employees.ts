'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { EmployeeStatus, Gender, Role } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/auth";

const CreateEmployeeSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    employeeId: z.string().min(1, "Employee ID is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    departmentId: z.string().optional().nullable(),
    position: z.string().min(1, "Position is required"),
    gender: z.nativeEnum(Gender),
    role: z.nativeEnum(Role).default(Role.EMPLOYEE),
    managerId: z.string().optional().nullable(),
    joinDate: z.string().optional(), // We'll parse to Date later
});

export async function createEmployee(formData: FormData) {
    // 1. Security Check (RBAC)
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
        return { error: "Unauthorized. Only Admins or Managers can create employees." };
    }

    // 2. Data Validation (Zod)
    const rawData = {
        name: formData.get("name"),
        employeeId: formData.get("employeeId"),
        email: formData.get("email"),
        password: formData.get("password"),
        departmentId: formData.get("departmentId") || null, // Handle empty string as null
        position: formData.get("position"),
        gender: formData.get("gender"),
        role: formData.get("role"),
        managerId: formData.get("managerId") || null, // Handle empty string as null
        joinDate: formData.get("joinDate"),
    };

    const validatedFields = CreateEmployeeSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            error: "Validation failed: " + validatedFields.error.issues.map(e => e.message).join(", ")
        };
    }

    const {
        name, employeeId, email, password, departmentId,
        position, gender, role, managerId, joinDate
    } = validatedFields.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.create({
            data: {
                name,
                employeeId,
                email,
                password: hashedPassword,
                departmentId: departmentId || null,
                position,
                gender,
                role: role || Role.EMPLOYEE,
                managerId: managerId || null,
                status: EmployeeStatus.ACTIVE,
                joinDate: joinDate ? new Date(joinDate) : new Date(),
            },
        });
    } catch (error) {
        console.error("Failed to create employee:", error);
        return { error: "Failed to create employee. Email or ID might already exist." };
    }

    revalidatePath("/dashboard/employees");
    revalidatePath("/dashboard/employees");
    return { success: true };
}

export async function deleteEmployee(id: string) {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
        return { error: "Unauthorized" };
    }

    try {
        await prisma.user.delete({
            where: { id }
        });
    } catch (error) {
        return { error: "Failed to delete employee" };
    }

    revalidatePath("/dashboard/employees");
}

export async function getEmployeeById(id: string) {
    const user = await prisma.user.findUnique({
        where: { id },
        include: { department: true }
    });
    return user;
}

export async function updateEmployee(id: string, formData: FormData) {
    // 1. RBAC
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
        return { error: "Unauthorized" };
    }

    const rawData = {
        name: formData.get("name"),
        employeeId: formData.get("employeeId"),
        email: formData.get("email"),
        departmentId: formData.get("departmentId") || null,
        position: formData.get("position"),
        gender: formData.get("gender"),
        role: formData.get("role"),
        managerId: formData.get("managerId") || null,
        joinDate: formData.get("joinDate"),
    };

    try {
        await prisma.user.update({
            where: { id },
            data: {
                name: rawData.name as string,
                employeeId: rawData.employeeId as string,
                email: rawData.email as string,
                departmentId: rawData.departmentId as string,
                position: rawData.position as string,
                gender: rawData.gender as any,
                role: rawData.role as any,
                managerId: rawData.managerId as string,
                joinDate: rawData.joinDate ? new Date(rawData.joinDate as string) : undefined,
            }
        });
    } catch (error) {
        return { error: "Failed to update employee" };
    }

    revalidatePath("/dashboard/employees");
    revalidatePath("/dashboard/employees");
    return { success: true };
}
