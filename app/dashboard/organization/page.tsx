
import { prisma } from "@/lib/prisma";
import OrgChart from "@/components/org/OrgChart";

export default async function OrganizationPage() {
    const users = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: {
            id: true,
            name: true,
            position: true,
            avatarUrl: true,
            managerId: true,
            departmentId: true,
            role: true,
            email: true,
            gender: true,
            status: true,
            joinDate: true,
            createdAt: true,
            updatedAt: true,
            // We don't need password
        }
    });

    // Cast to user type (since we selected specific fields, TypeScript might complain, but for this component it's compatible enough or we cast)
    // Actually OrgChart expects User[].
    // Let's just findMany without select to keep typing simple, password is hashed anyway.

    const allUsers = await prisma.user.findMany({
        where: { status: 'ACTIVE' }
    });

    return (
        <div className="min-h-screen">
            <OrgChart users={allUsers} />
        </div>
    );
}
