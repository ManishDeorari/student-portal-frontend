"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ZoomLock() {
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Allowed paths for zoom lock
      const allowedPaths = ["/", "/auth/login", "/auth/signup", "/login", "/signup"];
      const isPopupOpen = !!document.getElementById("login-popup-overlay");
      
      // Only lock zoom on specific pages or if the login popup is open
      if (!allowedPaths.includes(pathname) && !isPopupOpen) {
        return;
      }

      // Prevent Ctrl + Plus, Ctrl + Minus, Ctrl + 0
      if (e.ctrlKey && (
        e.key === "=" || 
        e.key === "-" || 
        e.key === "+" || 
        e.key === "0" ||
        e.keyCode === 187 || // =/+
        e.keyCode === 189 || // -/_
        e.keyCode === 107 || // NumPad +
        e.keyCode === 109 || // NumPad -
        e.keyCode === 48     // 0
      )) {
        e.preventDefault();
      }
    };

    const handleWheel = (e) => {
      const allowedPaths = ["/", "/auth/login", "/auth/signup", "/login", "/signup"];
      const isPopupOpen = !!document.getElementById("login-popup-overlay");

      if (!allowedPaths.includes(pathname) && !isPopupOpen) {
        return;
      }

      // Prevent Ctrl + MouseWheel zoom
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("wheel", handleWheel);
    };
  }, [pathname]); // Re-run effect when pathname changes

  return null; // This component doesn't render anything
}
