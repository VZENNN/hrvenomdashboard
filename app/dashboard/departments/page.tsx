import { prisma } from '@/lib/prisma';
import DepartmentsClient from '@/components/departments/DepartmentsClient';

export default async function DepartmentsPage() {
    const departments = await prisma.department.findMany({
        include: {
            _count: { select: { users: true, kpiCriteria: true } }
        },
        orderBy: { name: 'asc' }
    });

    return <DepartmentsClient departments={departments} />;
}
