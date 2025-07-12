import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import AdminLayout from "./layout";

export default function TestData() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log("Fetching all data...");

      // Fetch businesses
      const { data: businessesData, error: businessesError } = await supabase
        .from("businesses")
        .select("*")
        .limit(10);

      if (businessesError) {
        console.error("Businesses error:", businessesError);
      } else {
        console.log("Businesses data:", businessesData);
        setBusinesses((businessesData || []) as any);
      }

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .limit(10);

      if (usersError) {
        console.error("Users error:", usersError);
      } else {
        console.log("Users data:", usersData);
        setUsers((usersData || []) as any);
      }

      // Fetch subscriptions
      const { data: subscriptionsData, error: subscriptionsError } =
        await supabase.from("business_subscriptions").select("*").limit(10);

      if (subscriptionsError) {
        console.error("Subscriptions error:", subscriptionsError);
      } else {
        console.log("Subscriptions data:", subscriptionsData);
        setSubscriptions((subscriptionsData || []) as any);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading test data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Test Data - Admin Dashboard</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Database Test Results
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Businesses */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Businesses ({businesses.length})
            </h2>
            {businesses.length === 0 ? (
              <p className="text-gray-500">No businesses found</p>
            ) : (
              <div className="space-y-2">
                {businesses.map((business: any) => (
                  <div key={business.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{business.name}</p>
                    <p className="text-sm text-gray-600">{business.slug}</p>
                    <p className="text-xs text-gray-500">
                      Active: {business.is_active ? "Yes" : "No"} | Verified:{" "}
                      {business.is_verified ? "Yes" : "No"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Users */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Users ({users.length})
            </h2>
            {users.length === 0 ? (
              <p className="text-gray-500">No users found</p>
            ) : (
              <div className="space-y-2">
                {users.map((user: any) => (
                  <div key={user.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Active: {user.is_active ? "Yes" : "No"} | Verified:{" "}
                      {user.email_verified ? "Yes" : "No"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subscriptions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Subscriptions ({subscriptions.length})
            </h2>
            {subscriptions.length === 0 ? (
              <p className="text-gray-500">No subscriptions found</p>
            ) : (
              <div className="space-y-2">
                {subscriptions.map((subscription: any) => (
                  <div
                    key={subscription.id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <p className="font-medium">Status: {subscription.status}</p>
                    <p className="text-sm text-gray-600">
                      ID: {subscription.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created:{" "}
                      {new Date(subscription.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Instructions
          </h3>
          <p className="text-blue-800">
            This page shows raw data from your database. If you see data here
            but not in the main admin pages, there might be an issue with the
            queries or UI rendering. Check the browser console for any errors.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
