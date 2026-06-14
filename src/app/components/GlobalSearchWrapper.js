"use client";
import React, { useState, useEffect } from "react";
import GlobalSearchModal from "./GlobalSearchModal";
import { useTheme } from "@/context/ThemeContext";

export default function GlobalSearchWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    // Only available to logged in users
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);

    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!token) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-2xl transition-transform hover:scale-110 md:hidden ${darkMode ? "bg-slate-800 text-white" : "bg-white text-black"}`}
        aria-label="Search"
      >
        🔍
      </button>
      <GlobalSearchModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        darkMode={darkMode} 
        token={token} 
      />
    </>
  );
}
