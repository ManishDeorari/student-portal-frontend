"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";
import { TubesBackground } from "@/app/components/TubesBackground";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const [view, setView] = useState("LOGIN"); // LOGIN | FORGOT_EMAIL | FORGOT_OTP
  const [form, setForm] = useState({ identifier: "", password: "" });

  // Forgot Password States
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Countdown timer for OTP
  const searchParams = useSearchParams();
  const logoutReason = searchParams.get("reason");

  React.useEffect(() => {
    if (logoutReason === "deleted") {
      toast.error("Your account has been removed by the administrator.", {
        duration: 6000,
        icon: "🚫",
        style: {
          background: "#991b1b",
          color: "#fff",
          border: "1px solid #7f1d1d",
          borderRadius: "15px",
          fontWeight: "bold"
        }
      });
      // Clear URL params to avoid showing toast again on refresh
      router.replace("/auth/login");
    }
  }, [logoutReason, router]);

  React.useEffect(() => {
    let interval;
    if (view === "FORGOT_OTP" && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [view, timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // ✅ Pre-flight: Ping the health endpoint to wake the server (fire-and-forget)
    const wakeServer = async () => {
      try {
        await fetch(`${apiUrl}/api/health`, { method: "GET", mode: "cors", credentials: "include" });
      } catch {
        // Expected to fail on cold start — that's fine, the ping itself wakes Render
      }
    };

    const RETRY_DELAYS = [4000, 8000, 15000, 20000, 25000]; // Escalating delays for cold start (total ~72s)

    const attemptLogin = async (retryCount = 0) => {
      try {
        const res = await fetch(
          `${apiUrl}/api/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              identifier: form.identifier,
              password: form.password
            }),
          });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Invalid credentials");
        }

        // ✅ Save token and role
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role);
          localStorage.setItem("userId", data.userId);
          if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

          // ✅ Notify other components (like NotificationContext) that auth has changed
          window.dispatchEvent(new Event("local-auth-change"));

          toast.success("✅ Login Successful!");

          // ✅ Redirect based on role
          if (data.role === "admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/dashboard");
          }
        } else {
          throw new Error("Token not received");
        }
      } catch (err) {
        // ✅ If network/server error (cold start / server sleeping), retry with escalating delays
        const isNetworkError = err.name === "TypeError" || err.message?.includes("fetch") || err.message?.includes("Failed");
        if (isNetworkError && retryCount < RETRY_DELAYS.length) {
          const delay = RETRY_DELAYS[retryCount];
          const seconds = Math.round(delay / 1000);
          console.warn(`⚠️ Server may be waking up. Retry ${retryCount + 1}/${RETRY_DELAYS.length} in ${seconds}s...`);
          setError(`Server is starting up... retrying in ${seconds}s (attempt ${retryCount + 1}/${RETRY_DELAYS.length})`);

          // Fire another wake ping during the wait
          wakeServer();
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptLogin(retryCount + 1);
        }

        console.error("Login Error:", err);
        const userMessage = isNetworkError
          ? "Server is currently unavailable. Please try again in a minute."
          : (err.message || "Something went wrong");
        setError(userMessage);
        toast.error(userMessage);
        setLoading(false);
      }
    };

    // Fire initial wake ping, then attempt login
    wakeServer();
    await attemptLogin();
  };



  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message);
      setView("FORGOT_OTP");
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/reset-password-with-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message);
      setView("LOGIN");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [darkMode, setDarkMode] = useState(false);

  return (
    <TubesBackground 
      className="min-h-screen text-white bg-black" 
      darkMode={darkMode}
      tubeCount={5}
    >
      <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 sm:px-8 transition-colors duration-500">
      <LoadingOverlay isVisible={loading} message={view === "LOGIN" ? "Authenticating..." : "Processing..."} />

      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2 max-w-[500px] lg:pl-16 mt-8 sm:mt-12 lg:mt-0 mb-8"
        >
          <div className="p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2.5rem] shadow-2xl relative">
            <div className={`${darkMode ? "bg-[#0f172a]/95 text-white" : "bg-[#FAFAFA] text-gray-900"} backdrop-blur-2xl rounded-[calc(2.5rem-2.5px)] py-4 px-4 sm:py-6 sm:px-8 space-y-4 sm:space-y-5 relative overflow-hidden transition-all duration-500`}>
              {view === "LOGIN" && (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="space-y-1 sm:space-y-2 text-center">
                    <h2 className={`text-2xl sm:text-3xl font-black ${darkMode ? "text-white" : "text-black"} tracking-tight`}>Welcome Back</h2>
                    <p className={`text-xs sm:text-sm ${darkMode ? "text-white" : "text-black"} font-bold opacity-70`}>Enter your credentials to access your account</p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`${darkMode ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-red-50 border-red-100 text-red-600"} border text-xs py-3 px-4 rounded-xl text-center font-black`}
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-4 sm:space-y-5">
                    <div className="space-y-1.5">
                      <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Email or ID</label>
                      <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm">
                        <input
                          type="text"
                          name="identifier"
                          placeholder="example@univ.edu"
                          value={form.identifier}
                          onChange={handleChange}
                          className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-[calc(1rem-1.5px)] outline-none text-sm sm:text-base ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center ml-4 mr-2">
                        <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} font-black`}>Password</label>
                        <button
                          type="button"
                          onClick={() => setView("FORGOT_EMAIL")}
                          className="text-[10px] uppercase tracking-widest text-blue-500 hover:text-blue-400 font-extrabold transition-colors border-b-2 border-transparent hover:border-blue-400"
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm">
                        <input
                          type="password"
                          name="password"
                          placeholder="••••••••"
                          value={form.password}
                          onChange={handleChange}
                          className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-[calc(1rem-1.5px)] outline-none text-sm sm:text-base ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
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
                      <span className="text-white font-black text-xs uppercase tracking-widest leading-none">
                        {loading ? "Authenticating..." : "Login"}
                      </span>
                    </div>
                  </button>

                  <div className="pt-2 text-center">
                    <p className={`text-sm ${darkMode ? "text-white" : "text-black"} font-bold`}>
                      New here?{" "}
                      <Link href="/auth/signup" className="text-blue-500 font-black hover:underline underline-offset-4">
                        Create an Account
                      </Link>
                    </p>
                  </div>
                </form>
              )}

              {view === "FORGOT_EMAIL" && (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="space-y-2 text-center">
                    <h2 className={`text-3xl font-black ${darkMode ? "text-white" : "text-black"} tracking-tight`}>Reset Access</h2>
                    <p className={`text-sm ${darkMode ? "text-white" : "text-black"} font-bold opacity-70`}>We&apos;ll send a code to your registered email</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Email Address</label>
                      <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className={`w-full px-6 py-4 rounded-[calc(1rem-1.5px)] outline-none ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full relative group p-[2px] bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden transition-all shadow-xl active:scale-95 disabled:opacity-50"
                    >
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-500 group-hover:to-purple-500 py-4 w-full h-full rounded-[calc(1rem-2px)] flex items-center justify-center transition-all">
                        <span className="text-white font-black text-xs uppercase tracking-widest leading-none">
                          {loading ? "Sending..." : "Send Verification Code"}
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setView("LOGIN")}
                      className={`w-full ${darkMode ? "text-white hover:text-blue-400" : "text-black hover:text-blue-600"} text-[10px] uppercase tracking-widest font-black transition-colors`}
                    >
                      Return to Login
                    </button>
                  </div>
                </form>
              )}

              {view === "FORGOT_OTP" && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2 text-center">
                    <h2 className={`text-3xl font-black ${darkMode ? "text-white" : "text-black"} tracking-tight`}>Security Check</h2>
                    <p className={`text-sm ${darkMode ? "text-white" : "text-black"} font-bold opacity-70`}>Verification code sent to your inbox</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Verification Code</label>
                      <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm">
                        <input
                          type="text"
                          placeholder="6-digit code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className={`w-full px-6 py-4 rounded-[calc(1rem-1.5px)] outline-none text-center tracking-[0.5em] font-black ${darkMode ? "bg-black text-white" : "bg-white text-black"} font-bold`}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>New Password</label>
                      <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm">
                        <input
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`w-full px-6 py-4 rounded-[calc(1rem-1.5px)] outline-none ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    {timer > 0 ? (
                      <p className={`text-[10px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} font-black`}>Code expires in <span className="text-blue-500">{timer}s</span></p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[10px] uppercase tracking-widest text-red-500 font-black hover:underline underline-offset-4"
                      >
                        Code Expired. Resend?
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full relative group p-[2px] bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl overflow-hidden transition-all shadow-xl active:scale-95 disabled:opacity-50"
                    >
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 group-hover:from-green-500 group-hover:to-emerald-500 py-4 w-full h-full rounded-[calc(1rem-2px)] flex items-center justify-center transition-all">
                        <span className="text-white font-black text-xs uppercase tracking-widest leading-none">
                          {loading ? "Updating..." : "Verify & Reset"}
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setView("LOGIN")}
                      className={`w-full ${darkMode ? "text-white hover:text-blue-400" : "text-black hover:text-blue-600"} text-[10px] uppercase tracking-widest font-black transition-colors`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Back to Home Inside the Div */}
              <div className="pt-6 border-t border-white/5 text-center">
                <div className="p-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full inline-block group transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] shadow-lg">
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
            Student Portal
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
            Student Portal
          </h1>
          <p className="text-white/70 mt-2 font-medium text-sm">Reconnect. Network. Grow.</p>
        </div>
      </div>

      {/* Theme Toggle Button - Fixed at absolute bottom right of page */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <div className="p-[1.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-xl">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-4 rounded-full backdrop-blur-md transition-all duration-500 ${darkMode ? "bg-black/60 text-yellow-400" : "bg-white/80 text-slate-900"} hover:scale-110 active:scale-90`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                <span className="text-[10px] uppercase tracking-widest font-black">Light Mode</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-900">Dark Mode</span>
              </div>
            )}
          </button>
        </div>
      </div>
      </div>
    </TubesBackground>
  );
}
