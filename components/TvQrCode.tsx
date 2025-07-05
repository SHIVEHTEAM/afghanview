import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  QrCode,
  Copy,
  Download,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

interface TvQrCodeProps {
  slideshowId: string;
  slideshowName: string;
  baseUrl: string;
  onClose?: () => void;
}

export default function TvQrCode({
  slideshowId,
  slideshowName,
  baseUrl,
  onClose,
}: TvQrCodeProps) {
  const [showQr, setShowQr] = useState(true);
  const [copied, setCopied] = useState(false);

  const tvUrl = `${baseUrl}/tv/${slideshowId}`;

  // Generate QR code using a simple API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    tvUrl
  )}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(tvUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleDownloadQr = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `tv-display-${slideshowName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden p-6 pt-10"
      style={{ marginTop: 0 }}
    >
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">TV Display Setup</h3>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 text-sm mb-2">
          Scan this QR code with your TV's browser or enter the URL manually:
        </p>
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
          <input
            type="text"
            value={tvUrl}
            readOnly
            className="flex-1 bg-transparent text-sm text-gray-700 font-mono"
          />
          <button
            onClick={handleCopyUrl}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            title="Copy URL"
          >
            {copied ? (
              <span className="text-green-600 text-sm font-medium">
                Copied!
              </span>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {showQr && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="text-center"
        >
          <div className="bg-white p-4 rounded-xl border border-gray-200 inline-block mb-4">
            <img
              src={qrCodeUrl}
              alt="TV Display QR Code"
              className="w-64 h-64"
            />
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleDownloadQr}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download QR
            </button>
          </div>
        </motion.div>
      )}

      {/* Setup Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Tv className="w-4 h-4" />
          Setup Instructions
        </h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
              1
            </span>
            <span>Open your TV's web browser</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
              2
            </span>
            <span>Scan the QR code or enter the URL manually</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
              3
            </span>
            <span>
              The slideshow will start automatically in fullscreen mode
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
              4
            </span>
            <span>Keep the browser tab open for continuous playback</span>
          </div>
        </div>
      </div>

      {/* Device Compatibility */}
      <div className="mt-4">
        <h4 className="font-semibold text-gray-900 mb-2">Compatible Devices</h4>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Tv className="w-4 h-4" />
            <span>Smart TVs</span>
          </div>
          <div className="flex items-center gap-1">
            <Monitor className="w-4 h-4" />
            <span>Monitors</span>
          </div>
          <div className="flex items-center gap-1">
            <Tablet className="w-4 h-4" />
            <span>Tablets</span>
          </div>
          <div className="flex items-center gap-1">
            <Smartphone className="w-4 h-4" />
            <span>Phones</span>
          </div>
        </div>
      </div>
    </div>
  );
}
