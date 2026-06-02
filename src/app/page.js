"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGlobe, FaQuoteLeft, FaRocket } from "react-icons/fa";
import { ArrowRight, ShieldCheck, User, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { TubesBackground } from "@/app/components/TubesBackground";
import ThemeToggle from "./components/ui/ThemeToggle";

const slides = [
  {
    id: "hero",
    type: "hero",
  },
  {
    id: "about",
    type: "about",
    title: "Our Mission",
    subtitle: "Community First",
  },
  {
    id: "stories",
    type: "stories",
    title: "Stories",
    subtitle: "Voices of Impact",
  },
];

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
};

export default function HomePage() {
  const { darkMode } = useTheme();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const autoRef = useRef(null);

  const goTo = (idx, dir) => {
    setDirection(dir);
    setCurrent(idx);
  };

  const next = () => {
    const nxt = (current + 1) % slides.length;
    goTo(nxt, 1);
  };

  const prev = () => {
    const prv = (current - 1 + slides.length) % slides.length;
    goTo(prv, -1);
  };

  // Auto-advance every 4s
  useEffect(() => {
    autoRef.current = setInterval(next, 4000);
    return () => clearInterval(autoRef.current);
  }, [current]);

  const resetAuto = () => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(next, 4000);
  };

  const handleNext = () => { next(); resetAuto(); };
  const handlePrev = () => { prev(); resetAuto(); };
  const handleDot = (i) => { goTo(i, i > current ? 1 : -1); resetAuto(); };

  return (
    <TubesBackground
      className="text-white"
      tubeCount={10}
      darkMode={darkMode}
      alwaysDark={true}
    >
      {/* Fixed full-screen wrapper — no scroll */}
      <div className="fixed inset-0 flex flex-col overflow-hidden">

        {/* ─── Navbar ─── */}
        <nav className="shrink-0 z-50 py-3 px-6 flex justify-between items-center border-b border-white/10 backdrop-blur-md bg-black/20">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="p-px bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-all shadow-lg shadow-blue-500/20">
              <div className="bg-black p-1.5 rounded-[calc(0.5rem-1px)]">
                <FaRocket size={13} className="text-blue-500" />
              </div>
            </div>
            <span className="text-lg font-black tracking-tighter uppercase italic text-white">Student Portal</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Dot indicators as nav */}
            <div className="hidden sm:flex items-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleDot(i)}
                  className={`transition-all duration-300 rounded-full ${i === current
                    ? "w-6 h-2 bg-gradient-to-r from-blue-500 to-purple-500"
                    : "w-2 h-2 bg-white/20 hover:bg-white/40"
                    }`}
                />
              ))}
            </div>
            <Link href="/auth/login" className="p-px bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg active:scale-95 transition-all">
              <div className="bg-black text-white hover:bg-transparent font-black text-[10px] uppercase tracking-[0.2em] px-6 py-2.5 rounded-full transition-all">
                Portal Login
              </div>
            </Link>
          </div>
        </nav>

        {/* ─── Carousel area ─── */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8"
            >
              {/* ── HERO ── */}
              {slides[current].type === "hero" && (
                <div className="text-center max-w-4xl mx-auto relative z-10">
                  <div className="inline-flex px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-6 shadow-2xl bg-white/10 border border-white/20 text-white leading-none">
                    ✨ Reconnect • Network • Grow ✨
                  </div>
                  <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter mb-4 leading-none italic uppercase text-white">
                    STUDENT<br />
                    <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent italic">PORTAL</span>
                  </h1>
                  <p className="max-w-xl mx-auto text-sm md:text-base font-bold uppercase tracking-[0.1em] leading-relaxed mb-7 text-white/70">
                    The next generation professional ecosystem<br />for active students worldwide.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/auth/login?view=SIGNUP" className="group relative p-px bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-2xl transform hover:-translate-y-1 transition-all duration-500">
                      <div className="bg-black/40 hover:bg-transparent backdrop-blur-md px-10 py-4 rounded-[calc(0.75rem-1px)] flex items-center gap-3 transition-all">
                        <span className="text-white font-black text-xs uppercase tracking-[0.3em]">Create Account</span>
                        <ArrowRight className="text-blue-500 group-hover:text-white transition-colors" size={14} />
                      </div>
                    </Link>
                    <Link href="/auth/login" className="p-px bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 rounded-xl hover:from-blue-500 hover:to-pink-500 transition-all shadow-xl active:scale-95 group">
                      <div className="bg-black/60 px-7 py-3.5 rounded-[calc(0.75rem-1px)] flex items-center gap-3 transition-colors backdrop-blur-lg">
                        <ShieldCheck className="text-blue-500" size={14} />
                        <span className="text-white font-black text-xs uppercase tracking-[0.3em]">Member Login</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}

              {/* ── ABOUT ── */}
              {slides[current].type === "about" && (
                <div className="w-full max-w-4xl mx-auto">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-[1.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-3 shadow-xl">
                      <div className="bg-black/40 backdrop-blur-md p-3 rounded-[calc(1rem-1.5px)]">
                        <FaGlobe size={22} className="text-blue-500" />
                      </div>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tighter italic text-white mb-1">Our Mission</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">Community First</p>
                  </div>
                  <div className="p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2rem] shadow-2xl">
                    <div className={`${darkMode ? "bg-slate-900/80" : "bg-white/80"} backdrop-blur-xl rounded-[calc(2rem-2px)] p-6 sm:p-8`}>
                      <div className="grid md:grid-cols-2 gap-6 items-center text-left">
                        <div className={`space-y-3 text-base font-bold leading-relaxed ${darkMode ? "text-white" : "text-slate-800"}`}>
                          <p>Empowering students through technology, mentorship, and global professional networking.</p>
                          <p className={`text-sm font-medium leading-loose ${darkMode ? "text-white/70" : "text-slate-600"}`}>
                            The Student Portal bridges university life and professional success — tools for seamless networking and career acceleration.
                          </p>
                          <div className="flex flex-wrap gap-3 pt-1">
                            <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${darkMode ? "bg-white/5 border-white/10 text-blue-400" : "bg-slate-50 border-slate-200 text-blue-700"}`}>✨ Global Elite</div>
                            <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${darkMode ? "bg-white/5 border-white/10 text-purple-400" : "bg-slate-50 border-slate-200 text-purple-700"}`}>🔥 Future Proof</div>
                          </div>
                        </div>
                        <div className="relative group flex items-center justify-center">
                          <div className={`absolute inset-0 blur-[50px] rounded-full opacity-25 group-hover:opacity-40 transition-all duration-700 ${darkMode ? "bg-blue-600" : "bg-blue-400"}`} />
                          <div className={`relative p-8 border rounded-[2rem] flex items-center justify-center bg-white/5 border-white/10 ${!darkMode && "bg-white/40 border-slate-200 backdrop-blur-md"}`}>
                            <FaRocket size={60} className="text-blue-500 group-hover:scale-110 transition-transform duration-700 rotate-12 group-hover:rotate-0" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STORIES ── */}
              {slides[current].type === "stories" && (
                <div className="w-full max-w-2xl mx-auto">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-[1.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-3 shadow-xl">
                      <div className="bg-black/40 backdrop-blur-md p-3 rounded-[calc(1rem-1.5px)]">
                        <FaQuoteLeft size={22} className="text-blue-500" />
                      </div>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tighter italic text-white mb-1">Stories</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">Voices of Impact</p>
                  </div>
                  <div className="p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2rem] shadow-2xl">
                    <div className={`${darkMode ? "bg-slate-900/80" : "bg-white/80"} backdrop-blur-xl rounded-[calc(2rem-2px)] p-8 text-center`}>
                      <FaQuoteLeft size={32} className="text-blue-500 opacity-20 mx-auto mb-4" />
                      <p className={`text-lg sm:text-2xl font-black leading-tight italic ${darkMode ? "text-white" : "text-slate-950"}`}>
                        &quot;Authentic connections are the foundation of any great career. This portal makes it effortless.&quot;
                      </p>
                      <div className="flex items-center justify-center gap-4 pt-6">
                        <div className="w-10 h-10 p-px bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                          <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
                            <User size={16} className="text-slate-400" />
                          </div>
                        </div>
                        <div className="text-left">
                          <p className={`font-black uppercase tracking-widest text-xs ${darkMode ? "text-white" : "text-slate-950"}`}>Manish Chandra Deorari</p>
                          <p className={`font-bold uppercase tracking-widest text-[10px] ${darkMode ? "text-white/60" : "text-slate-600"}`}>MCA - 2024-26</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Left / Right arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-all active:scale-90"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-all active:scale-90"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>

        {/* ─── Theme Toggle Row ─── */}
        <div className="shrink-0 z-50 flex justify-end px-6 py-1.5 bg-black/10 backdrop-blur-sm border-t border-white/5">
          <ThemeToggle />
        </div>

        {/* ─── Footer ─── */}
        <footer className="shrink-0 z-50 py-2.5 px-6 border-t border-white/10 backdrop-blur-md bg-black/20 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-5">
            <span className="text-xs font-black italic uppercase tracking-tight text-white/70">Student Portal</span>
            <div className="flex gap-4">
              {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                <Icon key={i} className="text-base text-white/40 hover:text-blue-400 transition-all cursor-pointer hover:scale-110" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-px bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full">
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic ${darkMode ? "bg-black" : "bg-slate-900"} text-white`}>
                Graphic ERA Hill University
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">© 2025</p>
          </div>
        </footer>
      </div>
    </TubesBackground>
  );
}
