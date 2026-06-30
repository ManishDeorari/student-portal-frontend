"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash, FaEnvelope, FaUser, FaLock, FaBuilding, FaIdCard, FaBook, FaCheckCircle, FaQuestionCircle, FaUserTie } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingOverlay from "@/app/components/ui/LoadingOverlay";
import { TubesBackground } from "@/app/components/TubesBackground";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "../../components/ui/ThemeToggle";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = searchParams.get("view") === "SIGNUP" ? "SIGNUP" : "LOGIN";
  const [view, setView] = useState(initialView); // LOGIN | FORGOT_EMAIL | FORGOT_OTP | SIGNUP
  const [form, setForm] = useState({ identifier: "", password: "" });

  // Forgot Password States
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    enrollmentNumber: "PV-H", // default prefix
    universityRollNumber: "",
    role: "student", // default
    position: "",
    department: "",
    course: "",
    semester: "",
    section: "",
    branch: "",
  });
  const [signupStep, setSignupStep] = useState(1);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const handleSignupChange = (e) => {
    let { name, value } = e.target;
    if (name === "course" || name === "section") {
      value = value?.toUpperCase() || "";
    }
    // When switching roles, reset the enrollment/ID field appropriately
    if (name === "role") {
      const newEnrollment = value === "student" ? "PV-H" : "";
      setSignupForm({ ...signupForm, [name]: value, enrollmentNumber: newEnrollment });
      return;
    }
    // Ensure enrollment number always keeps the PV-H prefix and is uppercase (student only)
    if (name === "enrollmentNumber" && signupForm.role === "student") {
      value = value.toUpperCase();
      if (!value.startsWith("PV-H")) {
        value = "PV-H" + value.replace(/^PV-?H?/i, "");
      }
      const digits = value.slice(4).replace(/\D/g, "");
      value = "PV-H" + digits;
    }
    setSignupForm({ ...signupForm, [name]: value });
  };

  const [isAndroid, setIsAndroid] = useState(true);

  React.useEffect(() => {
    setIsAndroid(/android/i.test(navigator.userAgent));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Countdown timer for OTP
  // searchParams already defined
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



  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!signupForm.name || !signupForm.email || !signupForm.password || !signupForm.enrollmentNumber) {
      setError("Please fill all mandatory fields.");
      setLoading(false);
      return;
    }

    if (signupForm.role === "faculty" && (!signupForm.position || !signupForm.department)) {
      setError("Please provide Position and Department.");
      setLoading(false);
      return;
    }

    if (signupForm.role === "student" && (!signupForm.course || !signupForm.semester || !signupForm.universityRollNumber)) {
      setError("Please fill all mandatory student fields (Course, Semester, University Roll No).");
      setLoading(false);
      return;
    }

    // Client-side enrollment number format check (student only)
    if (signupForm.role === "student") {
      const enRegex = /^PV-H\d+$/;
      if (!enRegex.test(signupForm.enrollmentNumber)) {
        setError("Invalid enrollment number format. It must start with 'PV-H' followed by digits only (e.g. PV-H209001).");
        setLoading(false);
        return;
      }
      if (signupForm.enrollmentNumber.length > 15) {
        setError("Enrollment number is too long. Use format PV-H followed by up to 10 digits (e.g. PV-H209001).");
        setLoading(false);
        return;
      }
    }

    if (!signupForm.email.endsWith("@gehu.ac.in")) {
      setError("Only @gehu.ac.in email addresses are allowed for sign up.");
      setLoading(false);
      return;
    }

    // Prepare body according to role
    const body =
      signupForm.role === "faculty"
        ? {
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
          role: "faculty",
          employeeId: signupForm.enrollmentNumber, // mapping faculty field to employeeId
          position: signupForm.position,
          department: signupForm.department,
        }
        : {
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
          role: "student",
          enrollmentNumber: signupForm.enrollmentNumber,
          universityRollNumber: signupForm.universityRollNumber,
          course: signupForm.course,
          semester: Number(signupForm.semester),
          section: signupForm.section,
          branch: signupForm.branch,
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

    const attemptSignupReq = async (retryCount = 0) => {
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
        setShowSignupSuccess(true);
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
          return attemptSignupReq(retryCount + 1);
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
    await attemptSignupReq();
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

  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <TubesBackground 
      className="min-h-screen text-white" 
      darkMode={darkMode}
      alwaysDark={true}
      tubeCount={10}
    >
      <div className="min-h-screen flex flex-col lg:flex-row items-center lg:items-start lg:pt-12 justify-center lg:justify-start px-4 sm:px-8 transition-colors duration-500">
      <LoadingOverlay isVisible={loading} message={view === "LOGIN" ? "Authenticating..." : "Processing..."} />

      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2 max-w-[310px] sm:max-w-[420px] lg:max-w-[420px] lg:ml-12 mt-6 sm:mt-12 lg:mt-0 mb-8 mx-auto lg:mx-0"
        >
          <div className="p-[2px] sm:p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative">
            <div className={`${darkMode ? "bg-[#0f172a] text-white" : "bg-[#FAFAFA] text-gray-900"}  rounded-[calc(2rem-2px)] sm:rounded-[calc(2.5rem-2.5px)] py-4 px-5 sm:py-6 sm:px-8 relative overflow-hidden transition-all duration-500 h-[480px] sm:h-[520px] flex flex-col`}>
              {(view === "LOGIN" || view === "SIGNUP") && (
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full min-h-0">
                  <div className="space-y-1 sm:space-y-2 text-center shrink-0 mb-2">
                    <h2 className={`text-2xl sm:text-3xl font-black ${darkMode ? "text-white" : "text-black"} tracking-tight`}>Welcome Back</h2>
                    <p className={`text-xs sm:text-sm ${darkMode ? "text-white" : "text-black"} font-bold opacity-70`}>Enter your credentials to access your account</p>
                  </div>

                  {error && view !== "SIGNUP" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`${darkMode ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-red-50 border-red-100 text-red-600"} border text-xs py-3 px-4 rounded-xl text-center font-black`}
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 sm:space-y-5 flex flex-col justify-center">
                    

                    <div className="space-y-1">
                      <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Email Address <span className="text-red-500 ml-1">*</span></label>
                      <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm">
                        <input
                          type="text"
                          name="identifier"
                          placeholder="example@gehu.ac.in"
                          value={form.identifier}
                          onChange={handleChange}
                          className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-[calc(1rem-1.5px)] outline-none text-base sm:text-lg ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center ml-4 mr-2">
                        <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} font-black`}>Password <span className="text-red-500 ml-1">*</span></label>
                        <button
                          type="button"
                          onClick={() => setView("FORGOT_EMAIL")}
                          className="text-[9px] uppercase tracking-widest text-blue-500 hover:text-blue-400 font-extrabold transition-colors border-b-2 border-transparent hover:border-blue-400"
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="••••••••"
                          value={form.password}
                          onChange={handleChange}
                          className={`w-full px-4 sm:px-6 pr-12 py-3 sm:py-4 rounded-[calc(1rem-1.5px)] outline-none text-base sm:text-lg ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${darkMode ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-600"}`}
                        >
                          {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                        </button>
                      </div>
                      <p className={`text-[10px] ${darkMode ? "text-white/60" : "text-black/60"} mt-1.5 ml-4 font-semibold`}>Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol.</p>
                    </div>
                  </div>

                  <div className="shrink-0 space-y-2 pt-2">
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

                    
                    <div className="flex flex-col gap-4 mt-2">
                      <div className="relative flex items-center">
                        <div className={`flex-grow border-t ${darkMode ? "border-white/10" : "border-gray-300"}`}></div>
                        <span className="flex-shrink-0 mx-4 text-[10px] uppercase tracking-widest text-gray-400 font-black">Or</span>
                        <div className={`flex-grow border-t ${darkMode ? "border-white/10" : "border-gray-300"}`}></div>
                      </div>
                      
                      <button 
                        type="button" 
                        onClick={() => setView("SIGNUP")} 
                        className={`w-full py-3 sm:py-4 rounded-2xl border-2 transition-all duration-300 font-black text-xs uppercase tracking-widest hover:shadow-lg ${darkMode ? "border-white/20 text-white hover:border-blue-500 hover:bg-blue-500/10" : "border-gray-300 text-black hover:border-blue-600 hover:bg-blue-50"}`}
                      >
                        Create a New Account
                      </button>
                    </div>
                  </div>
                </form>
              )}

              
              {view === "FORGOT_EMAIL" && (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="space-y-2 text-center">
                    <h2 className={`text-3xl font-black ${darkMode ? "text-white" : "text-black"} tracking-tight`}>Reset Access</h2>
                    <p className={`text-sm ${darkMode ? "text-white" : "text-black"} font-bold opacity-70`}>We&apos;ll send a code to your registered email</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Email Address <span className="text-red-500 ml-1">*</span></label>
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

                  <div className="space-y-2">
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
                      className={`w-full ${darkMode ? "text-white hover:text-blue-400" : "text-black hover:text-blue-600"} text-[9px] uppercase tracking-widest font-black transition-colors`}
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

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Verification Code</label>
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

                    <div className="space-y-1">
                      <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>New Password</label>
                      <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`w-full px-6 pr-12 py-4 rounded-[calc(1rem-1.5px)] outline-none ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${darkMode ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-600"}`}
                        >
                          {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                        </button>
                      </div>
                      <p className={`text-[10px] ${darkMode ? "text-white/60" : "text-black/60"} mt-1.5 ml-4 font-semibold`}>Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol.</p>
                    </div>
                  </div>

                  <div className="text-center">
                    {timer > 0 ? (
                      <p className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} font-black`}>Code expires in <span className="text-blue-500">{timer}s</span></p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[9px] uppercase tracking-widest text-red-500 font-black hover:underline underline-offset-4"
                      >
                        Code Expired. Resend?
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
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
                      className={`w-full ${darkMode ? "text-white hover:text-blue-400" : "text-black hover:text-blue-600"} text-[9px] uppercase tracking-widest font-black transition-colors`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Back to Home Inside the Div */}
              <div className="pt-4 border-t border-white/5 text-center shrink-0 mt-auto">
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
          className="w-full lg:w-1/2 text-center lg:text-right hidden lg:block lg:pt-20"
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
        <div className="lg:hidden text-center mb-4 order-first pt-10 sm:pt-14">
          <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
            Student Portal
          </h1>
          <p className="text-white/70 mt-2 font-medium text-sm">Reconnect. Network. Grow.</p>
        </div>
      </div>

      <ThemeToggle />
      </div>
    
      <AnimatePresence>
        {showSignupSuccess && (
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

                <div className="space-y-3">
                  <h3 className={`text-3xl font-black tracking-tight ${darkMode ? "text-white" : "text-black"}`}>
                    Sign up Successful!
                  </h3>
                  <p className={`text-base font-bold leading-relaxed ${darkMode ? "text-white" : "text-black"} opacity-80`}>
                    Your account has been created. Please wait for <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-4 font-black">admin approval</span> before logging in.
                  </p>
                </div>

                <button
                  onClick={() => { setView("LOGIN"); setShowSignupSuccess(false); }}
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

      {/* SIGNUP MODAL */}
      <AnimatePresence>
        {view === "SIGNUP" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
               onClick={() => setView("LOGIN")}
            />
            <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               transition={{ type: "spring", duration: 0.5, bounce: 0 }}
               className="relative w-full max-w-2xl p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh]"
            >
               <div className={`${darkMode ? "bg-[#0f172a]" : "bg-white"} w-full h-full rounded-[calc(2.5rem-2px)] overflow-hidden flex flex-col relative`}>
                 <button
                    type="button"
                    onClick={() => setView("LOGIN")}
                    className={`absolute top-4 right-4 z-10 p-2 rounded-full border-2 border-gray-500 ${darkMode ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-black hover:bg-gray-100"} transition-colors`}
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>

                 <div className="p-6 sm:p-8 flex flex-col h-full overflow-hidden">
                 <div className="space-y-1 sm:space-y-2 text-center shrink-0 mb-6">
                   <h2 className={`text-3xl sm:text-4xl font-black ${darkMode ? "text-white" : "text-black"} tracking-tight`}>Complete Profile</h2>
                   <p className={`text-sm sm:text-base ${darkMode ? "text-white" : "text-black"} font-bold opacity-70`}>Join the largest student network at GEHU</p>
                 </div>

                 {error && (
                   <motion.div
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className={`mb-4 ${darkMode ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-red-50 border-red-100 text-red-600"} border text-xs py-3 px-4 rounded-xl text-center font-black`}
                   >
                     {error}
                   </motion.div>
                 )}

                 <div className="flex-1 overflow-y-auto drawer-scrollbar pr-2 sm:pr-4 min-h-0 flex flex-col">
                  <div className="space-y-4 sm:space-y-6 flex-1">
                    <div className="flex justify-center mb-2">
                      <div className="inline-flex p-[1.5px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm relative">
                        <div className={`inline-flex p-1 rounded-[calc(1rem-1.5px)] w-full h-full ${darkMode ? "bg-[#0f172a]" : "bg-white"}`}>
                          <button
                            type="button"
                            onClick={() => handleSignupChange({ target: { name: 'role', value: 'student' }})}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${signupForm.role === 'student' ? 'bg-blue-500 text-white shadow-lg' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                          >
                            Student
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSignupChange({ target: { name: 'role', value: 'faculty' }})}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${signupForm.role === 'faculty' ? 'bg-purple-500 text-white shadow-lg' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                          >
                            Faculty
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Email Address <span className="text-red-500 ml-1">*</span></label>
                      <div className={`p-[1.5px] ${error?.toLowerCase().includes("email") ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-purple-600"} rounded-2xl shadow-sm relative`}>
                        <input
                          type="email"
                          name="email"
                          placeholder="example@gehu.ac.in"
                          value={signupForm.email}
                          onChange={handleSignupChange}
                          className={`w-full pl-10 pr-10 py-3 sm:py-3.5 rounded-[calc(1rem-1.5px)] outline-none text-sm sm:text-base ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                          required
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"><FaEnvelope size={14} /></div>
                        {signupForm.email.endsWith("@gehu.ac.in") && signupForm.email.length > 13 && (
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none font-black text-sm">✓</div>
                        )}
                      </div>
                    </div>

<div className="space-y-1">
                      <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Full Name <span className="text-red-500 ml-1">*</span></label>
                      <div className={`p-[1.5px] ${error?.toLowerCase().includes("name") ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-purple-600"} rounded-2xl shadow-sm relative`}>
                        <input
                          type="text"
                          name="name"
                          placeholder="Manish Deorari"
                          value={signupForm.name}
                          onChange={handleSignupChange}
                          className={`w-full pl-10 pr-10 py-3 sm:py-3.5 rounded-[calc(1rem-1.5px)] outline-none text-sm sm:text-base ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                          required
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"><FaUser size={14} /></div>
                        {signupForm.name.length >= 3 && (
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none font-black text-sm">✓</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 ml-4">
                        <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} font-black`}>
                          {signupForm.role === "faculty" ? "Employee ID" : "Enrollment No."} <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="group/tooltip relative flex items-center">
                          <FaQuestionCircle className="text-gray-400 cursor-help transition-colors hover:text-blue-400" size={10} />
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover/tooltip:block bg-gray-800 text-white text-[10px] p-2 rounded-lg min-w-[140px] text-center z-50 shadow-xl border border-gray-700 whitespace-nowrap font-bold tracking-wide">
                            Found on your ERP Account
                          </div>
                        </div>
                      </div>
                      <div className={`p-[1.5px] ${error?.toLowerCase().includes("enrollment number") || error?.toLowerCase().includes("employee id") || error?.toLowerCase().includes("pv-h") ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-purple-600"} rounded-2xl shadow-sm relative`}>
                        <input
                          type="text"
                          name="enrollmentNumber"
                          placeholder={signupForm.role === "faculty" ? "Ex: Emp-123" : "Ex: PV-H209001"}
                          value={signupForm.enrollmentNumber}
                          onChange={handleSignupChange}
                          className={`w-full pl-10 pr-10 py-3 sm:py-3.5 rounded-[calc(1rem-1.5px)] outline-none text-sm sm:text-base ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                          required
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"><FaIdCard size={14} /></div>
                        {signupForm.enrollmentNumber.length > 5 && (
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none font-black text-sm">✓</div>
                        )}
                      </div>
                    </div>

                    {signupForm.role === "faculty" ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Position <span className="text-red-500 ml-1">*</span></label>
                          <div className={`p-[1.5px] ${error?.toLowerCase().includes("position") ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-purple-600"} rounded-2xl shadow-sm relative`}>
                            <input
                              type="text"
                              name="position"
                              placeholder="Ex: Assistant Professor"
                              value={signupForm.position}
                              onChange={handleSignupChange}
                              className={`w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-[calc(1rem-1.5px)] outline-none text-sm sm:text-base ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                              required
                            />
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"><FaUserTie size={14} /></div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Department <span className="text-red-500 ml-1">*</span></label>
                          <div className={`p-[1.5px] ${error?.toLowerCase().includes("department") ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-purple-600"} rounded-2xl shadow-sm relative`}>
                            <input
                              type="text"
                              name="department"
                              list="departmentList"
                              placeholder="Ex: CS"
                              value={signupForm.department || ""}
                              onChange={handleSignupChange}
                              className={`w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-[calc(1rem-1.5px)] outline-none text-sm sm:text-base ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                              required
                            />
                            <datalist id="departmentList">
                              <option value="CS" />
                              <option value="IT" />
                              <option value="ME" />
                              <option value="CE" />
                              <option value="EE" />
                              <option value="ECE" />
                              <option value="MBA" />
                            </datalist>
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"><FaBuilding size={14} /></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Course <span className="text-red-500 ml-1">*</span></label>
                            <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm relative">
                              <input
                                type="text"
                                name="course"
                                list="courseList"
                                placeholder="Ex: B.Tech"
                                value={signupForm.course}
                                onChange={handleSignupChange}
                                className={`w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-[calc(1rem-1.5px)] outline-none text-sm sm:text-base ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                                required
                              />
                              <datalist id="courseList">
                                <option value="B.Tech" />
                                <option value="BCA" />
                                <option value="MCA" />
                                <option value="MBA" />
                                <option value="BBA" />
                                <option value="BCOM" />
                                <option value="BHM" />
                              </datalist>
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"><FaBook size={14} /></div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Semester <span className="text-red-500 ml-1">*</span></label>
                            <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm relative">
                              <input
                                type="number"
                                name="semester"
                                list="semesterList"
                                placeholder="1-10"
                                value={signupForm.semester}
                                onChange={handleSignupChange}
                                className={`w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-[calc(1rem-1.5px)] outline-none text-sm sm:text-base ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                                required
                              />
                              <datalist id="semesterList">
                                <option value="1" />
                                <option value="2" />
                                <option value="3" />
                                <option value="4" />
                                <option value="5" />
                                <option value="6" />
                                <option value="7" />
                                <option value="8" />
                                <option value="9" />
                                <option value="10" />
                              </datalist>
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"><FaBook size={14} /></div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>University Roll Number <span className="text-red-500 ml-1">*</span></label>
                          <div className={`p-[1.5px] ${error?.toLowerCase().includes("university roll") ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-purple-600"} rounded-2xl shadow-sm relative`}>
                            <input
                              type="text"
                              name="universityRollNumber"
                              placeholder="Ex: 20112345"
                              value={signupForm.universityRollNumber}
                              onChange={handleSignupChange}
                              className={`w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-[calc(1rem-1.5px)] outline-none text-sm sm:text-base ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                              required
                            />
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"><FaIdCard size={14} /></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Branch</label>
                            <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm relative">
                                <input
                                  type="text"
                                  name="branch"
                                  list="branchList"
                                  placeholder="Ex: CS"
                                  value={signupForm.branch}
                                  onChange={handleSignupChange}
                                  className={`w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-[calc(1rem-1.5px)] outline-none text-sm sm:text-base ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                                />
                                <datalist id="branchList">
                                  <option value="CS" />
                                  <option value="IT" />
                                  <option value="ME" />
                                  <option value="CE" />
                                  <option value="EE" />
                                  <option value="ECE" />
                                  <option value="AIML" />
                                </datalist>
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"><FaBuilding size={14} /></div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Section</label>
                            <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm relative">
                              <input
                                type="text"
                                name="section"
                                placeholder="Ex: A"
                                value={signupForm.section}
                                onChange={handleSignupChange}
                                className={`w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-[calc(1rem-1.5px)] outline-none text-sm sm:text-base ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                              />
                              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"><FaUserTie size={14} /></div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>



                  <div className="space-y-1 mt-4">
                        <label className={`text-[9px] uppercase tracking-widest ${darkMode ? "text-white" : "text-black"} ml-4 font-black`}>Password <span className="text-red-500 ml-1">*</span></label>
                        <div className="p-[1.5px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-sm relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="••••••••"
                            value={signupForm.password}
                            onChange={handleSignupChange}
                            className={`w-full pl-10 pr-12 py-3 sm:py-3.5 rounded-[calc(1rem-1.5px)] outline-none text-sm sm:text-base ${darkMode ? "bg-black text-white placeholder-white/40" : "bg-white text-black placeholder-gray-400"} font-bold`}
                            required
                          />
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"><FaLock size={14} /></div>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${darkMode ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-600"}`}
                          >
                            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                          </button>
                        </div>
                        <div className="flex justify-between items-center px-2 mt-1.5">
                          <p className={`text-[10px] ${darkMode ? "text-white" : "text-black"} font-black`}>
                            Requires: 8+ chars, 1 uppercase, 1 number, 1 symbol.
                          </p>
                        </div>
                        {(() => {
                          const pw = signupForm.password;
                          if (pw.length === 0) return null;
                          let score = 0;
                          if (pw.length >= 8) score++;
                          if (/[A-Z]/.test(pw)) score++;
                          if (/[0-9]/.test(pw)) score++;
                          if (/[^A-Za-z0-9]/.test(pw)) score++;
                          const colors = ["bg-transparent", "bg-red-500", "bg-red-400", "bg-yellow-500", "bg-green-500"];
                          return (
                            <div className="mt-1.5 px-2">
                              <div className="flex gap-1 h-1 w-full">
                                {[1, 2, 3, 4].map(idx => (
                                  <div key={idx} className={`flex-1 rounded-full transition-colors duration-300 ${score >= idx ? colors[score] : (darkMode ? "bg-white/10" : "bg-black/10")}`}></div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

<div className="flex gap-3 sm:gap-4 mt-6 shrink-0 pt-2">
                     <button
                       type="button"
                       onClick={() => setView("LOGIN")}
                       className={`flex-1 py-3 sm:py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border-2 border-gray-500 ${darkMode ? "bg-transparent hover:bg-white/10 text-white" : "bg-transparent hover:bg-gray-100 text-gray-800"}`}
                     >
                       Back
                     </button>
                     <button
                       type="button"
                       onClick={handleSignupSubmit}
                       disabled={loading}
                       className="flex-[2] relative group p-[2px] bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden transition-all shadow-xl active:scale-95 disabled:opacity-50"
                     >
                       <div className="bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-500 group-hover:to-purple-500 py-3 sm:py-4 w-full h-full rounded-[calc(1rem-2px)] flex items-center justify-center transition-all">
                         <span className="text-white font-black text-sm uppercase tracking-widest leading-none">
                           {loading ? "Creating..." : "Create Account"}
                         </span>
                       </div>
                     </button>
                  </div>
                 </div>
               </div>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </TubesBackground>
  );
}
