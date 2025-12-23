import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface ScheduledContent {
  id: string;
  title: string;
  description: string;
  type: "slideshow" | "promotion" | "announcement" | "event";
  status: "draft" | "scheduled" | "active" | "paused" | "completed";
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
}

interface ContentCalendarProps {
  businessId: string;
}

export default function ContentCalendar({ businessId }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<ScheduledContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setScheduledContent([]);
      setLoading(false);
    };
    fetchContent();
  }, [businessId]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-10 h-10 border-2 border-black/5 border-t-black rounded-full animate-spin"></div>
        <p className="mt-6 text-sm font-medium text-black/40">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-black">Content Calendar</h1>
          <p className="text-sm text-black/40 mt-1">Schedule and manage your TV content</p>
        </div>
        <button className="bg-black text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-black/10 flex items-center gap-2">
          <Plus className="w-5 h-5" /> New Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3">
          <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-8 bg-gray-50/50 border-b border-black/5">
              <div className="flex items-center gap-6">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-2 hover:bg-black hover:text-white rounded-lg transition-all border border-black/5"><ChevronLeft className="w-5 h-5" /></button>
                <h2 className="text-xl font-bold text-black min-w-[200px] text-center">{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-2 hover:bg-black hover:text-white rounded-lg transition-all border border-black/5"><ChevronRight className="w-5 h-5" /></button>
              </div>
              <button onClick={() => setCurrentDate(new Date())} className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-black/5 rounded-lg hover:bg-black hover:text-white transition-all">Today</button>
            </div>
            <div className="grid grid-cols-7 border-b border-black/5">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-black/20 py-4 tracking-widest">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 bg-black/5 gap-px">
              {getDaysInMonth(currentDate).map((date, i) => (
                <div key={i} onClick={() => date && setSelectedDate(date)} className={`h-32 p-4 transition-all cursor-pointer ${date ? (date.toDateString() === selectedDate.toDateString() ? "bg-black text-white" : "bg-white hover:bg-gray-50") : "bg-gray-50/50"}`}>
                  {date && <span className={`text-xs font-bold ${date.toDateString() === selectedDate.toDateString() ? "text-white" : "text-black/20"}`}>{date.getDate()}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-black/5 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xs font-bold text-black/30 uppercase tracking-widest mb-6">Selected Date</h3>
            <p className="text-xl font-bold mb-8">{selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
            <div className="text-center py-12 border-2 border-dashed border-black/5 rounded-xl">
              <CalendarIcon className="w-8 h-8 mx-auto mb-4 text-black/10" />
              <p className="text-xs font-bold text-black/20 uppercase tracking-widest">No entries found</p>
            </div>
          </div>
          <div className="bg-white border border-black/5 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xs font-bold text-black/30 uppercase tracking-widest mb-6">Content Types</h3>
            <div className="space-y-4">
              {[
                { label: "Slideshow", color: "bg-black" },
                { label: "Promotion", color: "bg-black/40" },
                { label: "Event", color: "bg-black/20" },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${t.color}`}></div>
                    <span className="text-xs font-bold text-black/60 uppercase">{t.label}</span>
                  </div>
                  <span className="text-[10px] text-black/10 font-bold">ACTIVE</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedContent && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50" onClick={() => setSelectedContent(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-bold">{selectedContent.title}</h3>
                <button onClick={() => setSelectedContent(null)} className="p-2 bg-gray-50 rounded-lg"><X className="w-6 h-6" /></button>
              </div>
              <p className="text-sm text-black/40 mb-10">{selectedContent.description}</p>
              <div className="flex gap-4">
                <button className="flex-1 bg-black text-white py-4 rounded-xl font-bold">Activate</button>
                <button className="flex-1 bg-gray-50 text-black py-4 rounded-xl font-bold border border-black/5">Edit</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
