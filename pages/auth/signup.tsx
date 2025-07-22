import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Phone,
} from "lucide-react";

export default function SignUp() {
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
