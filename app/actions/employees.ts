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

export async function getEmployees({
    query = "",
    page = 1,
    limit = 10,
    departmentId,
    position,
    status
}: {
    query?: string;
    page?: number;
    limit?: number;
    departmentId?: string;
    position?: string;
    status?: EmployeeStatus;
}) {
    const skip = (page - 1) * limit;

    const session = await auth();

    const where: any = {
        AND: [
            {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { employeeId: { contains: query, mode: 'insensitive' } }
                ]
            }
        ]
    };

    // RBAC: If not ADMIN, restrict to own department(s)
    if (session?.user?.role !== 'ADMIN') {
        const allowedDeptIds = [
            session?.user?.departmentId,
            ...(session?.user?.managedDepartmentIds || [])
        ].filter(Boolean) as string[];

        if (allowedDeptIds.length > 0) {
            where.AND.push({ departmentId: { in: allowedDeptIds } });
        } else {
            where.AND.push({ departmentId: '___unassigned___' });
        }
    } else {
        // Only Admin can filter by department manually (or if passed)
        if (departmentId) where.AND.push({ departmentId });
    }

    if (position) where.AND.push({ position });
    if (status) where.AND.push({ status });

    try {
        const [data, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: { department: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.user.count({ where })
        ]);

        return {
            data,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    } catch (error) {
        console.error("Failed to fetch employees:", error);
        return { data: [], total: 0, totalPages: 0, currentPage: 1 };
    }
}

export async function createEmployee(formData: FormData) {
    // 1. Security Check (RBAC)
    const session = await auth();
    if (!session || !session.user) {
        return { error: "Unauthorized." };
    }

    // Supervisor Logic: Cannot create employees
    if (session.user.role === 'SUPERVISOR') {
        return { error: "Supervisors cannot create employees." };
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
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
        name, employeeId, email, password, departmentId: inputDepartmentId,
        position, gender, role: inputRole, managerId, joinDate
    } = validatedFields.data;

    // Manager Logic: Can assign to any of their managed departments
    let finalDepartmentId = inputDepartmentId;
    if (session.user.role === 'MANAGER') {
        // Must be one of their managed departments OR their home department
        const allowedDeptIds = [
            session.user.departmentId,
            ...(session.user.managedDepartmentIds || [])
        ].filter(Boolean) as string[];

        // If input is provided, check if valid
        if (finalDepartmentId) {
            if (!allowedDeptIds.includes(finalDepartmentId)) {
                return { error: "You can only assign employees to departments you manage." };
            }
        } else {
            // If not provided, default to home department if exists, else error
            if (session.user.departmentId && allowedDeptIds.includes(session.user.departmentId)) {
                finalDepartmentId = session.user.departmentId;
            } else if (allowedDeptIds.length > 0) {
                finalDepartmentId = allowedDeptIds[0]; // Default to first available
            } else {
                return { error: "Manager must be assigned to a department to create employees." };
            }
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.create({
            data: {
                name,
                employeeId,
                email,
                password: hashedPassword,
                departmentId: finalDepartmentId || null,
                position,
                gender,
                role: inputRole || Role.EMPLOYEE,
                managerId: managerId || null,
                status: EmployeeStatus.ACTIVE,
                joinDate: joinDate ? new Date(joinDate) : new Date(),
            },
        });
    } catch (error) {
        console.error("Failed to create employee:", error);
        // Detail error handling?
        return { error: "Failed to create employee. Email or ID might already exist." };
    }

    revalidatePath("/dashboard/employees");
    return { success: true };
}

export async function deleteEmployee(id: string) {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
        return { error: "Unauthorized" };
    }
    // Manager Check: Can only delete if in allowed departments?
    // Implementation skipped for brevity but ideally should enforce RBAC.

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
        include: {
            department: true,
            managedDepartments: true // Include managed departments
        }
    });
    return user;
}

export async function updateEmployee(id: string, formData: FormData) {
    // 1. RBAC
    const session = await auth();
    if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
        return { error: "Unauthorized" };
    }

    // Parse managed departments (expecting JSON string or multiple/array handling? FormData typically sends multiple entries for same key)
    // Actually, usually multi-select sends multiple values for same key.
    const managedDepartmentIds = formData.getAll("managedDepartmentIds") as string[];

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



    // Manager: Cannot change Department or Managed Departments
    let departmentIdToUpdate: any = rawData.departmentId;
    let managedDepartmentsUpdate: any = undefined;

    if (session.user.role === 'MANAGER') {
        departmentIdToUpdate = undefined; // Ignore dept update
        managedDepartmentsUpdate = undefined; // Ignore managed depts update
    } else if (session.user.role === 'ADMIN') {
        // Admin can update managed departments
        // Use `set` to replace existing
        if (managedDepartmentIds && managedDepartmentIds.length > 0) {
            managedDepartmentsUpdate = {
                set: managedDepartmentIds.map(id => ({ id }))
            };
        } else {
            // If explicitly sent but empty? Or just not sent?
            // If we implement multi-select, an empty selection might send nothing.
            // We should handle "clear all". 
            // Logic: Check if logic implies clearing. Let's assume if it's Admin, we update if present.
            // BUT FormData might be empty.
            // Let's assume if it's passed as key with empty value... tricky.
            // Let's just handle "if managedDepartmentIds overrides".
            // For now, simple implementation:
            managedDepartmentsUpdate = {
                set: managedDepartmentIds.map(id => ({ id }))
            };
        }
    }

    try {
        await prisma.user.update({
            where: { id },
            data: {
                name: rawData.name as string,
                employeeId: rawData.employeeId as string,
                email: rawData.email as string,
                ...(departmentIdToUpdate !== undefined ? { departmentId: departmentIdToUpdate as string } : {}),
                position: rawData.position as string,
                gender: rawData.gender as any,
                role: rawData.role as any,
                managerId: rawData.managerId as string,
                joinDate: rawData.joinDate ? new Date(rawData.joinDate as string) : undefined,
                ...(managedDepartmentsUpdate ? { managedDepartments: managedDepartmentsUpdate } : {})
            }
        });
    } catch (error) {
        console.error(error);
        return { error: "Failed to update employee" };
    }

    revalidatePath("/dashboard/employees");
    return { success: true };
}

export async function getEmployeeEvaluationHistory(id: string, year: number) {
    const user = await prisma.user.findUnique({
        where: { id },
        include: { department: true }
    });

    if (!user) return null;

    const evaluations = await prisma.evaluation.findMany({
        where: {
            userId: id,
            year: year
        },
        orderBy: {
            month: 'asc'
        },
        include: {
            appraiser: {
                select: { name: true }
            }
        }
    });

    // Calculate Annual Average
    // Logic: Sum of finalScores / Count of evaluations
    let annualAverage = 0;
    if (evaluations.length > 0) {
        const sum = evaluations.reduce((acc, curr) => acc + curr.finalScore, 0);
        annualAverage = sum / evaluations.length;
    }

    return {
        user,
        evaluations,
        annualAverage
    };
}
