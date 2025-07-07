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
  const getTypeStyles = () => {
    switch (type) {
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-red-50 border-red-200 text-red-800";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "warning":
        return "text-amber-500";
      case "info":
        return "text-blue-500";
      default:
        return "text-pink-500";
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${getTypeStyles()} ${className}`}
    >
      <AlertCircle
        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getIconColor()}`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
