import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../../../../lib/auth";
import { supabase } from "../../../../lib/supabase";
import ModernSlideCreator from "../../../../components/ModernSlideCreator";
import { ArrowLeft } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export default function RestaurantCreateSlide() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRestaurant();
    }
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, slug, is_active")
        .eq("id", id)
        .single();

      if (error) throw error;
      setRestaurant(data);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (slideData: any) => {
    try {
      console.log("Saving slide data:", slideData);

      // Validate required fields
      if (!slideData.name || !slideData.title) {
        alert("Please fill in all required fields (name and title)");
        return;
      }

      // Ensure proper data structure
      const cleanSlideData = {
        ...slideData,
        restaurant_id: id, // Ensure restaurant_id is set
        content: slideData.content || {},
        styling: slideData.styling || {},
        duration: slideData.duration || 6000,
        order_index: slideData.order_index || 1,
        is_active: slideData.is_active ?? true,
        is_published: slideData.is_published ?? false,
        is_locked: slideData.is_locked ?? false,
        created_by: slideData.created_by || user?.id,
        updated_by: slideData.created_by || user?.id,
      };

      console.log("Clean slide data:", cleanSlideData);

      const { data, error } = await supabase
        .from("slides")
        .insert(cleanSlideData)
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);

        // Check for specific constraint violations
        if (error.message.includes("check constraint")) {
          throw new Error(
            "Invalid slide type. Allowed types: image, menu, promo, quote, hours, custom"
          );
        }

        if (error.message.includes("foreign key")) {
          throw new Error("Invalid restaurant or user reference");
        }

        throw error;
      }

      console.log("Slide created successfully:", data);
      router.push(`/restaurant/${id}/slides/${data.id}`);
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
    router.push(`/restaurant/${id}/slides`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-afghan-green"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Restaurant Not Found
          </h1>
          <p className="text-gray-600">
            The restaurant you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Create Slide - {restaurant.name} | ShivehView</title>
        <meta
          name="description"
          content={`Create a new slide for ${restaurant.name}`}
        />
      </Head>

      <ModernSlideCreator
        restaurantId={restaurant.id}
        onSave={handleSave}
        onCancel={handleCancel}
        isAdmin={false}
        user={user}
      />
    </div>
  );
}
