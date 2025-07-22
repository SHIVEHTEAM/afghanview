import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  Share2,
  Maximize,
  Minimize,
  RotateCcw,
  Music,
  Shuffle,
  Repeat,
  List,
} from "lucide-react";
import { MusicService } from "../../lib/music-service";
import {
  MusicTrack,
  MusicPlaylist,
  SlideshowMusicSettings,
} from "../../types/music";

interface Slide {
  id: string;
  name: string;
  type: string;
  title: string;
  subtitle?: string;
  content: any;
  styling: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    animation: string;
  };
  duration: number;
  order_index: number;
}

interface EnhancedSlideshowPlayerProps {
  slideshow: {
    id: string;
    name: string;
    images: Slide[];
    settings?: SlideshowMusicSettings;
    title?: string;
    description?: string;
  };
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
  autoPlay?: boolean;
  showControls?: boolean;
}

export default function EnhancedSlideshowPlayer({
  slideshow,
  isFullscreen = false,
  onFullscreenToggle,
  autoPlay = true,
  showControls = true,
}: EnhancedSlideshowPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [transitionDuration, setTransitionDuration] = useState(1000);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  // Enhanced music state
  const [currentMusicTrack, setCurrentMusicTrack] = useState<MusicTrack | null>(
    null
  );
  const [currentPlaylist, setCurrentPlaylist] = useState<MusicPlaylist | null>(
    null
  );
  const [playlistTracks, setPlaylistTracks] = useState<MusicTrack[]>([]);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(
    slideshow.settings?.music_volume || 50
  );
  const [musicLoop, setMusicLoop] = useState(
    slideshow.settings?.music_loop ?? true
  );
  const [playMode, setPlayMode] = useState<"sequential" | "shuffle" | "random">(
    slideshow.settings?.music_play_mode || "sequential"
  );
  const [shuffledPlaylist, setShuffledPlaylist] = useState<number[]>([]);
  const [totalMusicDuration, setTotalMusicDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Generate share URL
    const url = `${window.location.origin}/slideshow/${slideshow.id}`;
    setShareUrl(url);
  }, [slideshow.id]);

  // Load music data
  useEffect(() => {
    loadMusicData();
  }, [slideshow.settings]);

  const loadMusicData = async () => {
    try {
      if (slideshow.settings?.music_playlist_id) {
        // Load playlist
        const playlist = await MusicService.getPlaylist(
          slideshow.settings.music_playlist_id
        );
        if (playlist) {
          setCurrentPlaylist(playlist);
          setPlaylistTracks(playlist.tracks || []);
          setPlayMode(playlist.play_mode);

          // Initialize shuffled playlist if needed
          if (playlist.play_mode === "shuffle") {
            const shuffled = Array.from(
              { length: playlist.tracks?.length || 0 },
              (_, i) => i
            );
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setShuffledPlaylist(shuffled);
          }
        }
      } else if (slideshow.settings?.background_music) {
        // Single track - create a basic track object from the URL
        const track: MusicTrack = {
          id: "legacy-track",
          name: "Background Music",
          artist: "Unknown Artist",
          duration: 0,
          duration_formatted: "0:00",
          file_url: slideshow.settings.background_music,
          category: "legacy",
          tags: [],
          source: "curated",
          is_public: true,
          is_approved: true,
          play_count: 0,
          favorite_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCurrentMusicTrack(track);
      }
    } catch (error) {
      console.error("Error loading music data:", error);
    }
  };

  // Slideshow progression
  useEffect(() => {
    if (isPlaying && slideshow.images.length > 0) {
      const currentSlide = slideshow.images[currentIndex];
      const duration = currentSlide?.duration || 5000;

      intervalRef.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % slideshow.images.length);
      }, duration);

      return () => {
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
      };
    }
  }, [isPlaying, currentIndex, slideshow.images]);

  // Enhanced music playback
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = musicLoop;
      audioRef.current.volume = musicVolume / 100;

      audioRef.current.addEventListener("ended", handleMusicEnd);
      audioRef.current.addEventListener("error", handleMusicError);
    }

    if (isPlaying && !isMuted) {
      playCurrentMusic();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("ended", handleMusicEnd);
        audioRef.current.removeEventListener("error", handleMusicError);
      }
    };
  }, [isPlaying, isMuted, currentMusicTrack, currentPlaylistIndex, playMode]);

  const playCurrentMusic = async () => {
    if (!audioRef.current) return;

    let musicUrl = "";

    if (currentPlaylist && playlistTracks.length > 0) {
      let trackIndex = currentPlaylistIndex;

      if (playMode === "shuffle" && shuffledPlaylist.length > 0) {
        trackIndex =
          shuffledPlaylist[currentPlaylistIndex % shuffledPlaylist.length];
      } else if (playMode === "random") {
        trackIndex = Math.floor(Math.random() * playlistTracks.length);
      }

      const track = playlistTracks[trackIndex];
      if (track) {
        musicUrl = track.file_url;
        setCurrentMusicTrack(track);
      }
    } else if (currentMusicTrack) {
      musicUrl = currentMusicTrack.file_url;
    }

    if (musicUrl) {
      audioRef.current.src = musicUrl;
      audioRef.current.loop = musicLoop;
      audioRef.current.volume = musicVolume / 100;

      try {
        await audioRef.current.play();
        setIsMusicPlaying(true);
      } catch (error) {
        console.error("Failed to play music:", error);
        setIsMusicPlaying(false);
      }
    }
  };

  const handleMusicEnd = () => {
    if (currentPlaylist && playlistTracks.length > 0) {
      // Move to next track in playlist
      const nextIndex = (currentPlaylistIndex + 1) % playlistTracks.length;
      setCurrentPlaylistIndex(nextIndex);

      if (nextIndex === 0 && !musicLoop) {
        // End of playlist and not looping
        setIsMusicPlaying(false);
      }
    } else if (currentMusicTrack && !musicLoop) {
      // Single track ended and not looping
      setIsMusicPlaying(false);
    }
  };

  const handleMusicError = () => {
    console.error("Music playback error");
    setIsMusicPlaying(false);

    // Try next track if in playlist
    if (currentPlaylist && playlistTracks.length > 0) {
      const nextIndex = (currentPlaylistIndex + 1) % playlistTracks.length;
      setCurrentPlaylistIndex(nextIndex);
    }
  };

  // Update music volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume / 100;
    }
  }, [musicVolume]);

  // Update music loop
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = musicLoop;
    }
  }, [musicLoop]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slideshow.images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + slideshow.images.length) % slideshow.images.length
    );
  };

  const handleRestart = () => {
    setCurrentIndex(0);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Slideshow URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy URL:", error);
      alert(`Share this URL: ${shareUrl}`);
    }
  };

  const toggleFullscreen = () => {
    if (onFullscreenToggle) {
      onFullscreenToggle();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getCurrentMusicInfo = () => {
    if (currentPlaylist && playlistTracks.length > 0) {
      const track = playlistTracks[currentPlaylistIndex];
      return {
        name: track?.name || "Unknown Track",
        artist: track?.artist || "Unknown Artist",
        playlist: currentPlaylist.name,
        trackNumber: currentPlaylistIndex + 1,
        totalTracks: playlistTracks.length,
      };
    } else if (currentMusicTrack) {
      return {
        name: currentMusicTrack.name,
        artist: currentMusicTrack.artist,
        playlist: null,
        trackNumber: 1,
        totalTracks: 1,
      };
    }
    return null;
  };

  const currentSlide = slideshow.images[currentIndex];
  const musicInfo = getCurrentMusicInfo();

  if (!currentSlide) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No slides available</p>
      </div>
    );
  }

  const getAnimationVariants = (animation: string) => {
    switch (animation) {
      case "fade":
        return {
          enter: { opacity: 0 },
          center: { opacity: 1 },
          exit: { opacity: 0 },
        };
      case "slide":
        return {
          enter: { x: 300, opacity: 0 },
          center: { x: 0, opacity: 1 },
          exit: { x: -300, opacity: 0 },
        };
      case "zoom":
        return {
          enter: { scale: 0.8, opacity: 0 },
          center: { scale: 1, opacity: 1 },
          exit: { scale: 1.2, opacity: 0 },
        };
      case "flip":
        return {
          enter: { rotateY: 90, opacity: 0 },
          center: { rotateY: 0, opacity: 1 },
          exit: { rotateY: -90, opacity: 0 },
        };
      default:
        return {
          enter: { opacity: 0 },
          center: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  return (
    <div
      className={`relative bg-black ${
        isFullscreen ? "fixed inset-0 z-50" : "rounded-lg overflow-hidden"
      }`}
    >
      {/* Slideshow Display */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            variants={getAnimationVariants(currentSlide.styling.animation)}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: transitionDuration / 1000 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundColor: currentSlide.styling.backgroundColor,
              color: currentSlide.styling.textColor,
              perspective:
                currentSlide.styling.animation === "flip"
                  ? "1000px"
                  : undefined,
            }}
          >
            <div className="text-center px-8 max-w-4xl">
              {currentSlide.type === "text" && (
                <>
                  <h1
                    className="font-bold mb-4 leading-tight"
                    style={{ fontSize: `${currentSlide.styling.fontSize}px` }}
                  >
                    {currentSlide.title}
                  </h1>
                  {currentSlide.subtitle && (
                    <p className="text-lg opacity-90 mb-4">
                      {currentSlide.subtitle}
                    </p>
                  )}
                  {currentSlide.content?.text && (
                    <p className="text-xl leading-relaxed opacity-95">
                      {currentSlide.content.text}
                    </p>
                  )}
                </>
              )}
              {currentSlide.type === "image" && currentSlide.content?.image && (
                <img
                  src={currentSlide.content.image}
                  alt={currentSlide.title}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Music Info Bar */}
      {musicInfo && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="w-4 h-4 text-blue-400" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{musicInfo.name}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400 truncate">
                    {musicInfo.artist}
                  </span>
                </div>
                {musicInfo.playlist && (
                  <div className="text-xs text-gray-400">
                    {musicInfo.playlist} • Track {musicInfo.trackNumber}/
                    {musicInfo.totalTracks}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {playMode === "shuffle" && (
                <Shuffle className="w-4 h-4 text-blue-400" />
              )}
              {playMode === "random" && (
                <Repeat className="w-4 h-4 text-blue-400" />
              )}
              {musicLoop && <Repeat className="w-4 h-4 text-blue-400" />}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {/* Music Controls */}
          {musicInfo && (
            <div className="flex items-center gap-2 bg-black/60 rounded-lg p-2">
              <button
                onClick={toggleMute}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                onChange={(e) => setMusicVolume(Number(e.target.value))}
                className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                title="Music Volume"
              />
            </div>
          )}

          {/* Slideshow Controls */}
          <div className="flex items-center gap-2 bg-black/60 rounded-lg p-2">
            <button
              onClick={handlePrevious}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              title="Previous"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <button
              onClick={handleNext}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              title="Next"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center gap-2 bg-black/60 rounded-lg p-2">
            <button
              onClick={handleRestart}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / slideshow.images.length) * 100}%`,
            }}
          />
        </div>
      )}

      {/* Slide Counter */}
      {showControls && (
        <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
          {currentIndex + 1} / {slideshow.images.length}
        </div>
      )}
    </div>
  );
}
