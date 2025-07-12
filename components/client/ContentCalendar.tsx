import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Clock,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Tag,
  Users,
  AlertCircle,
  CheckCircle,
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
  priority: "low" | "medium" | "high";
  targetAudience: string[];
  tags: string[];
  businessId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const CONTENT_TYPES = [
  { id: "slideshow", label: "Slideshow", color: "bg-blue-500" },
  { id: "promotion", label: "Promotion", color: "bg-green-500" },
  { id: "announcement", label: "Announcement", color: "bg-purple-500" },
  { id: "event", label: "Event", color: "bg-orange-500" },
];

const PRIORITY_LEVELS = [
  { id: "low", label: "Low", color: "bg-gray-500" },
  { id: "medium", label: "Medium", color: "bg-yellow-500" },
  { id: "high", label: "High", color: "bg-red-500" },
];

interface ContentCalendarProps {
  businessId: string;
}

export default function ContentCalendar({ businessId }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>(
    []
  );
  const [selectedContent, setSelectedContent] =
    useState<ScheduledContent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    priority: "all",
  });

  useEffect(() => {
    fetchScheduledContent();
  }, [businessId]);

  const fetchScheduledContent = async () => {
    try {
      setLoading(true);

      // For now, return empty array since we don't have a content calendar table yet
      // In a real implementation, this would fetch from a content_calendar table
      setScheduledContent([]);
    } catch (error) {
      console.error("Error fetching scheduled content:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getContentForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split("T")[0];

    return scheduledContent.filter((content) => {
      const isInDateRange =
        dateString >= content.startDate && dateString <= content.endDate;
      const isOnDayOfWeek = content.daysOfWeek.includes(dayOfWeek);
      const matchesFilter =
        filters.type === "all" || content.type === filters.type;
      const matchesStatus =
        filters.status === "all" || content.status === filters.status;
      const matchesPriority =
        filters.priority === "all" || content.priority === filters.priority;

      return (
        isInDateRange &&
        isOnDayOfWeek &&
        matchesFilter &&
        matchesStatus &&
        matchesPriority
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "scheduled":
        return "bg-blue-500";
      case "paused":
        return "bg-yellow-500";
      case "completed":
        return "bg-gray-500";
      case "draft":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeColor = (type: string) => {
    const typeConfig = CONTENT_TYPES.find((t) => t.id === type);
    return typeConfig?.color || "bg-gray-500";
  };

  const getPriorityColor = (priority: string) => {
    const priorityConfig = PRIORITY_LEVELS.find((p) => p.id === priority);
    return priorityConfig?.color || "bg-gray-500";
  };

  const CalendarDay = ({
    date,
    isCurrentMonth,
  }: {
    date: Date | null;
    isCurrentMonth: boolean;
  }) => {
    if (!date) {
      return <div className="h-32 bg-gray-50 border border-gray-200" />;
    }

    const contentForDay = getContentForDate(date);
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = date.toDateString() === selectedDate.toDateString();

    return (
      <div
        className={`h-32 border border-gray-200 p-2 cursor-pointer transition-all ${
          isCurrentMonth ? "bg-white" : "bg-gray-50"
        } ${isToday ? "ring-2 ring-blue-500" : ""} ${
          isSelected ? "bg-blue-50" : ""
        }`}
        onClick={() => setSelectedDate(date)}
      >
        <div className="flex items-center justify-between mb-1">
          <span
            className={`text-sm font-medium ${
              isCurrentMonth ? "text-gray-900" : "text-gray-400"
            } ${isToday ? "text-blue-600" : ""}`}
          >
            {date.getDate()}
          </span>
          {contentForDay.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded-full">
              {contentForDay.length}
            </span>
          )}
        </div>

        <div className="space-y-1">
          {contentForDay.slice(0, 2).map((content) => (
            <div
              key={content.id}
              className={`text-xs p-1 rounded truncate cursor-pointer ${getTypeColor(
                content.type
              )} text-white`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedContent(content);
              }}
            >
              {content.title}
            </div>
          ))}
          {contentForDay.length > 2 && (
            <div className="text-xs text-gray-500 text-center">
              +{contentForDay.length - 2} more
            </div>
          )}
        </div>
      </div>
    );
  };

  const ContentDetails = ({ content }: { content: ScheduledContent }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {content.title}
          </h3>
          <p className="text-gray-600 mt-1">{content.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedContent(null)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600">Type</p>
          <div className="flex items-center space-x-2 mt-1">
            <div
              className={`w-3 h-3 rounded-full ${getTypeColor(content.type)}`}
            ></div>
            <span className="text-sm text-gray-900 capitalize">
              {content.type}
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Status</p>
          <div className="flex items-center space-x-2 mt-1">
            <div
              className={`w-3 h-3 rounded-full ${getStatusColor(
                content.status
              )}`}
            ></div>
            <span className="text-sm text-gray-900 capitalize">
              {content.status}
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Priority</p>
          <div className="flex items-center space-x-2 mt-1">
            <div
              className={`w-3 h-3 rounded-full ${getPriorityColor(
                content.priority
              )}`}
            ></div>
            <span className="text-sm text-gray-900 capitalize">
              {content.priority}
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Schedule</p>
          <p className="text-sm text-gray-900 mt-1">
            {content.startDate} - {content.endDate}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
          <Play className="w-4 h-4 inline mr-2" />
          Activate
        </button>
        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
          <Pause className="w-4 h-4 inline mr-2" />
          Pause
        </button>
        <button className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium">
          <Trash2 className="w-4 h-4 inline mr-2" />
          Delete
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-gray-600 mt-2">
            Schedule and manage your content across different time periods
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Content</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {CONTENT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              {PRIORITY_LEVELS.map((priority) => (
                <option key={priority.id} value={priority.id}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() =>
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() - 1
                      )
                    )
                  }
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <button
                  onClick={() =>
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() + 1
                      )
                    )
                  }
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
              >
                Today
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-gray-600 py-2"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentDate).map((date, index) => (
                  <CalendarDay
                    key={index}
                    date={date}
                    isCurrentMonth={
                      date ? date.getMonth() === currentDate.getMonth() : false
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Content */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>

            {getContentForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No content scheduled</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  Schedule Content
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {getContentForDate(selectedDate).map((content) => (
                  <div
                    key={content.id}
                    className={`p-3 rounded-lg cursor-pointer ${getTypeColor(
                      content.type
                    )} text-white`}
                    onClick={() => setSelectedContent(content)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{content.title}</h4>
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(
                          content.status
                        )}`}
                      ></div>
                    </div>
                    <p className="text-sm opacity-90 mt-1">
                      {content.startTime} - {content.endTime}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content Types Legend */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Content Types
            </h3>
            <div className="space-y-3">
              {CONTENT_TYPES.map((type) => (
                <div key={type.id} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${type.color}`}></div>
                  <span className="text-sm text-gray-700">{type.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Content Details Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full"
          >
            <ContentDetails content={selectedContent} />
          </motion.div>
        </div>
      )}
    </div>
  );
}
