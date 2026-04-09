"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import AdminSidebar from "../components/AdminSidebar";
import ProfileAbout from "../components/profile/ProfileAbout";
import ProfileExperience from "../components/profile/ProfileExperience";
import ProfileEducation from "../components/profile/ProfileEducation";
import ProfileActivity from "../components/profile/ProfileActivity";
import ProfileWorkProfile from "../components/profile/ProfileWorkProfile";
import ProfileJobPreference from "../components/profile/ProfileJobPreference";
import ProfileBasicInfo from "../components/profile/ProfileBasicInfo";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import AuthGuard from "../components/AuthGuard";
import { useNotifications } from "@/context/NotificationContext";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  
  // Transition logic: Prioritize SEO slug in path, fallback to old DB ID if passed via query
  const profileId = params?.publicId || searchParams.get("id"); 
  const { darkMode } = useTheme();
  const { handleDailyLoginPoints } = useNotifications();

  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [isPublicView, setIsPublicView] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setIsAdmin(userData?.isAdmin || userData?.role === "admin");

      // ⚡ OPTIMISTIC HYDRATION: If viewing own profile, show cached data immediately
      const currentUserId = userData._id;
      const targetId = params?.publicId || searchParams.get("id");
      const viewingOther = !!(targetId && targetId !== currentUserId && targetId !== userData.publicId);

      if (!viewingOther) {
        setProfile(prev => ({ ...userData, ...prev }));
        setLoading(false); // Bypass initial spinner for self
      }
    }
  }, [params, searchParams]);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const currentUserId = currentUser?._id;

      // Determine the target user profile to fetch
      const targetId = profileId || currentUserId;
      const viewingOther = !!(profileId && profileId !== currentUserId && profileId !== currentUser?.publicId);
      setIsPublicView(viewingOther);

      // If no ID is available and we don't have a token, then redirect
      if (!targetId && !token) {
        console.warn("[Profile] No targetId or token found.");
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // 1) Define endpoints
      const profileEndpoint = viewingOther
        ? `${API_URL}/api/user/${targetId}`
        : `${API_URL}/api/user/me`;

      const postsEndpoint = viewingOther
        ? `${API_URL}/api/posts?userId=${targetId}&limit=50&type=all`
        : `${API_URL}/api/user/myposts`;

      const activityEndpoint = `${API_URL}/api/user/activity`;

      // ⚡ PARALLEL FETCH: Load everything at once instead of one-by-one
      const [resProfile, resPosts, resActivity] = await Promise.all([
        fetch(profileEndpoint, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(postsEndpoint, { headers: { Authorization: `Bearer ${token}` } }),
        !viewingOther 
          ? fetch(activityEndpoint, { headers: { Authorization: `Bearer ${token}` } })
          : Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      ]);

      if (!resProfile.ok) throw new Error(`Profile fetch failed: ${resProfile.status}`);
      
      const [profileData, postsRaw, activityData] = await Promise.all([
        resProfile.json(),
        resPosts.ok ? resPosts.json() : Promise.resolve([]),
        resActivity.ok ? resActivity.json() : Promise.resolve([])
      ]);
      
      // ✅ Check for daily login reward flag from API
      if (profileData && profileData.loginPointsAwarded) {
        handleDailyLoginPoints(profileData.loginPointsAwarded);
      }

      const postsData = postsRaw.posts || postsRaw;

      setProfile({
        ...profileData,
        posts: Array.isArray(postsData) ? postsData : [],
        activity: Array.isArray(activityData) ? activityData : [],
      });

      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching profile:", error.message);
      setLoading(false);
    }
  }, [profileId, router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white p-4">
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="w-20 h-20 border-4 border-white/10 border-t-white rounded-full animate-spin shadow-2xl shadow-white/10"></div>
        <div className="text-center space-y-2">
            <h2 className="font-black tracking-[0.3em] uppercase text-sm">Synchronizing Data</h2>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Optimizing profile experience...</p>
        </div>
      </div>
    </div>
  );

  const SidebarComponent = isAdmin ? AdminSidebar : Sidebar;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white relative">
      <SidebarComponent />

      {/* 🔷 Top-Left Back Button (Fixed) */}
      {isPublicView && (
        <button
          onClick={() => router.back()}
          className={`fixed top-24 left-8 z-50 flex items-center justify-center p-3 border rounded-xl transition-all backdrop-blur-md group shadow-xl ${darkMode ? 'bg-[#FAFAFA]/10 border-white/20 text-white hover:bg-[#FAFAFA]/20' : 'bg-[#FAFAFA]/20 border-white/30 text-white hover:bg-[#FAFAFA]/30'}`}
          title="Go Back"
        >
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
      )}

      {/* 🔷 Top Profile Section */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="w-full">
          <ProfileBasicInfo
            profile={profile}
            setProfile={setProfile}
            onRefresh={fetchProfile}
            isPublicView={isPublicView}
          />
        </div>
      </div>

      {/* 🔽 Rest Sections */}
      <div className="max-w-4xl mx-auto mt-6 space-y-6 pb-10">
        <ProfileAbout profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        <ProfileEducation profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        <ProfileExperience profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        {!isPublicView && <ProfileActivity profile={profile} setProfile={setProfile} isPublicView={isPublicView} />}
        <ProfileWorkProfile profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        <ProfileJobPreference profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white p-4">
          <div className="flex flex-col items-center gap-6 animate-pulse">
            <div className="w-20 h-20 border-4 border-white/10 border-t-white rounded-full animate-spin shadow-2xl shadow-white/10"></div>
            <div className="text-center space-y-2">
                <h2 className="font-black tracking-[0.3em] uppercase text-sm">Authenticating Route...</h2>
            </div>
          </div>
        </div>
      }>
        <ProfileContent />
      </Suspense>
    </AuthGuard>
  );
}
