import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Settings, Check } from "lucide-react";

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
  onCustomize: () => void;
}

export default function CookieConsent({
  onAccept,
  onDecline,
  onCustomize,
}: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
    onDecline();
  };

  const handleCustomize = () => {
    setIsVisible(false);
    onCustomize();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0">
                <Cookie className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  We use cookies to enhance your experience
                </h3>
                <p className="text-sm text-gray-600">
                  We use cookies and similar technologies to help personalize
                  content, provide and improve our services, and analyze our
                  traffic. By clicking "Accept All", you consent to our use of
                  cookies.{" "}
                  <Link
                    href="/cookie-policy"
                    className="text-purple-600 hover:text-purple-700 underline"
                  >
                    Learn more
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 flex-shrink-0">
              <button
                onClick={handleCustomize}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 mr-1" />
                Customize
              </button>
              <button
                onClick={handleDecline}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                <Check className="w-4 h-4 mr-1" />
                Accept All
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
