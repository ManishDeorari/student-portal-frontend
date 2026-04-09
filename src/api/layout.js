"use client";

import Sidebar from "../components/Sidebar";
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-600 to-purple-700 text-white">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-blue-700 to-purple-700 shadow-md">
        <Sidebar />
      </div>

      {/* Page Content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
