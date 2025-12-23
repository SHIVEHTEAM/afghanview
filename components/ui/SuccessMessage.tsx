import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

interface SuccessMessageProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function SuccessMessage({
  message,
  isVisible,
  onClose,
  duration = 4000,
}: SuccessMessageProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed top-6 right-6 z-[600] max-w-sm w-full"
        >
          <div className="bg-black text-white p-5 rounded-2xl shadow-2xl flex items-start gap-4 border border-white/10">
            <CheckCircle className="h-6 w-6 text-white shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {duration > 0 && (
            <motion.div
              className="absolute bottom-0 left-4 right-4 h-0.5 bg-white/20 rounded-full overflow-hidden"
              initial={{ width: "0%" }}
              animate={{ width: "90%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
