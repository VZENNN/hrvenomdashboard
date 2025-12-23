'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 1. Define Validation Schema
const CalendarEventSchema = z.object({
    id: z.string().uuid().optional().or(z.string()), // Accept simple string if not UUID compliant yet, but UUID is preferred
    title: z.string().min(1, "Judul acara wajib diisi"),
    start: z.union([z.string(), z.date()]).transform((val) => new Date(val)),
    end: z.union([z.string(), z.date()]).optional().nullable().transform((val) => val ? new Date(val) : null),
    allDay: z.boolean().default(false),
    description: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
});

type CalendarEventInput = z.input<typeof CalendarEventSchema>;

// Update getVenomEvents to accept optional start/end range
// If not provided, it fetches all (legacy behavior support if needed, or we can enforce it).
export async function getVenomEvents(start?: Date, end?: Date) {
    try {
        const whereClause: any = {};

        // Logic: Event overlaps with the window if:
        // (EventStart < WindowEnd) AND (EventEnd > WindowStart)
        if (start && end) {
            whereClause.AND = [
                { start: { lt: end } },
                {
                    OR: [
                        { end: { gt: start } },
                        { end: null, start: { gte: start } } // Handle single day events or null end
                    ]
                }
            ];
        }

        const events = await prisma.venomCalendarEvent.findMany({
            where: whereClause,
            orderBy: { start: 'asc' }
        });
        return events;
    } catch (error) {
        console.error("Failed to fetch events:", error);
        return [];
    }
}

export async function upsertVenomEvent(data: CalendarEventInput) {
    try {
        // 2. Validate Input
        const result = CalendarEventSchema.safeParse(data);

        if (!result.success) {
            console.error("Validation Error:", result.error);
            return { success: false, error: "Data acara tidak valid." };
        }

        const { id, title, start, end, allDay, description, color } = result.data;

        await prisma.venomCalendarEvent.upsert({
            where: { id: id || "new" }, // Handle case where ID might be empty string if creating? Usually provided by client UUID.
            update: {
                title,
                start,
                end,
                allDay,
                description,
                color
            },
            create: {
                id,
                title,
                start,
                end,
                allDay,
                description,
                color
            }
        });
        revalidatePath("/dashboard/calendar");
        return { success: true };
    } catch (error) {
        console.error("Failed to save event:", error);
        return { success: false, error: "Gagal menyimpan acara ke database." };
    }
}

export async function deleteVenomEvent(id: string) {
    try {
        await prisma.venomCalendarEvent.delete({
            where: { id }
        });
        revalidatePath("/dashboard/calendar");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete event:", error);
        return { success: false, error: "Gagal menghapus acara." };
    }
}
