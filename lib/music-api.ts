// Music API service for fetching free music tracks
export interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  category: string;
  duration: string;
  url: string;
  description: string;
  tags: string[];
  license?: string;
  source?: string;
}

// Free Music Archive API (example)
const FMA_API_BASE = "https://freemusicarchive.org/api";

export class MusicAPIService {
  // Get tracks from Free Music Archive
  static async getFMATracks(
    genre?: string,
    limit: number = 20
  ): Promise<MusicTrack[]> {
    try {
      // Note: You'll need to register for an API key at https://freemusicarchive.org/api/
      const apiKey = process.env.FMA_API_KEY;
      if (!apiKey) {
        console.warn("FMA API key not configured, using fallback tracks");
        return this.getFallbackTracks();
      }

      const response = await fetch(
        `${FMA_API_BASE}/tracks?api_key=${apiKey}&limit=${limit}${
          genre ? `&genre_id=${genre}` : ""
        }`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch from FMA");
      }

      const data = await response.json();
      return data.dataset.map((track: any) => ({
        id: `fma-${track.track_id}`,
        name: track.track_title,
        artist: track.artist_name,
        category: track.genre_handle || "Unknown",
        duration: this.formatDuration(track.track_duration),
        url: track.track_url,
        description: track.track_description || "No description available",
        tags:
          track.track_tags?.split(",").map((tag: string) => tag.trim()) || [],
        license: track.license_title,
        source: "Free Music Archive",
      }));
    } catch (error) {
      console.error("Error fetching FMA tracks:", error);
      return this.getFallbackTracks();
    }
  }

  // Get tracks from Jamendo Music (alternative)
  static async getJamendoTracks(
    query?: string,
    limit: number = 20
  ): Promise<MusicTrack[]> {
    try {
      const apiKey = process.env.JAMENDO_API_KEY;
      if (!apiKey) {
        console.warn("Jamendo API key not configured, using fallback tracks");
        return this.getFallbackTracks();
      }

      const response = await fetch(
        `https://api.jamendo.com/v3/tracks/?client_id=${apiKey}&format=json&limit=${limit}${
          query ? `&search=${query}` : ""
        }&include=musicinfo`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch from Jamendo");
      }

      const data = await response.json();
      return data.results.map((track: any) => ({
        id: `jamendo-${track.id}`,
        name: track.name,
        artist: track.artist_name,
        category: track.tags?.[0] || "Unknown",
        duration: this.formatDuration(track.duration),
        url: track.audio,
        description: track.description || "No description available",
        tags: track.tags || [],
        license: track.license_ccurl,
        source: "Jamendo",
      }));
    } catch (error) {
      console.error("Error fetching Jamendo tracks:", error);
      return this.getFallbackTracks();
    }
  }

  // Fallback tracks when APIs are not available
  static getFallbackTracks(): MusicTrack[] {
    return [
      // Afghan Traditional Music (using royalty-free alternatives)
      {
        id: "afghan-folk-1",
        name: "Traditional Afghan Melody",
        artist: "Cultural Music Collection",
        category: "Afghan Traditional",
        duration: "3:45",
        url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // Placeholder
        description:
          "Traditional Afghan folk music with traditional instruments",
        tags: ["afghan", "folk", "traditional", "cultural"],
        source: "SoundJay",
      },
      {
        id: "persian-classical-1",
        name: "Persian Classical",
        artist: "Middle Eastern Music",
        category: "Persian Traditional",
        duration: "4:20",
        url: "https://www.soundjay.com/misc/sounds/bell-ringing-04.wav", // Placeholder
        description: "Classical Persian music with traditional instruments",
        tags: ["persian", "classical", "traditional"],
        source: "SoundJay",
      },
      // Add more fallback tracks...
    ];
  }

  // Search across multiple sources
  static async searchTracks(
    query: string,
    category?: string
  ): Promise<MusicTrack[]> {
    const results: MusicTrack[] = [];

    try {
      // Search FMA
      const fmaResults = await this.getFMATracks(category, 10);
      results.push(
        ...fmaResults.filter(
          (track) =>
            track.name.toLowerCase().includes(query.toLowerCase()) ||
            track.artist.toLowerCase().includes(query.toLowerCase())
        )
      );

      // Search Jamendo
      const jamendoResults = await this.getJamendoTracks(query, 10);
      results.push(...jamendoResults);
    } catch (error) {
      console.error("Error searching tracks:", error);
    }

    return results.length > 0 ? results : this.getFallbackTracks();
  }

  private static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
}

// Curated playlists for different moods/categories
export const CURATED_PLAYLISTS = {
  "afghan-traditional": [
    "afghan-folk-1",
    "afghan-classical-1",
    "persian-classical-1",
  ],
  "ambient-relaxing": ["peaceful-ambience-1", "meditation-1", "spa-music-1"],
  "upbeat-energetic": ["upbeat-energy-1", "positive-vibes-1", "celebratory-1"],
};
