import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TestDB() {
  const [results, setResults] = useState<any>({});

  const testQueries = async () => {
    const testResults: any = {};

    // Test 1: Check if slideshows table exists and has data
    try {
      const { data: slideshows, error: slideshowsError } = await supabase
        .from("slideshows")
        .select("*")
        .limit(5);

      testResults.slideshows = {
        data: slideshows,
        error: slideshowsError,
        count: slideshows?.length || 0,
      };
    } catch (e) {
      testResults.slideshows = { error: e };
    }

    // Test 2: Check slideshows table structure
    try {
      const { data: structure, error: structureError } = await supabase.rpc(
        "get_table_columns",
        { table_name: "slideshows" }
      );

      testResults.structure = {
        data: structure,
        error: structureError,
      };
    } catch (e) {
      testResults.structure = { error: e };
    }

    // Test 3: Check if businesses table has data
    try {
      const { data: businesses, error: businessesError } = await supabase
        .from("businesses")
        .select("id, name, slug")
        .limit(5);

      testResults.businesses = {
        data: businesses,
        error: businessesError,
        count: businesses?.length || 0,
      };
    } catch (e) {
      testResults.businesses = { error: e };
    }

    // Test 4: Check slides table
    try {
      const { data: slides, error: slidesError } = await supabase
        .from("slides")
        .select("id, title, business_id")
        .limit(5);

      testResults.slides = {
        data: slides,
        error: slidesError,
        count: slides?.length || 0,
      };
    } catch (e) {
      testResults.slides = { error: e };
    }

    // Test 5: Check slideshow_slides junction table
    try {
      const { data: slideshowSlides, error: slideshowSlidesError } =
        await supabase.from("slideshow_slides").select("*").limit(5);

      testResults.slideshowSlides = {
        data: slideshowSlides,
        error: slideshowSlidesError,
        count: slideshowSlides?.length || 0,
      };
    } catch (e) {
      testResults.slideshowSlides = { error: e };
    }

    setResults(testResults);
  };

  useEffect(() => {
    testQueries();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Database Test Results</h1>

      <button
        onClick={testQueries}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh Tests
      </button>

      <div className="space-y-6">
        {Object.entries(results).map(([key, result]: [string, any]) => (
          <div key={key} className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-2">{key}</h2>
            {result.error ? (
              <div className="text-red-600">
                <strong>Error:</strong> {JSON.stringify(result.error, null, 2)}
              </div>
            ) : (
              <div>
                <p>
                  <strong>Count:</strong> {result.count || "N/A"}
                </p>
                <pre className="mt-2 bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
