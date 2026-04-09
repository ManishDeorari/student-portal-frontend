"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaHome, FaUserFriends, FaBell, FaUserCircle, FaEnvelope, FaUserShield, FaCog, FaSignOutAlt, FaKey, FaUsers } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import ResetPasswordModal from "./ResetPasswordModal";
import SettingsDrawer from "./SettingsDrawer";
import NotificationPreview from "./NotificationPreview";
import { useNotifications } from "@/context/NotificationContext";
import { AnimatePresence } from "framer-motion";

export default function AdminSidebar() {
  const { 
    unreadCount, 
    notifications, 
    pendingRequestsCount, 
    unreadGroupMessagesCount, 
    newPostsCount, 
    adminSignupRequestsCount,
    markSectionAsSeen
  } = useNotifications();

  const [showSettings, setShowSettings] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showNotifPreview, setShowNotifPreview] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  
  const fetchUser = React.useCallback(async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        localStorage.setItem("user", JSON.stringify(userData));
        return userData;
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
    return null;
  }, [API_URL]);

  React.useEffect(() => {
    const initialize = async () => {
      let user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      if (!token) return;

      if (!user) {
        user = await fetchUser(token);
      }
    };

    initialize();
  }, [fetchUser]);

  const handleSignout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("local-auth-change"));
    router.push("/auth/login");
  };

  return (
    <>
      {/* Top Navbar - Desktop */}
      <nav className="hidden md:flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-4 shadow-md sticky top-0 z-50">
        <div className="text-2xl font-bold">Alumni Portal</div>
        <div className="flex space-x-8 items-center text-2xl">
          <Link href="/dashboard/admin" onClick={() => markSectionAsSeen("admin-requests")} className="hover:text-gray-200 relative group" title="Admin Panel">
            <FaUserShield className="transition-colors" />
            {adminSignupRequestsCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>}
          </Link>
          <Link href="/dashboard" onClick={() => markSectionAsSeen("home")} className="hover:text-gray-200 relative group" title="Home">
            <FaHome className="transition-colors" />
            {newPostsCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
          </Link>
          <Link href="/dashboard/network" onClick={() => markSectionAsSeen("network")} className="hover:text-gray-200 relative group" title="Network">
            <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors">
              <path d="M6.5 8.75V12.25L10 14.5L13.5 12.25V8.75L10 6.5L6.5 8.75ZM6.5 8.75L3.813 6.18M17.696 18.815L11.728 13.389M18.5 10.5H13.5M7.952 13.184L3.682 17.739M16.318 4.261L12.632 8.192M4.5 5.75L2.5 7L0.5 5.75V3.75L2.5 2.5L4.5 3.75V5.75ZM19.5 3.75L17.5 5L15.5 3.75V1.75L17.5 0.5L19.5 1.75V3.75ZM4.5 20.25L2.5 21.5L0.5 20.25V18.25L2.5 17L4.5 18.25V20.25ZM21 21.25L19 22.5L17 21.25V19.25L19 18L21 19.25V21.25ZM22.5 11.5L20.5 12.75L18.5 11.5V9.5L20.5 8.25L22.5 9.5V11.5Z" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {pendingRequestsCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
          </Link>
          <Link href="/dashboard/groups" onClick={() => markSectionAsSeen("groups")} className="hover:text-gray-200 relative group" title="Groups">
            <FaUsers className="transition-colors" />
            {unreadGroupMessagesCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
          </Link>
          <div
            className="relative group"
            onMouseEnter={() => pathname !== "/dashboard/notifications" && setShowNotifPreview(true)}
            onMouseLeave={() => setShowNotifPreview(false)}
          >
            <Link href="/dashboard/notifications" className="hover:text-gray-200 block" title="Notifications">
              <FaBell className="transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </Link>
            <AnimatePresence>
              {showNotifPreview && (
                <NotificationPreview
                  notifications={notifications}
                  darkMode={true}
                />
              )}
            </AnimatePresence>
          </div>
          <Link href="/profile" className="hover:text-gray-200 relative group" title="Profile">
            <FaUserCircle />
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowSettings(true)}
              className="hover:text-gray-200 relative group pt-1"
              title="Settings"
            >
              <FaCog className={showSettings ? "rotate-90 transition-transform duration-300" : "transition-transform duration-300"} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="flex md:hidden justify-between items-center bg-gradient-to-r from-blue-600 to-purple-700 text-white px-5 py-3 shadow-md sticky top-0 z-50">
        <div className="text-xl font-bold">Alumni Portal (Admin)</div>
        <button onClick={() => setShowSettings(true)} className="text-2xl pt-1">
          <FaCog className={showSettings ? "rotate-90 transition-transform duration-300" : "transition-transform duration-300"} />
        </button>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FAFAFA] dark:bg-[#121213] border-t border-gray-200 dark:border-white/10 px-4 py-2 z-50 flex justify-between items-center text-2xl text-gray-500 dark:text-gray-400 safe-bottom">
        <Link href="/dashboard" onClick={() => markSectionAsSeen("home")} className={`${pathname === "/dashboard" ? "text-blue-600 dark:text-blue-400" : ""} relative tap-target active:scale-90 transition-transform`}>
          <FaHome className="" />
          {newPostsCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
        </Link>
        <Link href="/dashboard/network" onClick={() => markSectionAsSeen("network")} className={`${pathname === "/dashboard/network" ? "text-blue-600 dark:text-blue-400" : ""} relative tap-target active:scale-90 transition-transform`}>
          <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg" className="">
            <path d="M6.5 8.75V12.25L10 14.5L13.5 12.25V8.75L10 6.5L6.5 8.75ZM6.5 8.75L3.813 6.18M17.696 18.815L11.728 13.389M18.5 10.5H13.5M7.952 13.184L3.682 17.739M16.318 4.261L12.632 8.192M4.5 5.75L2.5 7L0.5 5.75V3.75L2.5 2.5L4.5 3.75V5.75ZM19.5 3.75L17.5 5L15.5 3.75V1.75L17.5 0.5L19.5 1.75V3.75ZM4.5 20.25L2.5 21.5L0.5 20.25V18.25L2.5 17L4.5 18.25V20.25ZM21 21.25L19 22.5L17 21.25V19.25L19 18L21 19.25V21.25ZM22.5 11.5L20.5 12.75L18.5 11.5V9.5L20.5 8.25L22.5 9.5V11.5Z" stroke="currentColor" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {pendingRequestsCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
        </Link>
        <Link href="/dashboard/groups" onClick={() => markSectionAsSeen("groups")} className={`${pathname === "/dashboard/groups" ? "text-blue-600 dark:text-blue-400" : ""} relative tap-target active:scale-90 transition-transform`}>
          <FaUsers className="" />
          {unreadGroupMessagesCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
        </Link>
        <Link href="/dashboard/notifications" className={`${pathname === "/dashboard/notifications" ? "text-blue-600 dark:text-blue-400" : ""} relative tap-target active:scale-90 transition-transform`}>
          <FaBell className="" />
          {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
        </Link>
        <Link href="/dashboard/admin" onClick={() => markSectionAsSeen("admin-requests")} className={`${pathname.startsWith("/dashboard/admin") ? "text-orange-500" : ""} relative tap-target active:scale-90 transition-transform`}>
          <FaUserShield />
          {adminSignupRequestsCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
        </Link>
        <Link href="/profile" className={`${pathname === "/profile" ? "text-blue-600 dark:text-blue-400" : ""} tap-target active:scale-90 transition-transform`}>
          <FaUserCircle />
        </Link>
      </nav>

      <SettingsDrawer
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onResetPassword={() => setShowResetModal(true)}
        onSignout={handleSignout}
      />
      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
      />
    </>
  );
}
