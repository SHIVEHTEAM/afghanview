import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Music,
  Play,
  Pause,
  Search,
  Filter,
  Download,
  Heart,
  Loader2,
} from "lucide-react";
import { MusicAPIService, MusicTrack } from "../../../lib/music-api";

interface MusicLibraryProps {
  onSelectTrack: (track: MusicTrack) => void;
  selectedTrackId?: string;
  showFavorites?: boolean;
}

const CATEGORIES = [
  "All",
  "Afghan Traditional",
  "Afghan Modern",
  "Persian Traditional",
  "Pashto Traditional",
  "Pashto Modern",
  "Ambient",
  "Upbeat",
  "Instrumental",
];

export default function MusicLibrary({
  onSelectTrack,
  selectedTrackId,
  showFavorites = false,
}: MusicLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  // Fetch tracks from API
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/music");
        const data = await response.json();

        if (data.success) {
          setTracks(data.tracks);
        } else {
          // Fallback to local tracks if API fails
          setTracks(MusicAPIService.getFallbackTracks());
        }
      } catch (err) {
        console.error("Error fetching tracks:", err);
        setError("Failed to load music library");
        // Fallback to local tracks
        setTracks(MusicAPIService.getFallbackTracks());
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "All" || track.category === selectedCategory;

    const matchesFavorites = !showFavorites || favorites.has(track.id);

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const handlePlayPreview = (trackId: string) => {
    // Stop current audio
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    if (playingTrack === trackId) {
      setPlayingTrack(null);
      setAudioElement(null);
    } else {
      const track = tracks.find((t) => t.id === trackId);
      if (track) {
        const audio = new Audio(track.url);
        audio.volume = 0.3; // Lower volume for preview

        audio.onended = () => {
          setPlayingTrack(null);
          setAudioElement(null);
        };

        audio.onerror = () => {
          console.error("Failed to play audio preview");
          setPlayingTrack(null);
          setAudioElement(null);
        };

        audio
          .play()
          .then(() => {
            setPlayingTrack(trackId);
            setAudioElement(audio);
          })
          .catch((err) => {
            console.error("Error playing preview:", err);
            setPlayingTrack(null);
            setAudioElement(null);
          });
      }
    }
  };

  const toggleFavorite = (trackId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(trackId)) {
      newFavorites.delete(trackId);
    } else {
      newFavorites.add(trackId);
    }
    setFavorites(newFavorites);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, [audioElement]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading music library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Music className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error Loading Music
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search music by name, artist, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredTracks.length} track{filteredTracks.length !== 1 ? "s" : ""}{" "}
          found
        </p>
        {showFavorites && (
          <button
            onClick={() => setFavorites(new Set())}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear Favorites
          </button>
        )}
      </div>

      {/* Music Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTracks.map((track) => (
          <motion.div
            key={track.id}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer bg-white shadow-sm hover:shadow-md ${
              selectedTrackId === track.id
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => onSelectTrack(track)}
          >
            {/* Track Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate text-sm">
                  {track.name}
                </h3>
                <p className="text-xs text-gray-600 truncate">{track.artist}</p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track.id);
                  }}
                  className={`p-1.5 rounded-full transition-colors ${
                    favorites.has(track.id)
                      ? "text-red-500 hover:text-red-600 bg-red-50"
                      : "text-gray-400 hover:text-red-500 hover:bg-gray-50"
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      favorites.has(track.id) ? "fill-current" : ""
                    }`}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPreview(track.id);
                  }}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {playingTrack === track.id ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Track Info */}
            <div className="space-y-2">
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {track.description}
              </p>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">
                  {track.duration}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {track.category}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {track.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {track.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    +{track.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Source Info */}
              {track.source && (
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <span>Source:</span>
                  <span className="font-medium">{track.source}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTracks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No music found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
