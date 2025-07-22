import Link from "next/link";
import { useState } from "react";

export default function Header({
  onManageSubscription,
}: {
  onManageSubscription?: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-lg rounded-b-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20 py-2">
          <div className="flex items-center gap-4 w-full justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <img
                src="/Shivehview Transparent Logo.png"
                alt="Shivehview Logo"
                className="h-10 w-auto rounded-xl shadow"
              />
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                Shivehview
              </span>
            </div>
            {/* Hamburger for mobile */}
            <button
              className="md:hidden p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80 border border-gray-200 shadow"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Open navigation menu"
            >
              <svg
                className="h-8 w-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-10 ml-10 rounded-xl bg-white/60 px-4 py-2 shadow-sm">
            <Link
              href="/"
              className="text-lg font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 px-3 py-2 rounded transition-all"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-lg font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 px-3 py-2 rounded transition-all"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="text-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent px-3 py-2 rounded shadow-sm"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="text-lg font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 px-3 py-2 rounded transition-all"
            >
              Blog
            </Link>
          </nav>
          <div className="hidden md:flex items-center space-x-4 ml-8">
            <a
              href="/auth/signin"
              className="text-gray-600 hover:text-gray-900 font-semibold px-6 py-2 rounded hover:bg-gray-100 transition-all whitespace-nowrap"
            >
              Sign In
            </a>
            <a
              href="/auth/signup"
              className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-2 rounded-xl font-bold shadow-lg hover:from-purple-700 hover:to-blue-600 transition-all whitespace-nowrap"
            >
              Get Started
            </a>
          </div>
        </div>
        {/* Mobile nav menu with backdrop and animation */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="md:hidden fixed top-20 left-0 w-full z-50 animate-slideDown">
              <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 pb-6 shadow-2xl rounded-b-2xl">
                <nav className="flex flex-col space-y-3 mt-4 px-6">
                  <Link
                    href="/"
                    className="py-3 text-lg text-gray-700 hover:text-purple-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/about"
                    className="py-3 text-lg text-gray-700 hover:text-purple-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/pricing"
                    className="py-3 text-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/blog"
                    className="py-3 text-lg text-gray-700 hover:text-purple-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Blog
                  </Link>
                </nav>
                <div className="flex flex-col space-y-3 mt-6 px-6">
                  <a
                    href="/auth/signin"
                    className="text-gray-600 hover:text-gray-900 font-medium py-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </a>
                  <a
                    href="/auth/signup"
                    className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-5 py-3 rounded-xl font-bold shadow hover:from-purple-700 hover:to-blue-600 transition-all text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
