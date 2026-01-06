import CalendarComponent from "@/components/calendar/CalendarComponent";
import { auth } from "@/auth";

export default async function CalendarPage() {
    const session = await auth();
    const userRole = session?.user?.role;

    return (
        <div className="h-[88vh] flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Kalender Acara</h1>
                    <p className="text-slate-500">Jadwal kegiatan dan acara penting perusahaan.</p>
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-slate-950 rounded-xl overflow-hidden shadow-sm border border-slate-800">
                <CalendarComponent role={userRole} />
            </div>
        </div>
    );
}
