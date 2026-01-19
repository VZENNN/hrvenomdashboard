import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

export default async function ApplicantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col">
            <header className="h-16 border-b bg-white dark:bg-slate-950 flex items-center justify-between px-6 shadow-sm">
                <h1 className="text-xl font-bold tracking-tight">
                    Psychotest <span className="text-purple-600">Portal</span>
                </h1>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium">
                        {session.user?.name}
                    </div>
                    <form action={async () => {
                        "use server"
                        await signOut({ redirectTo: "/login" });
                    }}>
                        <button type="submit" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors">
                            <LogOut size={16} /> Logout
                        </button>
                    </form>
                </div>
            </header>
            <main className="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
