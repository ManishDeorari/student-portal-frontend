"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger",
  darkMode = false,
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative p-[1.5px] rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl ${
              type === "danger"
                ? "bg-gradient-to-tr from-red-500 to-pink-600"
                : "bg-gradient-to-tr from-blue-500 to-purple-600"
            }`}
          >
            <div
              className={`p-8 rounded-[calc(2rem-1.5px)] ${
                darkMode ? "bg-[#0f172a]" : "bg-white"
              } flex flex-col items-center text-center`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
                  type === "danger"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-blue-500/10 text-blue-500"
                }`}
              >
                {type === "danger" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>

              <h2
                className={`text-xl font-black mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {title}
              </h2>
              <p
                className={`text-sm font-medium mb-8 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {message}
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={onClose}
                  className={`flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 border-2 ${
                    darkMode
                      ? "border-white/10 text-gray-300 hover:bg-white/5"
                      : "border-gray-100 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${
                    type === "danger"
                      ? "bg-gradient-to-r from-red-500 to-pink-600 shadow-red-500/25 hover:shadow-red-500/40"
                      : "bg-gradient-to-r from-blue-600 to-purple-700 shadow-blue-500/25 hover:shadow-blue-500/40"
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
