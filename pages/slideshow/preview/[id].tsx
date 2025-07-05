import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import SimpleImageViewer from "../../../components/slideshow/SimpleImageViewer";

interface Slide {
  id: string;
  name: string;
  title: string;
  subtitle?: string;
  content: {
    images: any[];
    videos: any[];
    text: {
      title: string;
      subtitle: string;
      description: string;
    };
    styling: any;
    animation: any;
    mediaCount: number;
    hasVideos: boolean;
    hasImages: boolean;
  };
  styling: any;
  duration: number;
}

export default function SlidePreview() {
  const router = useRouter();
  const { id } = router.query;
  const [slide, setSlide] = useState<Slide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchSlide();
    }
  }, [id]);

  const fetchSlide = async () => {
    try {
      const response = await fetch(`/api/slides/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load slide");
      }

      const data = await response.json();
      setSlide(data);
    } catch (error) {
      console.error("Error fetching slide:", error);
      setError(error instanceof Error ? error.message : "Failed to load slide");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !slide) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Slide Not Found</h1>
          <p className="text-gray-400">
            {error || "The slide could not be found"}
          </p>
        </div>
      </div>
    );
  }

  // Convert slide content to SimpleImageViewer format - include both images and videos
  const allMedia = [
    ...(slide.content.images || []).map((img, index) => ({
      id: img.id || `img-${index}`,
      name: img.alt || `Image ${index + 1}`,
      url: img.url,
      file_path: img.file_path,
      type: "image" as const,
    })),
    ...(slide.content.videos || []).map((vid, index) => ({
      id: vid.id || `vid-${index}`,
      name: vid.alt || `Video ${index + 1}`,
      url: vid.url,
      file_path: vid.file_path,
      type: "video" as const,
    })),
  ];

  const settings = {
    duration: slide.duration || 5000,
    transition: slide.content.animation?.type || "fade",
    autoPlay: true,
    showControls: true,
    tvMode: false,
  };

  return (
    <>
      <Head>
        <title>{slide.name} - Preview</title>
        <meta name="description" content={`Preview: ${slide.title}`} />
      </Head>

      <SimpleImageViewer
        images={allMedia}
        settings={settings}
        onClose={() => window.close()}
      />
    </>
  );
}
