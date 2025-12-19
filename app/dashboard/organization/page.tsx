
import { prisma } from "@/lib/prisma";
import OrgChart from "@/components/org/OrgChart";

export default function OrganizationPage() {
    return (
        <div className="min-h-screen p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Organization Chart</h1>
                <p className="text-slate-500">Manage structure and hierarchy visually.</p>
            </div>
            <OrgChart />
        </div>
    );
}
