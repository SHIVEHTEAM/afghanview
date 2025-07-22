import React, { useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import {
  User,
  Mail,
  Lock,
  Building,
  Store,
  Coffee,
  Utensils,
  Car,
  Heart,
  Music,
  GraduationCap,
  Check,
  ArrowRight,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { AnimatePresence } from "framer-motion";

interface OnboardingForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessName: string;
  businessType: string;
}

const businessTypes = [
  {
    id: "restaurant",
    name: "Restaurant",
    description: "Restaurants and food services",
    icon: Utensils,
    color: "bg-orange-500",
  },
  {
    id: "cafe",
    name: "Cafe",
    description: "Cafes and coffee shops",
    icon: Coffee,
    color: "bg-brown-500",
  },
  {
    id: "retail",
    name: "Retail Store",
    description: "Retail stores and shops",
    icon: Store,
    color: "bg-blue-500",
  },
  {
    id: "service",
    name: "Service Business",
    description: "Service and professional businesses",
    icon: Building,
    color: "bg-purple-500",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Healthcare and medical services",
    icon: Heart,
    color: "bg-red-500",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    description: "Entertainment and recreation",
    icon: Music,
    color: "bg-pink-500",
  },
  {
    id: "education",
    name: "Education",
    description: "Educational institutions",
    icon: GraduationCap,
    color: "bg-green-500",
  },
  {
    id: "other",
    name: "Other",
    description: "Other business types",
    icon: Building,
    color: "bg-gray-500",
  },
];

export default function OnboardingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Onboarding</h1>
      <p className="text-lg text-gray-700 mb-8">
        Onboarding will begin after your payment is confirmed. Please select a
        paid plan from our{" "}
        <a href="/pricing" className="text-purple-600 underline">
          pricing page
        </a>{" "}
        to get started.
      </p>
    </div>
  );
}
