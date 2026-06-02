"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";

const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour of inactivity
const CHECK_INTERVAL_MS = 60 * 1000;    // Check every 60 seconds
const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/signup"];

// Decodes a JWT payload without verification (safe for expiry checking on client)
function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null; // convert to ms
  } catch {
    return null;
  }
}

export default function SessionManager() {
  const router = useRouter();
  const pathname = usePathname();
  const lastActivityRef = useRef(Date.now());
  const checkIntervalRef = useRef(null);

  const logout = useCallback((reason = "session") => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("local-auth-change"));

    if (reason === "idle") {
      toast.error("⏱ You were logged out due to inactivity.", {
        duration: 5000,
        style: { background: "#1e293b", color: "#f87171", border: "1px solid #f8717133" },
      });
    } else if (reason === "expired") {
      toast.error("🔒 Session expired. Please log in again.", {
        duration: 5000,
        style: { background: "#1e293b", color: "#f87171", border: "1px solid #f8717133" },
      });
    } else if (reason === "another_device") {
      toast.error("🚫 You were logged in from another device.", {
        duration: 6000,
        style: { background: "#1e293b", color: "#f87171", border: "1px solid #f8717133" },
      });
    }

    router.push("/auth/login");
  }, [router]);

  // Reset activity timer on user interaction
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    // Don't run session checks on public routes
    const isPublic = PUBLIC_ROUTES.includes(pathname);
    const token = localStorage.getItem("token");

    if (isPublic || !token) return;

    // Attach activity listeners
    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll", "click"];
    events.forEach((e) => window.addEventListener(e, resetActivity, { passive: true }));

    // Set up interval to check idle + token expiry
    checkIntervalRef.current = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) return; // Already logged out

      // 1. Check token expiry
      const expiry = getTokenExpiry(currentToken);
      if (expiry && Date.now() >= expiry) {
        logout("expired");
        return;
      }

      // 2. Check idle timeout
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs >= IDLE_TIMEOUT_MS) {
        logout("idle");
        return;
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetActivity));
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [pathname, logout, resetActivity]);

  // Global 401 interceptor using fetch override
  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.includes(pathname);
    if (isPublic) return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        const token = localStorage.getItem("token");
        if (token) {
          // Clone so body can be read (in case the caller also reads it)
          const cloned = response.clone();
          const data = await cloned.json().catch(() => ({}));
          const msg = data?.message || "";
          const reason = msg.includes("another device") || msg.includes("Session expired or")
            ? "another_device"
            : "expired";
          logout(reason);
        }
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [pathname, logout]);

  return null;
}
