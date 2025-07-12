import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useSession } from "next-auth/react";
import AdminLayout from "./layout";

export default function TestSimpleQueries() {
  const { data: session } = useSession();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults: any = {};

    try {
      // Test 1: Simple businesses query
      console.log("Testing simple businesses query...");
      const { data: businesses, error: businessesError } = await supabase
        .from("businesses")
        .select("id, name, created_at")
        .limit(5);

      testResults.businesses = {
        success: !businessesError,
        count: businesses?.length || 0,
        data: businesses,
        error: businessesError,
      };

      // Test 2: Businesses with category
      console.log("Testing businesses with category...");
      const { data: businessesWithCategory, error: categoryError } =
        await supabase
          .from("businesses")
          .select(
            `
          id, 
          name, 
          created_at,
          category:business_categories(id, name, slug)
        `
          )
          .limit(5);

      testResults.businessesWithCategory = {
        success: !categoryError,
        count: businessesWithCategory?.length || 0,
        data: businessesWithCategory,
        error: categoryError,
      };

      // Test 3: Businesses with created_by (fixed)
      console.log("Testing businesses with created_by (fixed)...");
      const { data: businessesWithUser, error: userError } = await supabase
        .from("businesses")
        .select(
          `
          id, 
          name, 
          created_at,
          created_by:users!businesses_created_by_fkey(id, email, first_name, last_name)
        `
        )
        .limit(5);

      testResults.businessesWithUser = {
        success: !userError,
        count: businessesWithUser?.length || 0,
        data: businessesWithUser,
        error: userError,
      };

      // Test 4: Simple slideshows query
      console.log("Testing simple slideshows query...");
      const { data: slideshows, error: slideshowsError } = await supabase
        .from("slideshows")
        .select("id, title, created_at")
        .limit(5);

      testResults.slideshows = {
        success: !slideshowsError,
        count: slideshows?.length || 0,
        data: slideshows,
        error: slideshowsError,
      };

      // Test 5: Slideshows with business and created_by (fixed)
      console.log("Testing slideshows with business and created_by (fixed)...");
      const { data: slideshowsWithDetails, error: slideshowsDetailsError } =
        await supabase
          .from("slideshows")
          .select(
            `
          id, 
          title, 
          created_at,
          business:businesses(id, name, slug),
          created_by:users!slideshows_created_by_fkey(id, first_name, last_name)
        `
          )
          .limit(5);

      testResults.slideshowsWithDetails = {
        success: !slideshowsDetailsError,
        count: slideshowsWithDetails?.length || 0,
        data: slideshowsWithDetails,
        error: slideshowsDetailsError,
      };

      // Test 6: Simple slides query
      console.log("Testing simple slides query...");
      const { data: slides, error: slidesError } = await supabase
        .from("slides")
        .select("id, title, type, created_at")
        .limit(5);

      testResults.slides = {
        success: !slidesError,
        count: slides?.length || 0,
        data: slides,
        error: slidesError,
      };

      // Test 7: Slides with business and created_by (fixed)
      console.log("Testing slides with business and created_by (fixed)...");
      const { data: slidesWithDetails, error: slidesDetailsError } =
        await supabase
          .from("slides")
          .select(
            `
          id, 
          title, 
          type,
          created_at,
          business:businesses(id, name),
          created_by:users!slides_created_by_fkey(id, first_name, last_name)
        `
          )
          .limit(5);

      testResults.slidesWithDetails = {
        success: !slidesDetailsError,
        count: slidesWithDetails?.length || 0,
        data: slidesWithDetails,
        error: slidesDetailsError,
      };
    } catch (error) {
      console.error("Test error:", error);
      testResults.error = error;
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      runTests();
    }
  }, [session]);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Database Query Tests
          </h1>
          <p className="text-gray-600 mt-2">
            Testing database queries to identify issues
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={runTests}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Running Tests..." : "Run Tests"}
          </button>
        </div>

        <div className="space-y-6">
          {Object.entries(results).map(([testName, result]: [string, any]) => (
            <div
              key={testName}
              className={`p-6 rounded-lg border ${
                result.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <h3 className="text-lg font-semibold mb-2 capitalize">
                {testName.replace(/([A-Z])/g, " $1").trim()}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="font-medium">Status: </span>
                  <span
                    className={
                      result.success
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {result.success ? "✅ Success" : "❌ Failed"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Count: </span>
                  <span className="font-semibold">{result.count || 0}</span>
                </div>
                {result.error && (
                  <div>
                    <span className="font-medium">Error: </span>
                    <span className="text-red-600 text-sm">
                      {result.error.message}
                    </span>
                  </div>
                )}
              </div>

              {result.data && result.data.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Sample Data:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(result.data.slice(0, 2), null, 2)}
                  </pre>
                </div>
              )}

              {result.error && (
                <div>
                  <h4 className="font-medium mb-2">Error Details:</h4>
                  <pre className="bg-red-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(result.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
