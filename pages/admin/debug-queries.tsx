import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import AdminLayout from "./layout";

export default function DebugQueries() {
  const { user } = useAuth();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      runDebugQueries();
    }
  }, [user]);

  const runDebugQueries = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Current user:", user);
      console.log("Running debug queries...");

      const queries = {
        businesses: supabase.from("businesses").select("*").limit(5),
        users: supabase.from("users").select("*").limit(5),
        slideshows: supabase.from("slideshows").select("*").limit(5),
        slides: supabase.from("slides").select("*").limit(5),
        business_subscriptions: supabase
          .from("business_subscriptions")
          .select("*")
          .limit(5),
        business_staff: supabase.from("business_staff").select("*").limit(5),
      };

      const results: any = {};

      for (const [name, query] of Object.entries(queries)) {
        try {
          console.log(`Running ${name} query...`);
          const { data, error } = await query;

          if (error) {
            console.error(`${name} error:`, error);
            results[name] = { error: error.message, data: null };
          } else {
            console.log(`${name} success:`, data);
            results[name] = { error: null, data, count: data?.length || 0 };
          }
        } catch (err) {
          console.error(`${name} exception:`, err);
          results[name] = { error: String(err), data: null };
        }
      }

      setResults(results);
    } catch (err) {
      console.error("Debug queries error:", err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const TestComplexQuery = async () => {
    try {
      console.log("Testing complex businesses query...");

      // Test the exact query from the admin page
      const { data, error } = await supabase
        .from("businesses")
        .select(
          `
          id,
          name,
          slug,
          description,
          created_at,
          is_active,
          is_verified,
          category:business_categories(id, name, slug),
          subscription:business_subscriptions(
            id,
            status,
            current_period_end,
            plan:subscription_plans(name, slug)
          ),
          created_by:users(id, email, first_name, last_name)
        `
        )
        .order("created_at", { ascending: false });

      console.log("Complex query result:", { data, error });

      if (error) {
        alert(`Complex query error: ${error.message}`);
      } else {
        alert(`Complex query success: ${data?.length || 0} businesses found`);
      }
    } catch (err) {
      console.error("Complex query exception:", err);
      alert(`Complex query exception: ${err}`);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Running debug queries...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Debug Queries - Admin Dashboard</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Debug Queries</h1>
            <p className="text-gray-600 mt-2">
              Testing database access and queries
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={runDebugQueries}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Run Queries Again
            </button>
            <button
              onClick={TestComplexQuery}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Test Complex Query
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(results).map(([name, result]: [string, any]) => (
            <div
              key={name}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                {name.replace("_", " ")} ({result.count || 0})
              </h3>

              {result.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-medium">Error:</p>
                  <p className="text-red-700 text-sm">{result.error}</p>
                </div>
              ) : result.data && result.data.length > 0 ? (
                <div className="space-y-2">
                  {result.data.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    </div>
                  ))}
                  {result.data.length > 3 && (
                    <p className="text-sm text-gray-500">
                      ... and {result.data.length - 3} more
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No data found</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-900 font-medium mb-2">Instructions</h3>
          <p className="text-blue-800 text-sm">
            This page tests basic database access. If you see errors here, it
            means there are permission issues. If you see data here but not in
            the main admin pages, the issue is in the admin page queries.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
