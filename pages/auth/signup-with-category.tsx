import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Store,
  Utensils,
  Scissors,
  Stethoscope,
  Dumbbell,
  Hotel,
  GraduationCap,
  Briefcase,
} from "lucide-react";

interface BusinessCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  features: any;
}

const businessCategories: BusinessCategory[] = [
  {
    id: "restaurant",
    name: "Restaurant",
    slug: "restaurant",
    description: "Food and dining establishments",
    icon: "🍽️",
    color: "#FF6B6B",
    features: { slides: true, menu: true, analytics: true },
  },
  {
    id: "store",
    name: "Store",
    slug: "store",
    description: "Retail stores and shops",
    icon: "🛍️",
    color: "#4ECDC4",
    features: { slides: true, products: true, analytics: true },
  },
  {
    id: "salon",
    name: "Salon",
    slug: "salon",
    description: "Beauty and hair salons",
    icon: "💇‍♀️",
    color: "#45B7D1",
    features: { slides: true, services: true, appointments: true },
  },
  {
    id: "clinic",
    name: "Clinic",
    slug: "clinic",
    description: "Medical and health clinics",
    icon: "🏥",
    color: "#96CEB4",
    features: { slides: true, services: true, appointments: true },
  },
  {
    id: "gym",
    name: "Gym",
    slug: "gym",
    description: "Fitness centers and gyms",
    icon: "💪",
    color: "#FFEAA7",
    features: { slides: true, classes: true, memberships: true },
  },
  {
    id: "hotel",
    name: "Hotel",
    slug: "hotel",
    description: "Hotels and accommodations",
    icon: "🏨",
    color: "#DDA0DD",
    features: { slides: true, rooms: true, amenities: true },
  },
  {
    id: "school",
    name: "School",
    slug: "school",
    description: "Educational institutions",
    icon: "🎓",
    color: "#98D8C8",
    features: { slides: true, courses: true, events: true },
  },
  {
    id: "office",
    name: "Office",
    slug: "office",
    description: "Business offices and companies",
    icon: "🏢",
    color: "#F7DC6F",
    features: { slides: true, services: true, contact: true },
  },
];

const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case "restaurant":
      return Utensils;
    case "store":
      return Store;
    case "salon":
      return Scissors;
    case "clinic":
      return Stethoscope;
    case "gym":
      return Dumbbell;
    case "hotel":
      return Hotel;
    case "school":
      return GraduationCap;
    case "office":
      return Briefcase;
    default:
      return Building;
  }
};

export default function SignupWithCategory() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Sign Up</h1>
      <p className="text-lg text-gray-700 mb-8">
        To create an account, please select a paid plan from our{" "}
        <a href="/pricing" className="text-purple-600 underline">
          pricing page
        </a>{" "}
        and complete payment. Account creation is only available after payment.
      </p>
    </div>
  );
}
