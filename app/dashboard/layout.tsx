import DashboardShell from "@/components/dashboard/DashboardShell";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <DashboardShell user={session?.user as any}>
            {children}
        </DashboardShell>
    );
}
