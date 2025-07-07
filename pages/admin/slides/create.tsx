import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";
import AdminLayout from "../layout";
import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import { ModernSlideCreator } from "../../../components/editor";
import { ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "../../../components/auth";

export default function CreateSlide() {
  const router = useRouter();
  const { user } = useAuth();
  const [showSlideCreator, setShowSlideCreator] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSave = async (slideData: any) => {
    try {
      console.log("Saving slide data:", slideData);

      // Validate required fields
      if (!slideData.name || !slideData.title) {
        alert("Please fill in all required fields (name and title)");
        return;
      }

      // Use the server-side API endpoint to bypass RLS
      const response = await fetch("/api/slides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(slideData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create slide");
      }

      const data = await response.json();
      console.log("Slide created successfully:", data);

      // Show success message
      alert("Slide created successfully!");

      // Redirect to the slide detail page
      router.push(`/admin/slides/${data.id}`);
    } catch (error) {
      console.error("Error creating slide:", error);
      alert(
        `Error creating slide: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleCancel = () => {
    router.push("/admin/slides");
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <Head>
          <title>Create Slide - Admin Dashboard</title>
          <meta name="description" content="Create new slide" />
        </Head>

        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Create New Slide
          </h1>
          <p className="text-gray-600">
            This page will contain the slide creation form.
          </p>
        </div>

        {showSlideCreator && (
          <ModernSlideCreator
            onSave={handleSave}
            onCancel={handleCancel}
            isAdmin={true}
            user={user}
          />
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
