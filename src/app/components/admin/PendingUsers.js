"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function PendingUsers({
  pendingUsers,
  pendingLoading,
  approveUser,
  deleteUser,
  promoteToAdmin,
  bulkApproveUsers,
  bulkDeleteUsers,
}) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [selected, setSelected] = useState([]);

  // Safety filter
  const safePendingUsers = pendingUsers.filter(u =>
    !u.isMainAdmin &&
    u.email !== "admin@studentportal.com" &&
    u.email !== "manishdeorari377@gmail.com"
  );

  const filterUsers = (role) =>
    pendingUsers.filter(
      (u) =>
        u.role === role &&
        `${u.name} ${u.email} ${u.enrollmentNumber || ""} ${u.employeeId || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
    );

  const student = filterUsers("student");
  const faculty = filterUsers("faculty");

  /* ---------------- SELECTION ---------------- */
  const toggleUser = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (users) => {
    const ids = users.map((u) => u._id);
    const allSelected = ids.every((id) => selected.includes(id));
    setSelected((prev) =>
      allSelected
        ? prev.filter((id) => !ids.includes(id))
        : [...new Set([...prev, ...ids])]
    );
  };

  /* ---------------- BULK ACTIONS ---------------- */
  const bulkApprove = async () => {
    if (bulkApproveUsers) await bulkApproveUsers(selected);
    setSelected([]);
  };

  const bulkReject = async () => {
    if (bulkDeleteUsers) await bulkDeleteUsers(selected);
    setSelected([]);
  };

  const Card = ({ title, users, badgeColor, actions, children }) => (
    <div className="relative p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl overflow-hidden mb-10 transition-all hover:shadow-blue-500/10">
      <div className={`${darkMode ? "bg-black" : "bg-[#FAFAFA]"} rounded-[calc(1.5rem-2px)] overflow-hidden`}>
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-3 sm:py-6 relative">
          <h3 className={`font-extrabold ${darkMode ? "text-white" : "text-slate-900"} text-base sm:text-xl flex items-center gap-2 sm:gap-3`}>
            {title}
            <span className={`text-[11px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${badgeColor}`}>
              {users.length}
            </span>
          </h3>
          <div className="mt-4 sm:mt-0">
            {actions}
          </div>
          {/* Hard Gradient Divider */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
        </div>
        <div className="p-2 sm:p-4">
          {users.length === 0 ? (
            <div className="py-20 text-center">
              <p className={`${darkMode ? "text-white" : "text-slate-900"} font-bold italic`}>No pending requests in this category.</p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div
        key="pending"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2rem] shadow-2xl overflow-hidden">
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 ${darkMode ? "bg-black" : "bg-[#FAFAFA]"} p-4 sm:p-8 rounded-[calc(2rem-2px)] relative overflow-hidden backdrop-blur-xl`}>
            <div className="relative flex-1 max-w-md p-[2px] bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl">
              <div className="relative h-full">
                <input
                  type="text"
                  placeholder="Search by name, email, ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3.5 text-sm sm:text-base ${darkMode ? "bg-black text-white placeholder-white" : "bg-[#FAFAFA] text-black placeholder-slate-400"} rounded-[calc(1rem-2px)] outline-none transition-all font-bold`}
                />
                <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? "text-white" : "text-gray-900"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            <p className={`${darkMode ? "text-blue-400" : "text-blue-600"} text-sm font-black uppercase tracking-widest`}>
              Filtering {pendingUsers.length} total users
            </p>
          </div>
        </div>

        {pendingLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className={`${darkMode ? "text-white" : "text-slate-900"} font-black uppercase tracking-widest text-xs`}>Fetching requests...</p>
          </div>
        ) : (
          <>
            <Card
              title="🎓 Student Requests"
              users={student}
              badgeColor={darkMode ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-green-100 text-green-700 border border-green-200"}
              actions={
                student.length > 0 && (
                  <div className="flex gap-3">
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ type: "bulk-approve", role: "student" })}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95 disabled:opacity-30"
                    >
                      Approve ({selected.length})
                    </button>
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ type: "bulk-delete", role: "student" })}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl text-xs sm:text-sm font-black border border-red-500 transition-all disabled:opacity-30"
                    >
                      Reject
                    </button>
                  </div>
                )
              }
            >
              <Table
                users={student}
                selected={selected}
                toggleUser={toggleUser}
                toggleSelectAll={toggleSelectAll}
                onApprove={(u) => setConfirm({ type: "approve", user: u })}
                onDelete={(u) => setConfirm({ type: "delete", user: u })}
              />
            </Card>

            <Card
              title="🏫 Faculty Requests"
              users={faculty}
              badgeColor={darkMode ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-purple-100 text-purple-700 border border-purple-200"}
              actions={
                faculty.length > 0 && (
                  <div className="flex gap-3">
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ type: "bulk-approve", role: "faculty" })}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95 disabled:opacity-30"
                    >
                      Approve ({selected.length})
                    </button>
                    <button
                      disabled={selected.length === 0}
                      onClick={() => setConfirm({ type: "bulk-delete", role: "faculty" })}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl text-xs sm:text-sm font-black border border-red-500 transition-all disabled:opacity-30"
                    >
                      Reject
                    </button>
                  </div>
                )
              }
            >
              <Table
                users={faculty}
                selected={selected}
                toggleUser={toggleUser}
                toggleSelectAll={toggleSelectAll}
                onApprove={(u) => setConfirm({ type: "approve", user: u })}
                onDelete={(u) => setConfirm({ type: "delete", user: u })}
                onPromote={promoteToAdmin}
              />
            </Card>
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className={`relative ${darkMode ? "bg-black" : "bg-white"} rounded-[calc(2rem-2px)] p-8 h-full w-full overflow-hidden`}>
                <h3 className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"} mb-6 uppercase tracking-tighter`}>
                  {confirm.type.includes("approve") ? "Approve User?" : "Reject User?"}
                </h3>

                {confirm.user && (
                  <div className="relative p-[1.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-8">
                    <div className={`p-6 rounded-[calc(1rem-1.5px)] ${darkMode ? "bg-black" : "bg-white"}`}>
                      <p className={`font-black ${darkMode ? "text-white" : "text-slate-900"} text-2xl mb-1`}>{confirm.user.name}</p>
                      <p className={`${darkMode ? "text-blue-400" : "text-slate-500"} text-xs font-black uppercase tracking-widest truncate`}>{confirm.user.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4 font-black">
                  <button
                    onClick={() => setConfirm(null)}
                    className={`px-8 py-4 ${darkMode ? "bg-white/5 hover:bg-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 text-slate-900"} rounded-2xl transition-all active:scale-95 uppercase text-[10px] tracking-widest`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm.type === "bulk-approve") await bulkApprove();
                      if (confirm.type === "bulk-delete") await bulkReject();
                      if (confirm.type === "approve") await approveUser(confirm.user._id);
                      if (confirm.type === "delete") await deleteUser(confirm.user._id);
                      setConfirm(null);
                    }}
                    className={`px-10 py-4 text-white rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-[10px] tracking-widest ${confirm.type.includes("delete") ? "bg-red-600 hover:bg-red-500 shadow-red-500/25" : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/25"} `}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- TABLE ---------------- */
function Table({ users, selected, toggleUser, toggleSelectAll, onApprove, onDelete, onPromote }) {
  const { darkMode } = useTheme();
  if (users.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Table Headers */}
      <div className={`hidden md:flex items-center gap-4 px-8 py-4 ${darkMode ? "text-white/60" : "text-slate-500"} text-[10px] uppercase font-black tracking-[0.3em]`}>
        <div className="w-12 flex items-center justify-center">
          <input
            type="checkbox"
            className="w-6 h-6 bg-transparent border-2 border-blue-500 rounded cursor-pointer accent-blue-600"
            checked={users.every((u) => selected.includes(u._id))}
            onChange={() => toggleSelectAll(users)}
          />
        </div>
        <div className="w-64">User Profile</div>
        <div className="flex-1">Academic / Staff Details</div>
        <div className="w-40">System ID</div>
        <div className="w-32 text-right">Actions</div>
      </div>

      {/* User Card Rows */}
      {users.map((u) => (
        <div 
          key={u._id} 
          className="relative p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl transition-all hover:scale-[1.01] hover:shadow-blue-500/20"
        >
          <div className={`${darkMode ? "bg-black/40" : "bg-white/80"} rounded-[calc(1.5rem-2px)] p-3 sm:p-5 flex flex-wrap md:flex-nowrap items-center gap-3 sm:gap-4 backdrop-blur-md transition-colors hover:bg-white/5`}>
            {/* Checkbox */}
            <div className="w-12 flex items-center justify-center">
              <input
                type="checkbox"
                className="w-6 h-6 bg-transparent border-2 border-blue-500 rounded cursor-pointer accent-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                checked={selected.includes(u._id)}
                onChange={() => toggleUser(u._id)}
              />
            </div>

            {/* Profile Column */}
            <div className="w-64 flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative shrink-0">
                <div className={`absolute -inset-1 rounded-full blur-[2px] opacity-20 ${u.role === 'student' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                {u.profilePicture ? (
                  <img 
                    src={u.profilePicture} 
                    alt={u.name} 
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover relative z-10 border-2 ${darkMode ? "border-white/10" : "border-white"}`} 
                  />
                ) : (
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full relative z-10 ${darkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"} border-2 border-blue-400/20 flex items-center justify-center font-black text-sm sm:text-lg text-blue-500`}>
                    {u.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className={`font-black text-sm sm:text-[15px] ${darkMode ? "text-white" : "text-slate-900"} truncate mb-0.5`}>{u.name}</p>
                <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${darkMode ? "text-white/40" : "text-slate-500"} truncate`}>{u.email}</p>
              </div>
            </div>

            {/* Academic / Staff Details Column */}
            <div className="flex-1 flex flex-wrap items-center gap-2">
              {u.role === "student" ? (
                <>
                  <span className={`text-[9px] px-2 py-1 rounded-lg font-black bg-white/5 border ${darkMode ? "border-white/10 text-white/60" : "border-gray-200 text-slate-600"}`}>
                    {u.course || "NA"}
                  </span>
                  <span className={`text-[9px] px-2 py-1 rounded-lg font-black bg-blue-500/10 border border-blue-500/20 text-blue-400`}>
                    SEM {u.semester || "NA"}
                  </span>
                  <span className={`text-[9px] px-2 py-1 rounded-lg font-black bg-purple-500/10 border border-purple-500/20 text-purple-400`}>
                    SEC {u.section || "NA"}
                  </span>
                </>
              ) : (
                <>
                  <span className={`text-[9px] px-2 py-1 rounded-lg font-black bg-white/5 border ${darkMode ? "border-white/10 text-white/60" : "border-gray-200 text-slate-600"}`}>
                    {u.position || "NA"}
                  </span>
                  <span className={`text-[9px] px-2 py-1 rounded-lg font-black bg-indigo-500/10 border border-indigo-500/20 text-indigo-400`}>
                    {u.department || "NA"}
                  </span>
                </>
              )}
            </div>

            {/* Identity Column */}
            <div className="w-40 md:block hidden shrink-0">
              <div className={`text-[10px] font-black ${darkMode ? "text-white/60 bg-white/5 border-white/10" : "text-slate-900 bg-gray-50 border-gray-200"} px-4 py-2 rounded-xl border flex items-center justify-center gap-2`}>
                <div className={`w-1.5 h-1.5 rounded-full ${u.role === "student" ? "bg-blue-500" : "bg-purple-500"}`}></div>
                <span className="truncate">{u.enrollmentNumber || u.employeeId || "—"}</span>
              </div>
            </div>

            {/* Actions Column */}
            <div className="w-full md:w-32 flex items-center justify-end gap-2 shrink-0 md:ml-auto mt-2 md:mt-0">
              <button
                onClick={() => onApprove(u)}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-xl active:scale-90"
                title="Approve"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </button>
              <button
                onClick={() => onDelete(u)}
                className="p-2.5 bg-red-600/5 hover:bg-red-600 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all active:scale-90"
                title="Reject"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
