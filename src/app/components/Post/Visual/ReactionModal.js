"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function ReactionModal({ emoji, users, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-[#FAFAFA] rounded-xl shadow-lg p-5 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-3 text-center">{emoji} Reactions</h2>
          <ul className="space-y-2 max-h-[300px] overflow-y-auto">
            {users.map((user) => (
              <li key={user._id} className="flex items-center gap-3">
                <Image
                  src={user.profilePic}
                  alt={user.fullName}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium">{user.fullName}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={onClose}
            className="mt-4 block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
