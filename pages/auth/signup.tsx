import React from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignUp() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white px-4">
      <Head>
        <title>Get Started - Shivehview</title>
      </Head>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center"
      >
        <h1 className="text-3xl font-extrabold mb-4 text-gray-900">
          Get Started
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          To create your account, please choose a plan that fits your business.
          You'll get instant access after payment.
        </p>
        <Link
          href="/pricing"
          className="inline-block w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white text-lg font-bold shadow-lg hover:from-purple-700 hover:to-blue-600 transition-all"
        >
          Choose a Plan
        </Link>
        <p className="mt-6 text-gray-500 text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-purple-600 underline font-medium"
          >
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
