import React from "react";
import { AlertCircle, X } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  type?: "error" | "warning" | "info";
  className?: string;
}

export default function ErrorMessage({
  message,
  onClose,
  type = "error",
  className = "",
}: ErrorMessageProps) {
  const getStyles = () => {
    switch (type) {
      case "warning":
        return "bg-black text-white border-white/20";
      case "info":
        return "bg-gray-50 text-black border-black/5";
      default:
        return "bg-black text-white border-white/20 shadow-xl";
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-5 rounded-2xl border transition-all ${getStyles()} ${className}`}
    >
      <AlertCircle
        className="w-5 h-5 mt-0.5 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-tight">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
