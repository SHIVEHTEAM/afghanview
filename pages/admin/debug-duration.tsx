import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function DebugDuration() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get slideshow data
        const { data: slideshowData } = await supabase
          .from("slideshows")
          .select("*")
          .limit(1);

        console.log("Slideshow data:", slideshowData);

        if (slideshowData && slideshowData.length > 0) {
          const slideshow = slideshowData[0];

          // Get slides data for this slideshow
          const { data: slidesData } = await supabase
            .from("slideshow_slides")
            .select(
              `
              slides!inner(duration, title)
            `
            )
            .eq("slideshow_id", slideshow.id);

          console.log("Slides data:", slidesData);

          // Calculate total duration
          const totalDuration =
            slidesData?.reduce((sum: number, item: any) => {
              const duration = item.slides?.duration || 0;
              console.log(
                `Slide: ${item.slides?.title}, Duration: ${duration}`
              );
              return sum + duration;
            }, 0) || 0;

          console.log("Total duration:", totalDuration);

          setData({
            slideshow,
            slidesData,
            totalDuration,
            formattedDuration: `${Math.floor(totalDuration / 1000 / 60)}:${(
              Math.floor(totalDuration / 1000) % 60
            )
              .toString()
              .padStart(2, "0")}`,
          });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Duration Debug</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
