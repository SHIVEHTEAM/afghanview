import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Trash2, X } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  type?: "slideshow" | "image" | "general";
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  type = "general",
}: DeleteConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-black/5"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 pb-0 flex justify-between items-start">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <button onClick={onClose} className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all text-black/20 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <h3 className="text-xl font-bold text-black mb-2">{title}</h3>
              <p className="text-sm text-black/40 mb-6 leading-relaxed">{message}</p>

              {itemName && (
                <div className="bg-gray-50 border border-black/5 rounded-xl p-4 mb-8">
                  <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest mb-1">Deleting</p>
                  <p className="text-sm font-bold text-black truncate">"{itemName}"</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-gray-50 text-black border border-black/5 rounded-xl hover:bg-gray-100 transition-all font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-6 py-4 bg-black text-white rounded-xl hover:bg-black/90 transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>

            <div className="px-8 py-4 bg-gray-50 border-t border-black/5">
              <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest text-center">
                This action is permanent and cannot be undone
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
