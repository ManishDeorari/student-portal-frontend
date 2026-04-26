"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar"; // adjust path if needed
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Shield, Users, Trophy, Download, Settings, Clock } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import PendingUsers from "../../components/admin/PendingUsers";
import AdminsManager from "../../components/admin/AdminsManager";
import Leaderboard from "../../components/Leaderboard";
import PointsSystemManagement from "../../components/admin/PointsSystemManagement";
import StudentExport from "../../components/admin/StudentExport";
import UserManagement from "../../components/admin/UserManagement";
import { useTheme } from "@/context/ThemeContext";
import { GooeyGradientBackground } from "../../components/GooeyGradientBackground";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminDashboardPage() {
  const router = useRouter();

  const { darkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("pending"); // pending | admins | leaderboard | points | export | users
  const [loading, setLoading] = useState(true);

  // Pending users
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  // Admins / Faculty list
  const [adminsList, setAdminsList] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // All Users (for User Management)
  const [allUsers, setAllUsers] = useState([]);
  const [allUsersLoading, setAllUsersLoading] = useState(false);

  const getToken = () => localStorage.getItem("token");

  // Fetch current user & protect admin routes
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = getToken();
      if (!token) return;
      try {
        // ⚡ INSTANT LOAD: Hydrate UI immediately from valid cache
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          if (parsed.isAdmin || parsed.role === "admin") {
            setUser(parsed);
            setLoading(false);
          }
        }

        const res = await fetch(`${API}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Unauthorized");
        
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data)); // Refresh cache silently

        if (!data.isAdmin) {
          toast.error("Access denied — admin only");
          router.push("/dashboard");
          return;
        }
      } catch (err) {
        console.error("fetch current user error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, [router]);

  // Fetch helpers
  const fetchPendingUsers = React.useCallback(async () => {
    setPendingLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/pending-users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch pending users");
      setPendingUsers(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not load pending users");
    } finally {
      setPendingLoading(false);
    }
  }, []);

  const fetchAdminsList = React.useCallback(async () => {
    setAdminsLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/admins`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        console.warn("GET /api/admin/admins:", txt);
        setAdminsList([]);
        return;
      }
      const data = await res.json();
      setAdminsList(data);
    } catch (err) {
      console.error(err);
      setAdminsList([]);
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  const fetchLeaderboard = React.useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/leaderboard`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch leaderboard");
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not load leaderboard");
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  const fetchAllUsers = React.useCallback(async () => {
    setAllUsersLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/all-users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch all users");
      setAllUsers(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not load all users");
    } finally {
      setAllUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    // 🛡️ RBAC: If a normal admin somehow lands on a restricted tab, reset to pending
    const restrictedTabs = ["users", "admins", "points"];
    if (user && !user.isMainAdmin && restrictedTabs.includes(activeTab)) {
      setActiveTab("pending");
      return;
    }

    if (activeTab === "pending") fetchPendingUsers();
    if (activeTab === "admins" && user?.isMainAdmin) fetchAdminsList();
    if (activeTab === "leaderboard") fetchLeaderboard();
    if (activeTab === "users" && user?.isMainAdmin) fetchAllUsers();
  }, [activeTab, fetchAdminsList, fetchLeaderboard, fetchPendingUsers, fetchAllUsers, user]);

  // Actions
  const approveUser = async (id) => {
    try {
      const res = await fetch(`${API}/api/admin/approve/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Approve failed");
      toast.success(data.message || "Approved");
      fetchPendingUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Approve failed");
    }
  };

  const deleteUser = async (id, isBulk = false) => {
    try {
      const res = await fetch(`${API}/api/admin/delete-user/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      if (!isBulk) {
        toast.success(data.message || "User deleted");
        fetchPendingUsers();
        fetchAdminsList();
        fetchLeaderboard();
        fetchAllUsers();
      }
    } catch (err) {
      console.error(err);
      if (!isBulk) toast.error(err.message || "Delete failed");
      throw err;
    }
  };

  const bulkApproveUsers = async (ids) => {
    try {
      await Promise.all(ids.map(id =>
        fetch(`${API}/api/admin/approve/${id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${getToken()}` },
        }).then(r => r.json().then(d => { if (!r.ok) throw new Error(d.message); }))
      ));
      toast.success(`Successfully approved ${ids.length} users!`, { autoClose: 2000 });
      fetchPendingUsers();
    } catch (err) {
      toast.error("Some approvals failed. Please check list.");
      fetchPendingUsers();
    }
  };

  const bulkDeleteUsers = async (ids) => {
    if (!ids || ids.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/delete-users-bulk`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ userIds: ids })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Bulk delete failed");
      
      toast.success(`Successfully deleted ${data.summary.successful} users!`, { duration: 4000 });
      if (data.summary.failed > 0) {
        toast.error(`${data.summary.failed} deletions failed.`, { duration: 4000 });
      }

      fetchPendingUsers();
      fetchAdminsList();
      fetchLeaderboard();
      fetchAllUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Bulk deletion failed.");
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (id) => {
    try {
      const res = await fetch(`${API}/api/admin/make-admin/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Promote failed");
      toast.success(data.message || "Promoted to admin");
      fetchAdminsList();
      fetchPendingUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Promote failed");
    }
  };

  const demoteAdmin = async (id) => {
    const target = adminsList.find(u => u._id === id);
    if (target?.isMainAdmin) {
      toast.error("Cannot demote the Main Admin!");
      return;
    }

    try {
      const res = await fetch(`${API}/api/admin/remove-admin/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Demote failed");
      toast.success(data.message || "Demoted");
      fetchAdminsList();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Demote failed");
    }
  };

  const TabButton = ({ id, label }) => {
    const isActive = activeTab === id;
    return (
      <div className={`p-[2px] rounded-2xl transition-all duration-500 ${isActive ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-xl shadow-blue-500/10" : "bg-transparent"}`}>
        <button
          onClick={() => setActiveTab(id)}
          className={`px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-[calc(1rem-2px)] transition-all duration-300 font-black text-[9px] sm:text-[10px] uppercase tracking-wider ${isActive
            ? `${darkMode ? "bg-black text-white" : "bg-white text-blue-600"}`
            : `${darkMode ? "bg-white/5 text-white hover:bg-white/10" : "bg-black/5 text-slate-900 hover:bg-black/10"} border-2 border-transparent`
            }`}
        >
          {label}
        </button>
      </div>
    );
  };

  if (loading) return (
    <div className={`min-h-screen ${darkMode ? "bg-slate-950" : "bg-gradient-to-br from-blue-600 to-purple-700"} flex flex-col items-center justify-center gap-4 text-white`}>
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      <p className="font-black uppercase tracking-widest text-xs opacity-50">Initializing Admin Panel</p>
    </div>
  );

  // Choose sidebar
  const SidebarComponent = user?.isAdmin || user?.role === 'admin' ? AdminSidebar : Sidebar;

  return (
    <GooeyGradientBackground className="min-h-screen text-white" darkMode={darkMode}>
      <SidebarComponent />

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 relative z-10 space-y-4 sm:space-y-6 pb-24 md:pb-6">
        {/* Header & Tabs */}
        <div className="relative p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl overflow-hidden">
          <section className={`${darkMode ? "bg-black" : "bg-[#FAFAFA]"} p-4 sm:p-5 md:p-6 rounded-[calc(1.5rem-1px)] relative overflow-hidden animate-in fade-in duration-700`}>
            <div className="flex flex-col xl:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border-2 border-blue-400/30 shadow-2xl">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-left">
                  <h1 className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"} leading-none`}>Admin Panel</h1>
                  <p className={`${darkMode ? "text-white" : "text-slate-900"} text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mt-1 sm:mt-2`}>
                    Master Control Center
                  </p>
                </div>
              </div>

              <div className="p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[1.6rem] shadow-lg w-full xl:w-auto">
              <nav className={`flex items-center gap-1 ${darkMode ? "bg-black" : "bg-white"} p-1 rounded-[1.5rem] overflow-x-auto no-scrollbar w-full flex-nowrap`}>
                  <TabButton id="pending" label="Pending" />
                  {user?.isMainAdmin && <TabButton id="users" label="Users" />}
                  {user?.isMainAdmin && <TabButton id="admins" label="Admins" />}
                  <TabButton id="leaderboard" label="Rankings" />
                  <TabButton id="export" label="Export" />
                  {user?.isMainAdmin && <TabButton id="points" label="Points" />}
                </nav>
              </div>
            </div>
          </section>
        </div>

        <section className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
          {/* MANAGE ReEQUEST */}
          {activeTab === "pending" && (
            <PendingUsers
              pendingUsers={pendingUsers}
              pendingLoading={pendingLoading}
              approveUser={approveUser}
              deleteUser={deleteUser}
              promoteToAdmin={promoteToAdmin}
              bulkApproveUsers={bulkApproveUsers}
              bulkDeleteUsers={bulkDeleteUsers}
            />
          )}

          {/* USER MANAGEMENT */}
          {activeTab === "users" && user?.isMainAdmin && (
            <UserManagement
              users={allUsers}
              loading={allUsersLoading}
              onDelete={deleteUser}
              onBulkDelete={bulkDeleteUsers}
              onRefresh={fetchAllUsers}
            />
          )}

          {/* MANAGE ADMINS */}
          {activeTab === "admins" && user?.isMainAdmin && (
            <AdminsManager
              adminsList={adminsList}
              adminsLoading={adminsLoading}
              promoteToAdmin={promoteToAdmin}
              demoteAdmin={demoteAdmin}
              deleteUser={deleteUser}
            />
          )}

          {/* LEADERBOARD */}
          {activeTab === "leaderboard" && (
            <Leaderboard
              currentYearData={leaderboard.filter(u => u.year === "current")}
              lastYearData={leaderboard.filter(u => u.year === "last")}
              loading={leaderboardLoading}
            />
          )}

          {/* POINTS SYSTEM */}
          {activeTab === "points" && user?.isMainAdmin && (
            <PointsSystemManagement user={user} />
          )}

          {/* STUDENT EXPORT */}
          {activeTab === "export" && (
            <StudentExport />
          )}


        </section>
      </main>
    </GooeyGradientBackground>
  );
}
