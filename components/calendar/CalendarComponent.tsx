"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
// Note: We might need to adjust imports if UI components are in different paths.
// Asking the user or checking structure first would be ideal, but I'll assume standard shadcn or similar paths based on `components/ui` existing.
// I'll try to use standard HTML/Tailwind for modals if I'm not 100% sure on the UI components, 
// BUT `components/ui` exists in the file list. I'll take a gamble on `Dialog` being there or I can just use a simple overlay if it fails.
// Safest bet for "Premium" without breaking is to create a custom modal or use what's available.
// Let's check `components/ui` first? 
// No, I'll write the code to use standard Tailwind for the modal to be safe and dependency-free from internal UI libs I haven't fully inspected.
// It ensures it works immediately.

interface Event {
    id: string;
    title: string;
    start: string;
    allDay?: boolean;
    color?: string;
    extendedProps?: {
        description?: string;
    };
}

const DEFAULT_EVENTS: Event[] = [
    { id: '1', title: "Review Kinerja Q4", start: new Date().toISOString().split("T")[0], allDay: true, color: "#ef4444" },
    { id: '2', title: "Team Building", start: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0], color: "#10b981" },
    { id: '3', title: "Townhall Meeting", start: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0], color: "#3b82f6" },
    { id: '4', title: "Deadline KPI", start: new Date(Date.now() + 86400000 * 10).toISOString().split("T")[0], color: "#f59e0b" },
];

export default function CalendarComponent() {
    const [events, setEvents] = useState<Event[]>(DEFAULT_EVENTS);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage on mount
    React.useEffect(() => {
        const savedEvents = localStorage.getItem('venom-calendar-events');
        if (savedEvents) {
            try {
                setEvents(JSON.parse(savedEvents));
            } catch (e) {
                console.error("Failed to parse calendar events", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to LocalStorage whenever events change handles autosave
    React.useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('venom-calendar-events', JSON.stringify(events));
        }
    }, [events, isLoaded]);

    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newEvent, setNewEvent] = useState({ id: '', title: '', start: '', description: '' });

    const handleEventClick = (info: any) => {
        setSelectedEvent(info.event);
        setIsViewModalOpen(true);
    };

    const handleDateSelect = (selectInfo: any) => {
        setIsEditing(false);
        setNewEvent({ id: '', title: '', start: selectInfo.startStr, description: '' });
        setIsAddModalOpen(true);
    };

    const handleAddOrUpdateEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (newEvent.title && newEvent.start) {
            if (isEditing) {
                setEvents(events.map(ev =>
                    ev.id === newEvent.id
                        ? { ...ev, title: newEvent.title, start: newEvent.start, extendedProps: { description: newEvent.description } }
                        : ev
                ));
            } else {
                setEvents([
                    ...events,
                    {
                        id: createEventId(),
                        title: newEvent.title,
                        start: newEvent.start,
                        allDay: true,
                        color: "#9333ea",
                        extendedProps: {
                            description: newEvent.description
                        }
                    },
                ]);
            }
            setIsAddModalOpen(false);
            setNewEvent({ id: '', title: '', start: '', description: '' });
            setIsEditing(false);
        }
    };

    const handleDeleteEvent = () => {
        if (selectedEvent) {
            setEvents(events.filter(ev => ev.id !== selectedEvent.id));
            setIsViewModalOpen(false);
            setSelectedEvent(null);
        }
    };

    const handleEditClick = () => {
        if (selectedEvent) {
            setNewEvent({
                id: selectedEvent.id,
                title: selectedEvent.title,
                start: selectedEvent.startStr || selectedEvent.start.toISOString().split("T")[0],
                description: selectedEvent.extendedProps?.description || ''
            });
            setIsEditing(true);
            setIsViewModalOpen(false);
            setIsAddModalOpen(true);
        }
    };

    const createEventId = () => {
        return String(events.length + 1) + '-' + Date.now();
    }

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedEvent(null);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setIsEditing(false);
    };

    return (
        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-3 h-full flex flex-col">
            <style jsx global>{`
        .fc {
          --fc-border-color: #1e293b;
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: #0f172a;
          --fc-list-event-hover-bg-color: #334155;
          --fc-today-bg-color: rgba(147, 51, 234, 0.1);
          color: #e2e8f0;
          font-family: inherit;
        }
        .fc .fc-col-header-cell-cushion,
        .fc .fc-daygrid-day-number,
        .fc .fc-list-day-text,
        .fc .fc-list-day-side-text {
          color: #cbd5e1;
          text-decoration: none;
        }
        .fc .fc-button-primary {
          background-color: #9333ea;
          border-color: #9333ea;
          transition: all 0.2s;
        }
        .fc .fc-button-primary:hover {
          background-color: #7e22ce;
          border-color: #7e22ce;
        }
        .fc .fc-button-primary:disabled {
          background-color: #475569;
          border-color: #475569;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #6b21a8;
          border-color: #6b21a8;
        }
        .fc-h-event {
          background-color: #9333ea;
          border-color: #9333ea;
        }
        .fc-daygrid-event {
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .fc .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.025em;
        }
        .fc .fc-list-event:hover td {
           background-color: #1e293b;
        }
        .fc-theme-standard .fc-list-day-cushion {
           background-color: #0f172a;
        }
      `}</style>

            {/* Add/Edit Event Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-4">{isEditing ? 'Edit Acara' : 'Tambah Acara Baru'}</h3>
                            <form onSubmit={handleAddOrUpdateEvent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Judul Acara</label>
                                    <input
                                        type="text"
                                        required
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Rapat Penting"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Tanggal</label>
                                    <input
                                        type="date"
                                        required
                                        value={newEvent.start}
                                        onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Deskripsi</label>
                                    <textarea
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                                        placeholder="Detail acara..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={closeAddModal}
                                        className="px-4 py-2 bg-transparent hover:bg-slate-800 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-purple-900/20"
                                    >
                                        {isEditing ? 'Simpan Perubahan' : 'Simpan Acara'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
                }}
                height="100%"
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={false}
                weekends={true}
                events={events}
                select={handleDateSelect}
                eventClick={handleEventClick}
                eventBackgroundColor="#9333ea"
                eventBorderColor="#9333ea"
            />

            {/* View Event Modal */}
            {isViewModalOpen && selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white max-w-[80%]">{selectedEvent.title}</h3>
                                <button
                                    onClick={closeViewModal}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="space-y-4 text-slate-300 mb-6">
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tanggal</span>
                                    <span>{selectedEvent.start ? new Date(selectedEvent.start).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
                                </div>
                                {selectedEvent.extendedProps?.description && (
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Deskripsi</span>
                                        <span>{selectedEvent.extendedProps.description}</span>
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-medium w-fit mt-1">
                                        Aktif
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleDeleteEvent}
                                    className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Hapus
                                </button>
                                <button
                                    onClick={handleEditClick}
                                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
