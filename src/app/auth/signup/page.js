"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    enrollmentNumber: "",
    role: "alumni", // default
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Prepare body according to role
    const body =
      form.role === "faculty"
        ? {
          name: form.name,
          email: form.email,
          password: form.password,
          role: "faculty",
          employeeId: form.enrollmentNumber, // mapping faculty field to employeeId
        }
        : {
          name: form.name,
          email: form.email,
          password: form.password,
          role: "alumni",
          enrollmentNumber: form.enrollmentNumber,
        };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // ✅ Pre-flight: Ping the health endpoint to wake the server (fire-and-forget)
    const wakeServer = async () => {
      try {
        await fetch(`${apiUrl}/api/health`, { method: "GET", mode: "cors" });
      } catch {
        // Expected to fail on cold start — the ping itself wakes Render
      }
    };

    const RETRY_DELAYS = [4000, 8000, 15000, 20000, 25000]; // Escalating delays for cold start (total ~72s)

    const attemptSignup = async (retryCount = 0) => {
      try {
        const res = await fetch(
          `${apiUrl}/api/auth/signup`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Signup failed");

        setLoading(false);
        setShowSuccess(true);
      } catch (err) {
        // ✅ If network/server error (cold start / server sleeping), retry with escalating delays
        const isNetworkError = err.name === "TypeError" || err.message?.includes("fetch") || err.message?.includes("Failed");
        if (isNetworkError && retryCount < RETRY_DELAYS.length) {
          const delay = RETRY_DELAYS[retryCount];
          const seconds = Math.round(delay / 1000);
          console.warn(`⚠️ Server may be waking up. Retry ${retryCount + 1}/${RETRY_DELAYS.length} in ${seconds}s...`);
          setError(`Server is starting up... retrying in ${seconds}s (attempt ${retryCount + 1}/${RETRY_DELAYS.length})`);
          
          wakeServer();
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptSignup(retryCount + 1);
        }

        const userMessage = isNetworkError
          ? "Server is currently unavailable. Please try again in a minute."
          : (err.message || "Something went wrong");
        setError(userMessage);
        setLoading(false);
      }
    };

    // Fire initial wake ping, then attempt signup
    wakeServer();
    await attemptSignup();
  };



  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden px-4 sm:px-8 pb-32 sm:pb-0 transition-colors duration-500 text-white`}>
      <LoadingOverlay isVisible={loading} message="Creating Account..." />
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2 max-w-[500px] lg:pl-16 mt-8 sm:mt-12 lg:mt-0 mb-8"
        >
          <div className="p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2.5rem] shadow-2xl relative">
            <div className={`${darkMode ? "bg-[#0f172a]/95 text-white" : "bg-[#FAFAFA] text-gray-900"} backdrop-blur-2xl rounded-[calc(2.5rem-2.5px)] py-4 px-5 sm:px-8 md:py-5 md:px-10 space-y-3 relative overflow-hidden transition-all duration-500`}>
              <div className="space-y-0.5 text-center">
                <h2 className={`text-2xl sm:text-3xl font-black ${darkMode ? "text-white" : "text-black"} tracking-tight`}>Join Global Network</h2>
                <p className={`text-xs sm:text-sm ${darkMode ? "text-white font-bold" : "text-black font-bold"} opacity-70`}>Create account to connect with fellow alumni</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`${darkMode ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-red-50 border-red-100 text-red-600"} border text-[10px] py-2 px-4 rounded-xl text-center font-black`}
                  >
                    {error}
                  </motion.div>
                )}

                {/* Role Selector */}
                <div className="flex justify-center gap-8 py-0.5">
                  {["alumni", "faculty"].map((r) => (
                    <label key={r} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="role"
                          value={r}
                          checked={form.role === r}
                          onChange={handleChange}
                          className="peer hidden"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${darkMode ? "border-white/20 peer-checked:border-blue-500" : "border-gray-300 peer-checked:border-blue-600"}`}></div>
                        <div className={`absolute inset-1 rounded-full scale-0 peer-checked:scale-100 transition-transform ${darkMode ? "bg-blue-500" : "bg-blue-600"}`}></div>
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest font-black transition-colors ${form.role === r ? (darkMode ? "text-blue-400" : "text-blue-600") : (darkMode ? "text-white" : "text-black")}`}>
                        {r}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <div className="space-y-0.5">
                    <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Full Name</label>
                    <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm">
                      <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={handleChange}
                        className={`w-full px-4 sm:px-6 py-2.5 rounded-[calc(1rem-1.5px)] outline-none text-sm ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>
                      {form.role === "faculty" ? "Employee ID" : "Enrollment No."}
                    </label>
                    <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm">
                      <input
                        type="text"
                        name="enrollmentNumber"
                        placeholder={form.role === "faculty" ? "Ex: Emp-123" : "Ex: 2021001"}
                        value={form.enrollmentNumber}
                        onChange={handleChange}
                        className={`w-full px-4 sm:px-6 py-2.5 rounded-[calc(1rem-1.5px)] outline-none text-sm ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Email Address</label>
                    <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm">
                      <input
                        type="email"
                        name="email"
                        placeholder="john@univ.edu"
                        value={form.email}
                        onChange={handleChange}
                        className={`w-full px-4 sm:px-6 py-2.5 rounded-[calc(1rem-1.5px)] outline-none text-sm ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Password</label>
                    <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm">
                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        className={`w-full px-4 sm:px-6 py-2.5 rounded-[calc(1rem-1.5px)] outline-none text-sm ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group p-[2px] bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-500 group-hover:to-purple-500 py-3 sm:py-4 w-full h-full rounded-[calc(1rem-2px)] flex items-center justify-center transition-all">
                    <span className="text-white font-black text-xs uppercase tracking-widest">
                      {loading ? "Creating Account..." : "Join Portal"}
                    </span>
                  </div>
                </button>

                <p className={`text-sm text-center ${darkMode ? "text-white font-bold" : "text-black font-bold"}`}>
                  Already a member?{" "}
                  <Link href="/auth/login" className="text-blue-500 font-extrabold hover:underline underline-offset-4">
                    Login
                  </Link>
                </p>
              </form>

              {/* Back to Home Inside the Div */}
              <div className="pt-3 border-t border-white/5 text-center">
                <div className="p-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full inline-block group transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <Link
                    href="/"
                    className={`flex items-center gap-2.5 px-8 py-2.5 rounded-full transition-all duration-300 font-black ${darkMode
                      ? "bg-[#0f172a] text-white hover:bg-black"
                      : "bg-white text-slate-900 hover:bg-gray-50"
                      }`}
                  >
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      whileHover={{ x: -4 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </motion.svg>
                    <span className="text-[10px] uppercase tracking-[0.25em] italic">
                      Return to Home
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Header Content on the Right */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full lg:w-1/2 text-center lg:text-right hidden lg:block"
        >
          <h1 className="text-9xl xl:text-[10rem] font-black text-white tracking-tighter drop-shadow-2xl leading-[0.85] opacity-90">
            Alumni Portal
          </h1>
          <p className="text-white/80 mt-6 font-medium text-xl xl:text-2xl max-w-[600px] ml-auto">
            Build lifelong connections, share opportunities, and keep the university spirit alive.
          </p>
          <div className="mt-8 flex justify-end gap-4">
            <div className="w-12 h-1.5 bg-[#FAFAFA] rounded-full opacity-20"></div>
            <div className="w-12 h-1.5 bg-blue-400 rounded-full"></div>
            <div className="w-12 h-1.5 bg-[#FAFAFA] rounded-full opacity-20"></div>
          </div>
        </motion.div>

        {/* Mobile Header (Shows above form on small screens) */}
        <div className="lg:hidden text-center mb-0 order-first">
          <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
            Alumni Portal
          </h1>
          <p className="text-white/70 mt-2 font-medium text-sm">Reconnect. Network. Grow.</p>
        </div>
      </div>

      {/* Theme Toggle Button Fixed at bottom right corner of page */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-4 rounded-full backdrop-blur-md shadow-2xl border-2 transition-all duration-500 ${darkMode ? "bg-[#FAFAFA]/10 border-white/20 text-yellow-400 hover:bg-[#FAFAFA]/20" : "bg-[#0f172a]/10 border-[#0f172a]/20 text-[#0f172a] hover:bg-[#0f172a]/20"} hover:scale-110 active:scale-90`}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
              <span className="text-[10px] uppercase tracking-widest font-black text-yellow-500">Light Mode</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              <span className="text-[10px] uppercase tracking-widest font-black text-[#0f172a]">Dark Mode</span>
            </div>
          )}
        </button>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="p-[2.5px] rounded-[2.5rem] bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-md relative overflow-hidden"
            >
              <div className={`p-8 rounded-[calc(2.5rem-2.5px)] flex flex-col items-center gap-6 text-center ${darkMode ? "bg-[#121212]" : "bg-[#FAFAFA]"}`}>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl shadow-xl shadow-blue-500/20">
                  🎉
                </div>
                
                <div className="space-y-4">
                  <h3 className={`text-3xl font-black tracking-tight ${darkMode ? "text-white" : "text-black"}`}>
                    Sign up Successful!
                  </h3>
                  <p className={`text-base font-bold leading-relaxed ${darkMode ? "text-white" : "text-black"} opacity-80`}>
                    Your account has been created. Please wait for <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-4 font-black">admin approval</span> before logging in.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/auth/login")}
                  className="w-full relative group p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl overflow-hidden transition-all shadow-xl active:scale-95"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-500 group-hover:to-purple-500 py-4 w-full h-full rounded-[calc(1rem-2px)] flex items-center justify-center transition-all">
                    <span className="text-white text-xs font-black uppercase tracking-[0.3em]">
                      Proceed to Login
                    </span>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
