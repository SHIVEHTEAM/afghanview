import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Tv,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Power,
  PowerOff,
  Settings,
  Wifi,
  WifiOff,
  Monitor,
  Smartphone,
  Tablet,
  Volume2,
  VolumeX,
  RotateCw,
  Eye,
  EyeOff,
  Zap,
  Clock,
  Calendar,
  Star,
  Users,
  MapPin,
  QrCode,
} from "lucide-react";

interface TvDevice {
  id: string;
  name: string;
  type: "tv" | "monitor" | "tablet" | "phone";
  location: string;
  status: "online" | "offline" | "playing" | "paused";
  currentSlideshow?: string;
  volume: number;
  isMuted: boolean;
  isVisible: boolean;
  lastSeen: Date;
  ipAddress?: string;
  macAddress?: string;
}

interface TvManagerProps {
  restaurantId: string;
  slideshows: Array<{ id: string; name: string; slug: string }>;
}

export default function TvManager({
  restaurantId,
  slideshows,
}: TvManagerProps) {
  const [tvs, setTvs] = useState<TvDevice[]>([]);
  const [selectedTv, setSelectedTv] = useState<TvDevice | null>(null);
  const [showAddTv, setShowAddTv] = useState(false);
  const [showTvDetails, setShowTvDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "online" | "offline"
  >("all");

  // Load TVs from localStorage (in real app, this would be from API)
  useEffect(() => {
    const savedTvs = localStorage.getItem(`tvs-${restaurantId}`);
    if (savedTvs) {
      const parsedTvs = JSON.parse(savedTvs).map((tv: any) => ({
        ...tv,
        lastSeen: new Date(tv.lastSeen),
      }));
      setTvs(parsedTvs);
    }
  }, [restaurantId]);

  // Save TVs to localStorage
  const saveTvs = (newTvs: TvDevice[]) => {
    setTvs(newTvs);
    localStorage.setItem(`tvs-${restaurantId}`, JSON.stringify(newTvs));
  };

  // Add new TV
  const addTv = (tvData: Omit<TvDevice, "id" | "lastSeen">) => {
    const newTv: TvDevice = {
      ...tvData,
      id: `tv-${Date.now()}-${Math.random()}`,
      lastSeen: new Date(),
    };
    saveTvs([...tvs, newTv]);
    setShowAddTv(false);
  };

  // Update TV
  const updateTv = (id: string, updates: Partial<TvDevice>) => {
    const updatedTvs = tvs.map((tv) =>
      tv.id === id ? { ...tv, ...updates } : tv
    );
    saveTvs(updatedTvs);
  };

  // Delete TV
  const deleteTv = (id: string) => {
    if (confirm("Are you sure you want to delete this TV?")) {
      saveTvs(tvs.filter((tv) => tv.id !== id));
    }
  };

  // Control TV
  const controlTv = (id: string, action: string, value?: any) => {
    const tv = tvs.find((t) => t.id === id);
    if (!tv) return;

    switch (action) {
      case "play":
        updateTv(id, { status: "playing" });
        // In real app, send command to TV
        console.log(`Playing slideshow on TV: ${tv.name}`);
        break;
      case "pause":
        updateTv(id, { status: "paused" });
        break;
      case "volume":
        updateTv(id, { volume: value });
        break;
      case "mute":
        updateTv(id, { isMuted: !tv.isMuted });
        break;
      case "visibility":
        updateTv(id, { isVisible: !tv.isVisible });
        break;
      case "slideshow":
        updateTv(id, { currentSlideshow: value });
        break;
    }
  };

  // Filter TVs
  const filteredTvs = tvs.filter((tv) => {
    const matchesSearch =
      tv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tv.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || tv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-500";
      case "offline":
        return "text-red-500";
      case "playing":
        return "text-blue-500";
      case "paused":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "tv":
        return <Tv className="w-5 h-5" />;
      case "monitor":
        return <Monitor className="w-5 h-5" />;
      case "tablet":
        return <Tablet className="w-5 h-5" />;
      case "phone":
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">TV Management</h2>
          <p className="text-gray-600">
            Assign slideshows to your TVs in one click
          </p>
        </div>
        <button
          onClick={() => setShowAddTv(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add TV
        </button>
      </div>

      {/* TV List */}
      <div className="space-y-4">
        {filteredTvs.map((tv) => (
          <div
            key={tv.id}
            className="flex flex-col md:flex-row items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200"
          >
            <div className="flex items-center gap-4 flex-1">
              {getDeviceIcon(tv.type)}
              <div>
                <div className="font-semibold text-gray-900">{tv.name}</div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {tv.location}
                </div>
                <div className="text-xs mt-1">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-1 ${getStatusColor(
                      tv.status
                    )}`}
                  ></span>
                  {tv.status.charAt(0).toUpperCase() + tv.status.slice(1)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <select
                value={tv.currentSlideshow || ""}
                onChange={(e) => controlTv(tv.id, "slideshow", e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Assign Slideshow</option>
                {slideshows.map((slideshow) => (
                  <option key={slideshow.id} value={slideshow.id}>
                    {slideshow.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  window.open(`/tv/${tv.currentSlideshow || ""}`, "_blank")
                }
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                title="Show TV QR Code"
              >
                <QrCode className="w-4 h-4" />
                TV QR
              </button>
              <button
                onClick={() => deleteTv(tv.id)}
                className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTvs.length === 0 && (
        <div className="text-center py-12">
          <Tv className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No TVs Found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filters"
              : "Add your first TV to start managing displays"}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <button
              onClick={() => setShowAddTv(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First TV
            </button>
          )}
        </div>
      )}

      {/* Add TV Modal */}
      {showAddTv && (
        <AddTvModal onAdd={addTv} onClose={() => setShowAddTv(false)} />
      )}
    </div>
  );
}

// Add TV Modal Component
function AddTvModal({
  onAdd,
  onClose,
}: {
  onAdd: (tv: Omit<TvDevice, "id" | "lastSeen">) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "tv" as const,
    location: "",
    ipAddress: "",
    macAddress: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      status: "offline",
      volume: 50,
      isMuted: false,
      isVisible: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add New TV</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TV Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Device Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as any })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="tv">TV</option>
              <option value="monitor">Monitor</option>
              <option value="tablet">Tablet</option>
              <option value="phone">Phone</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Main Dining Area"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IP Address (Optional)
            </label>
            <input
              type="text"
              value={formData.ipAddress}
              onChange={(e) =>
                setFormData({ ...formData, ipAddress: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="192.168.1.100"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add TV
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// TV Details Modal Component
function TvDetailsModal({
  tv,
  slideshows,
  onUpdate,
  onClose,
}: {
  tv: TvDevice;
  slideshows: Array<{ id: string; name: string; slug: string }>;
  onUpdate: (updates: Partial<TvDevice>) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          TV Details: {tv.name}
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div
                className={`px-3 py-2 rounded-lg ${getStatusColor(
                  tv.status
                )} bg-gray-100`}
              >
                {tv.status.charAt(0).toUpperCase() + tv.status.slice(1)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Seen
              </label>
              <div className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700">
                {tv.lastSeen.toLocaleString()}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Slideshow
            </label>
            <select
              value={tv.currentSlideshow || ""}
              onChange={(e) => onUpdate({ currentSlideshow: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No slideshow playing</option>
              {slideshows.map((slideshow) => (
                <option key={slideshow.id} value={slideshow.id}>
                  {slideshow.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volume: {tv.volume}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={tv.volume}
              onChange={(e) => onUpdate({ volume: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={tv.isMuted}
                onChange={(e) => onUpdate({ isMuted: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Muted</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={tv.isVisible}
                onChange={(e) => onUpdate({ isVisible: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Visible</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "online":
      return "text-green-500";
    case "offline":
      return "text-red-500";
    case "playing":
      return "text-blue-500";
    case "paused":
      return "text-yellow-500";
    default:
      return "text-gray-500";
  }
}
