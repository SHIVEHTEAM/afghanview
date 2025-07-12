import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";
import Head from "next/head";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus("loading");
        setMessage("Processing authentication...");

        // Get the current session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth error:", error);
          setStatus("error");
          setMessage("Authentication failed. Please try again.");
          setTimeout(() => router.push("/auth/signin"), 3000);
          return;
        }

        if (!data.session) {
          setStatus("error");
          setMessage("No session found. Please sign in again.");
          setTimeout(() => router.push("/auth/signin"), 3000);
          return;
        }

        const user = data.session.user;
        console.log("User authenticated:", user.email);

        // Get user's business information (this is more reliable)
        const { data: businessData, error: businessError } = await supabase
          .from("businesses")
          .select(
            `
            id,
            name,
            type,
            description,
            is_active
          `
          )
          .eq("user_id", user.id)
          .single();

        if (businessError && businessError.code !== "PGRST116") {
          console.error("Error fetching business data:", businessError);
        }

        setStatus("success");

        // Determine redirect based on business existence
        if (businessData && businessData.is_active) {
          console.log("User has business, redirecting to dashboard");
          setMessage("Welcome back! Redirecting to dashboard...");
          setTimeout(() => router.push("/client"), 2000);
        } else {
          console.log("User has no business, redirecting to onboarding");
          setMessage("Welcome! Setting up your account...");
          setTimeout(() => router.push("/onboarding"), 2000);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again.");
        setTimeout(() => router.push("/auth/signin"), 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />;
      case "success":
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case "error":
        return <AlertCircle className="w-8 h-8 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "loading":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
    }
  };

  return (
    <>
      <Head>
        <title>Authentication - ShivehView</title>
        <meta name="description" content="Processing your authentication" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-400 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4"
        >
          <div className="text-center">
            <div className="mb-6">{getStatusIcon()}</div>
            <h2 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
              {status === "loading" && "Processing..."}
              {status === "success" && "Success!"}
              {status === "error" && "Error"}
            </h2>
            <p className="text-gray-600">{message}</p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
