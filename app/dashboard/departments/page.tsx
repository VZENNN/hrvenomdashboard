import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import DepartmentsClient from '@/components/departments/DepartmentsClient';

export default async function DepartmentsPage() {
    const session = await auth();
    const user = session?.user;

    const where: any = {};

    // If MANAGER, restrict to own department and managed departments
    if (user?.role === 'MANAGER') {
        const allowedIds = [
            user.departmentId,
            ...(user.managedDepartmentIds || [])
        ].filter(Boolean) as string[];

        where.id = { in: allowedIds };
    }
    // If ADMIN (or others for now), show all (default empty where)
    // Note: If you want to restrict standard EMPLOYEES as well, add another condition here.

    const departments = await prisma.department.findMany({
        where,
        include: {
            _count: { select: { users: true, kpiCriteria: true } }
        },
        orderBy: { name: 'asc' }
    });

    return <DepartmentsClient departments={departments} />;
}
