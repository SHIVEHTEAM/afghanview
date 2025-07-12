import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function TestContent() {
  const [slideshows, setSlideshows] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Test slideshows query
      const { data: slideshowsData, error: slideshowsError } = await supabase
        .from("slideshows")
        .select("*");

      if (slideshowsError) {
        console.error("Slideshows error:", slideshowsError);
      } else {
        console.log("Slideshows data:", slideshowsData);
        setSlideshows(slideshowsData || []);
      }

      // Test slides query
      const { data: slidesData, error: slidesError } = await supabase
        .from("slides")
        .select("*");

      if (slidesError) {
        console.error("Slides error:", slidesError);
      } else {
        console.log("Slides data:", slidesData);
        setSlides(slidesData || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Database Content Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Slideshows ({slideshows.length})
          </h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(slideshows, null, 2)}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Slides ({slides.length})
          </h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(slides, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
