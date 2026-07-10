"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import AdminSidebar from "../components/AdminSidebar";
import ProfileAbout from "../components/profile/ProfileAbout";
import ProfileExperience from "../components/profile/ProfileExperience";
import ProfileCertificates from "../components/profile/ProfileCertificates";
import ProfileProjects from "../components/profile/ProfileProjects";
import ProfilePapers from "../components/profile/ProfilePapers";
import ProfileAchievements from "../components/profile/ProfileAchievements";
import ProfileLanguages from "../components/profile/ProfileLanguages";
import ProfileSkills from "../components/profile/ProfileSkills";
import ProfileEducation from "../components/profile/ProfileEducation";
import ProfileActivity from "../components/profile/ProfileActivity";
import ProfileEventParticipation from "../components/profile/ProfileEventParticipation";
import ProfileResumeAndLinks from "../components/profile/ProfileResumeAndLinks";
import ProfileBasicInfo from "../components/profile/ProfileBasicInfo";
import ProfileActivityHeatmap from "../components/profile/ProfileActivityHeatmap";
import ProfileFeatured from "../components/profile/ProfileFeatured";
import ProfileSpotlights from "../components/profile/ProfileSpotlights";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import AuthGuard from "../components/AuthGuard";
import { useNotifications } from "@/context/NotificationContext";
import { GooeyGradientBackground } from "../components/GooeyGradientBackground";

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

      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      // 1) Define endpoints
      const profileEndpoint = viewingOther
        ? `${API_URL}/api/user/${targetId}`
        : `${API_URL}/api/user/me`;

      const postsEndpoint = viewingOther
        ? `${API_URL}/api/posts?userId=${targetId}&limit=50&type=all`
        : `${API_URL}/api/user/myposts`;

      const activityEndpoint = `${API_URL}/api/user/activity`;
      const eventsEndpoint = viewingOther 
        ? `${API_URL}/api/user/${targetId}/events`
        : `${API_URL}/api/user/me/events`;

      // ⚡ PARALLEL FETCH: Load everything at once instead of one-by-one
      const [resProfile, resPosts, resActivity, resEvents] = await Promise.all([
        fetch(profileEndpoint, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(postsEndpoint, { headers: { Authorization: `Bearer ${token}` } }),
        !viewingOther 
          ? fetch(activityEndpoint, { headers: { Authorization: `Bearer ${token}` } })
          : Promise.resolve({ ok: true, json: () => Promise.resolve([]) }),
        fetch(eventsEndpoint, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!resProfile.ok) throw new Error(`Profile fetch failed: ${resProfile.status}`);
      
      const [profileData, postsRaw, activityData, eventsData] = await Promise.all([
        resProfile.json(),
        resPosts.ok ? resPosts.json() : Promise.resolve([]),
        resActivity.ok ? resActivity.json() : Promise.resolve([]),
        resEvents.ok ? resEvents.json() : Promise.resolve({ participatedEvents: [], wonEvents: [] })
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
        events: eventsData || { participatedEvents: [], wonEvents: [] }
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
    <GooeyGradientBackground className="min-h-screen text-white flex items-center justify-center p-4" darkMode={true}>
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="w-20 h-20 border-4 border-white/10 border-t-white rounded-full animate-spin shadow-2xl shadow-white/10"></div>
        <div className="text-center space-y-2">
            <h2 className="font-black tracking-[0.3em] uppercase text-sm">Synchronizing Data</h2>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Optimizing profile experience...</p>
        </div>
      </div>
    </GooeyGradientBackground>
  );

  const SidebarComponent = isAdmin ? AdminSidebar : Sidebar;

  return (
    <GooeyGradientBackground className="min-h-screen text-white profile-mobile-scale" darkMode={darkMode}>
      <SidebarComponent />

      {/* 🔷 Top Profile Section */}
      <div className="max-w-4xl mx-auto px-1 sm:px-4 lg:px-8 pt-6">
        {/* Back button has been moved into ProfileBasicInfo for public view */}
        <div className="w-full">
          <ProfileBasicInfo
            profile={profile}
            setProfile={setProfile}
            onRefresh={fetchProfile}
            isPublicView={isPublicView}
          />

            {/* Activity Heatmap */}
            <div className="mt-8">
              <ProfileActivityHeatmap profile={profile} />
            </div>
          <ProfileFeatured 
            user={profile} 
            isPublicView={isPublicView} 
            onUpdate={setProfile} 
          />
        </div>
      </div>

      {/* 🔽 Rest Sections */}
      <div className="max-w-4xl mx-auto px-1 sm:px-4 lg:px-8 mt-6 sm:mt-10 mb-20 space-y-8 pb-32">
        {(profile.role === "student" || profile.role === "alumni") && (
          <ProfileSpotlights userId={profile._id} currentUser={user} darkMode={darkMode} />
        )}
        <ProfileAbout profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        <ProfileEducation profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        <ProfileExperience profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        <ProfileCertificates profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        <ProfileProjects profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        <ProfilePapers profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        {(profile.role === "student" || profile.role === "alumni") && (
          <ProfileResumeAndLinks profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        )}
        <ProfileSkills profile={profile} setProfile={setProfile} isPublicView={isPublicView} currentUserId={user?._id} />
        <ProfileAchievements profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        <ProfileLanguages profile={profile} setProfile={setProfile} isPublicView={isPublicView} />
        <ProfileActivity profile={profile} setProfile={setProfile} isPublicView={isPublicView} currentUser={user} />
        {(profile.role === "student" || profile.role === "alumni") && (
          <ProfileEventParticipation profile={profile} setProfile={setProfile} isPublicView={isPublicView} currentUser={user} />
        )}
      </div>
    </GooeyGradientBackground>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <GooeyGradientBackground className="min-h-screen text-white flex items-center justify-center p-4" darkMode={true}>
          <div className="flex flex-col items-center gap-6 animate-pulse">
            <div className="w-20 h-20 border-4 border-white/10 border-t-white rounded-full animate-spin shadow-2xl shadow-white/10"></div>
            <div className="text-center space-y-2">
                <h2 className="font-black tracking-[0.3em] uppercase text-sm">Authenticating Route...</h2>
            </div>
          </div>
        </GooeyGradientBackground>
      }>
        <ProfileContent />
      </Suspense>
    </AuthGuard>
  );
}
