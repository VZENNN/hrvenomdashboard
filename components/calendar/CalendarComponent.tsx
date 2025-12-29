"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { getVenomEvents, upsertVenomEvent, deleteVenomEvent } from "@/app/actions/calendar";
import { v4 as uuidv4 } from "uuid";

interface Event {
    id: string;
    title: string;
    start: string | Date;
    end?: string | Date; // Remove null
    allDay?: boolean;
    color?: string; // Remove null
    extendedProps?: {
        description?: string; // Remove null
    };
}

const DEFAULT_EVENTS: Event[] = [];

export default function CalendarComponent() {
    const [events, setEvents] = useState<Event[]>(DEFAULT_EVENTS);
    const [isLoaded, setIsLoaded] = useState(false);

    const handleDatesSet = (dateInfo: any) => {
        const fetchEvents = async () => {
            const events = await getVenomEvents(dateInfo.start, dateInfo.end);
            if (events) {
                const mapped = events.map((e: any) => ({
                    id: e.id,
                    title: e.title,
                    start: e.start,
                    end: e.end,
                    allDay: e.allDay,
                    color: e.color ?? undefined,
                    extendedProps: {
                        description: e.description
                    }
                }));
                // @ts-ignore
                setEvents(mapped);
            }
            setIsLoaded(true);
        };
        fetchEvents();
    };

    // Initial load is now handled by datesSet which fires on mount automatically by FullCalendar


    // Save to LocalStorage removed. Using Server Actions directly.

    // Category Colors Configuration
    const CATEGORY_COLORS: Record<string, string> = {
        meeting: "#9333ea", // Purple
        holiday: "#ef4444", // Red
        training: "#3b82f6", // Blue
        project: "#10b981", // Emerald
        other: "#64748b"    // Slate
    };

    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newEvent, setNewEvent] = useState({
        id: '',
        title: '',
        start: '',
        end: '',
        description: '',
        category: 'meeting'
    });

    const handleEventClick = (info: any) => {
        setSelectedEvent(info.event);
        setIsViewModalOpen(true);
    };

    const handleDateSelect = (selectInfo: any) => {
        setIsEditing(false);

        let uiEnd = '';
        if (selectInfo.endStr) {
            const endDate = new Date(selectInfo.endStr);
            endDate.setDate(endDate.getDate() - 1);
            uiEnd = endDate.toISOString().split("T")[0];
        }

        setNewEvent({
            id: '',
            title: '',
            start: selectInfo.startStr,
            end: uiEnd !== selectInfo.startStr ? uiEnd : '',
            description: '',
            category: 'meeting'
        });
        setIsAddModalOpen(true);
    };

    const handleAddOrUpdateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newEvent.title && newEvent.start) {

            // Prepare Final DB Payload
            let dbEnd = null;
            if (newEvent.end) {
                const d = new Date(newEvent.end);
                d.setDate(d.getDate() + 1); // Convert back to exclusive for FC/DB
                dbEnd = d.toISOString().split("T")[0];
            }

            const color = CATEGORY_COLORS[newEvent.category] || CATEGORY_COLORS['other'];

            let eventData: Event;

            if (isEditing) {
                eventData = {
                    id: newEvent.id,
                    title: newEvent.title,
                    start: newEvent.start,
                    end: dbEnd || undefined,
                    color: color,
                    extendedProps: { description: newEvent.description }
                };

                // Optimistic Update
                setEvents(events.map(ev => ev.id === newEvent.id ? { ...ev, ...eventData } : ev));
            } else {
                const newId = createEventId();
                eventData = {
                    id: newId,
                    title: newEvent.title,
                    start: newEvent.start,
                    end: dbEnd || undefined,
                    allDay: true,
                    color: color,
                    extendedProps: { description: newEvent.description }
                };

                // Optimistic Update
                setEvents([...events, eventData]);
            }

            // Save to DB
            await upsertVenomEvent({
                id: eventData.id,
                title: eventData.title,
                start: eventData.start as string,
                end: eventData.end as string | undefined, // Ensure undefined if null
                allDay: eventData.allDay,
                description: eventData.extendedProps?.description,
                color: eventData.color
            });

            setIsAddModalOpen(false);
            setNewEvent({ id: '', title: '', start: '', end: '', description: '', category: 'meeting' });
            setIsEditing(false);
        }
    };

    const handleDeleteEvent = async () => {
        if (selectedEvent) {
            const id = selectedEvent.id;
            setEvents(events.filter(ev => ev.id !== id));
            setIsViewModalOpen(false);
            setSelectedEvent(null);

            await deleteVenomEvent(id);
        }
    };

    const handleEditClick = () => {
        if (selectedEvent) {
            // Restore Category
            const currentColor = selectedEvent.backgroundColor;
            const foundCategory = Object.keys(CATEGORY_COLORS).find(key => CATEGORY_COLORS[key] === currentColor) || 'other';

            // Restore End Date (Exclusive -> Inclusive)
            let uiEnd = '';
            if (selectedEvent.end) {
                const d = new Date(selectedEvent.end);
                d.setDate(d.getDate() - 1);
                uiEnd = d.toISOString().split("T")[0];
            }

            setNewEvent({
                id: selectedEvent.id,
                title: selectedEvent.title,
                start: selectedEvent.startStr || new Date(selectedEvent.start).toISOString().split("T")[0],
                end: uiEnd,
                description: selectedEvent.extendedProps?.description || '',
                category: foundCategory
            });
            setIsEditing(true);
            setIsViewModalOpen(false);
            setIsAddModalOpen(true);
        }
    };

    const createEventId = () => {
        return uuidv4();
    }

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedEvent(null);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setIsEditing(false);
    };

    const handleEventDrop = async (info: any) => {
        const { event } = info;
        // Optimistic update
        setEvents(prevEvents => prevEvents.map(ev => {
            if (ev.id === event.id) {
                return {
                    ...ev,
                    start: event.start,
                    end: event.end,
                    allDay: event.allDay
                };
            }
            return ev;
        }));

        await upsertVenomEvent({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            allDay: event.allDay,
            description: event.extendedProps?.description,
            color: event.backgroundColor
        });
    };

    const handleEventResize = async (info: any) => {
        const { event } = info;
        setEvents(prevEvents => prevEvents.map(ev => {
            if (ev.id === event.id) {
                return {
                    ...ev,
                    start: event.start,
                    end: event.end
                };
            }
            return ev;
        }));

        await upsertVenomEvent({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            allDay: event.allDay, // Resize usually implies timeGrid, so maybe not allDay? FullCalendar handles property consistency.
            description: event.extendedProps?.description,
            color: event.backgroundColor
        });
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Kategori</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setNewEvent({ ...newEvent, category: cat })}
                                                    className={`h-8 rounded-md border transition-all ${newEvent.category === cat ? 'border-white ring-2 ring-white/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                                    style={{ backgroundColor: color }}
                                                    title={cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                />
                                            ))}
                                        </div>
                                        <div className="mt-1 text-xs text-slate-500 text-right capitalize">
                                            {newEvent.category}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Mulai</label>
                                        <input
                                            type="date"
                                            required
                                            value={newEvent.start}
                                            onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Selesai (Sampai)</label>
                                        <input
                                            type="date"
                                            value={newEvent.end}
                                            onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            min={newEvent.start}
                                        />
                                    </div>
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
                buttonText={{
                    today: 'Today',
                    month: 'Month',
                    week: 'Week',
                    day: 'Day',
                    list: 'List',
                    prev: '<',
                    next: '>'
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
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                datesSet={handleDatesSet}
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
