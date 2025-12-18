import { z } from "zod";
import { Gender, Role, KpiType } from "@prisma/client";

// ==========================================
// Employee Schemas
// ==========================================
export const EmployeeSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    employeeId: z.string().min(1, "Employee ID is required"),
    email: z.string().email("Invalid email address"),
    // Password is only required for creation, optional for updates if we handle it separately
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')),
    departmentId: z.string().optional().nullable(),
    position: z.string().min(1, "Position is required"),
    gender: z.nativeEnum(Gender),
    role: z.nativeEnum(Role).default(Role.EMPLOYEE),
    managerId: z.string().optional().nullable(),
    joinDate: z.string().optional(),
});

// ==========================================
// Department Schemas
// ==========================================
export const DepartmentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
});

// ==========================================
// KPI Schemas
// ==========================================
export const KpiCriteriaSchema = z.object({
    category: z.string().min(1, "Category is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.nativeEnum(KpiType),
    departmentId: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
    defaultWeight: z.coerce.number().min(0).max(100).default(0),
});
