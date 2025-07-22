import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X, Eye } from "lucide-react";
import {
  HeroSection,
  FeaturesSection,
  PricingSection,
  Header,
} from "../components/home";
import Footer from "@/components/common/Footer";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Head>
        <title>
          Shivehview - AI-Powered Business Display Platform | Digital Signage
        </title>
        <meta
          name="description"
          content="Transform your business with Shivehview - The AI-powered display platform for Afghan businesses with auto-generated cultural content, digital displays, and TV management."
        />
        <meta
          name="keywords"
          content="business digital signage, AI content creation, Afghan business technology, digital display, TV management, slideshow creator, Shivehview"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content="Shivehview - AI-Powered Business Display Platform"
        />
        <meta
          property="og:description"
          content="Transform your business with AI-powered digital signage, cultural content, and digital displays."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shivehview.com" />
        <meta
          property="og:image"
          content="https://shivehview.com/Shivehview%20Transparent%20Logo.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Shivehview - AI-Powered Business Display Platform"
        />
        <meta
          name="twitter:description"
          content="Transform your business with AI-powered digital signage and cultural content."
        />
        <meta
          name="twitter:image"
          content="https://shivehview.com/Shivehview%20Transparent%20Logo.png"
        />
        <link rel="canonical" href="https://shivehview.com" />
        <link rel="icon" href="/Shivehview Transparent Logo.png" />
        <link rel="apple-touch-icon" href="/Shivehview Transparent Logo.png" />
      </Head>

      <Header onManageSubscription={() => {}} />

      {/* Main Content */}
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
