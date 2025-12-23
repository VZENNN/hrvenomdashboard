'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 1. Validation Schema
const OrganizationDivisionSchema = z.object({
    id: z.string().uuid().optional().or(z.string()),
    name: z.string().min(1, "Nama divisi wajib diisi"),
    nodes: z.array(z.any()).default([]), // Allow any structure for React Flow nodes for now
    edges: z.array(z.any()).default([])
});

type OrganizationDivisionInput = z.input<typeof OrganizationDivisionSchema>;

export async function getVenomDivisions() {
    try {
        const divisions = await prisma.venomDivision.findMany({
            orderBy: { createdAt: 'asc' }
        });
        return divisions;
    } catch (error) {
        console.error("Failed to fetch divisions:", error);
        return [];
    }
}

export async function saveVenomDivision(data: OrganizationDivisionInput) {
    try {
        // Validate
        const result = OrganizationDivisionSchema.safeParse(data);
        if (!result.success) {
            console.error("Validation Error:", result.error);
            return { success: false, error: "Data struktur organisasi tidak valid." };
        }

        const { id, name, nodes, edges } = result.data;

        await prisma.venomDivision.upsert({
            where: { id: id || "new" },
            update: {
                name,
                nodes,
                edges
            },
            create: {
                id: id || undefined, // Let DB generate CUID if empty? Actually schema says ID is required on upsert. 
                // Wait, CUID default is on DB. But upsert needs unique ID.
                // Organization logic (OrgChart.tsx) generates UUID v4 on client. So ID is always present.
                // We'll trust the input ID.
                name,
                nodes,
                edges
            }
        });
        revalidatePath("/dashboard/organization");
        return { success: true };
    } catch (error) {
        console.error("Failed to save division:", error);
        return { success: false, error: "Gagal menyimpan struktur organisasi." };
    }
}

export async function deleteVenomDivision(id: string) {
    try {
        await prisma.venomDivision.delete({
            where: { id }
        });
        revalidatePath("/dashboard/organization");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete division:", error);
        return { success: false, error: "Gagal menghapus divisi." };
    }
}
