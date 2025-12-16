'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { EmployeeStatus, Gender, Role } from "@prisma/client";

export async function createEmployee(formData: FormData) {
    const name = formData.get("name") as string;
    const employeeId = formData.get("employeeId") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const departmentId = formData.get("departmentId") as string;
    const position = formData.get("position") as string;
    const gender = formData.get("gender") as Gender;
    const role = formData.get("role") as Role;
    const managerId = formData.get("managerId") as string;
    const joinDate = formData.get("joinDate") as string;

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
    redirect("/dashboard/employees");
}
