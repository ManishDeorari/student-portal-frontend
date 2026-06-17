"use client";
import React, { useState, useEffect } from "react";
import GlobalSearchModal from "./GlobalSearchModal";
import { useTheme } from "@/context/ThemeContext";
import dynamic from "next/dynamic";

const SearchPostViewer = dynamic(() => import("./SearchPostViewer"), { ssr: false });

export default function GlobalSearchWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    // Only available to logged in users
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);

    const u = localStorage.getItem("user");
    if (u) setCurrentUser(JSON.parse(u));

    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    
    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("openGlobalSearch", handleCustomOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("openGlobalSearch", handleCustomOpen);
    };
  }, []);

  if (!token) return null;

  return (
    <>


      <GlobalSearchModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onPostSelect={(post) => {
          setSelectedPost(post);
          setIsOpen(false); // close search first
        }}
        darkMode={darkMode} 
        token={token} 
      />

      {/* SearchPostViewer — uses PostCard internally, so all hooks/state are self-contained */}
      {selectedPost && (
        <SearchPostViewer
          post={selectedPost}
          currentUser={currentUser}
          darkMode={darkMode}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  );
}
