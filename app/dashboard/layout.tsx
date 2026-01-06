import Sidebar from "@/components/sidebar";
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

    // Role-Based Access Control
    // Role-Based Access Control - Removed to allow partial access (Calendar & My Eval)
    // if (session.user?.role === "EMPLOYEE") {
    //     redirect("/unauthorized");
    // }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar user={session?.user as any} />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header for mobile or breadcrumbs could go here */}
                    {children}
                </div>
            </main>
        </div>
    );
}
