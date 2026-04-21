"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGlobe, FaCalendarAlt, FaQuoteLeft, FaRocket } from "react-icons/fa";
import { Mail, ArrowRight, ShieldCheck, ChevronDown, Monitor, Moon, Sun, User } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { TubesBackground } from "@/app/components/TubesBackground";

const sectionVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
    willChange: "opacity, transform"
  },
};

const SectionWrapper = ({ title, subtitle, icon: Icon, children, id, darkMode }) => (
  <section id={id} className="section min-h-screen flex flex-col items-center justify-center py-20 px-4 relative z-10">
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      className="w-full max-w-5xl scroll-mt-24"
    >
      <div className="text-center mb-12">
        {Icon && (
          <div className="inline-flex p-[1.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-6 shadow-xl">
            <div className={`${darkMode ? "bg-black/40" : "bg-white/40"} backdrop-blur-md p-4 rounded-[calc(1rem-1.5px)]`}>
              <Icon size={32} className="text-blue-500" />
            </div>
          </div>
        )}
        <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 italic text-white">
          {title}
        </h2>
        <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-transparent mx-auto rounded-full mb-6" />
        {subtitle && <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-blue-300">{subtitle}</p>}
      </div>

      <div className="p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-blue-500/10">
        <div className={`${darkMode ? "bg-slate-900/60" : "bg-white/60"} backdrop-blur-3xl rounded-[calc(2.5rem-2.5px)] p-8 md:p-12`}>
          {children}
        </div>
      </div>
    </motion.div>
  </section>
);

export default function HomePage() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    setIsSending(true);
    setTimeout(() => {
      toast.success("✅ Inquiry Sent Successfully! We'll reach out soon.");
      setEmail("");
      setIsSending(false);
    }, 1500);
  };

  const handleActionClick = () => {
    toast.success("Redirecting to Secure Portal...");
  };

  return (
    <TubesBackground
      className="min-h-screen selection:bg-blue-500/30 text-white scroll-smooth bg-black"
      tubeCount={5}
      idleDelay={3000}
      darkMode={darkMode}
    >
      {/* 🚀 Sticky Navigation - Density refined without global scale for maximum performance */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-2.5 bg-black/70 border-white/5 shadow-2xl backdrop-blur-xl border-b" : "py-4 bg-transparent"}`}>
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="p-px bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-all shadow-lg shadow-blue-500/20">
              <div className="bg-black p-1 rounded-[calc(0.5rem-1px)]">
                <FaRocket size={12} className="text-blue-500" />
              </div>
            </div>
            <h1 className="text-base font-black tracking-tighter uppercase italic">Student Portal</h1>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            {["About", "Events", "Testimonials", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[8px] font-black uppercase tracking-[0.3em] transition-colors relative group text-white/50 hover:text-white"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
            <Link href="/auth/login" className="p-px bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg active:scale-95 transition-all">
              <div className="bg-black text-white hover:bg-transparent font-black text-[8px] uppercase tracking-[0.2em] px-5 py-2 rounded-full transition-all">
                Portal Login
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* 🌌 Hero Section - Optimized size and animations */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="inline-flex px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.4em] mb-6 shadow-2xl bg-white/10 border border-white/20 text-white leading-none">
            ✨ Reconnect • Network • Grow ✨
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 leading-none italic uppercase text-white">
            STUDENT<br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent italic">PORTAL</span>
          </h1>
          <p className="max-w-xl mx-auto text-sm md:text-base font-bold uppercase tracking-[0.1em] leading-relaxed mb-6 text-white/60">
            The next generation professional ecosystem<br />for active students worldwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup" className="group relative p-px bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-3xl transform hover:-translate-y-1 transition-all duration-500">
              <div className="bg-black/40 hover:bg-transparent backdrop-blur-md px-10 py-4 rounded-[calc(0.75rem-1px)] flex items-center gap-3 transition-all">
                <span className="text-white font-black text-xs uppercase tracking-[0.3em]">Create Account</span>
                <ArrowRight className="text-blue-500 group-hover:text-white transition-colors" size={14} />
              </div>
            </Link>

            <Link href="/auth/login" className="p-px bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 rounded-xl hover:from-blue-500 hover:to-pink-500 transition-all shadow-xl active:scale-95 group">
              <div className="bg-black/60 px-7 py-3.5 rounded-[calc(0.75rem-1px)] flex items-center gap-3 transition-colors backdrop-blur-lg">
                <ShieldCheck className="text-blue-500" size={14} />
                <span className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Member Login</span>
              </div>
            </Link>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <ChevronDown className={`${darkMode ? "text-white/20" : "text-slate-300"}`} size={24} />
        </motion.div>
      </section>

      {/* 🔷 Sections - Sizing and containers optimized for performance */}
      <SectionWrapper id="about" title="Our Mission" subtitle="Community First" icon={FaGlobe} darkMode={darkMode}>
        <div className="grid md:grid-cols-2 gap-10 items-center text-left">
          <div className={`space-y-6 text-lg md:text-xl font-bold leading-relaxed ${darkMode ? "text-white" : "text-slate-800"}`}>
            <p>
              Empowering graduates through technology, mentorship, and global professional networking.
            </p>
            <p className={`text-base font-medium leading-loose ${darkMode ? "text-white/40" : "text-slate-500"}`}>
              The Student Portal serves as the primary bridge between university life and professional success. We provide tools for seamless networking and career acceleration.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest ${darkMode ? "bg-white/5 border-white/10 text-blue-400" : "bg-slate-50 border-slate-200 text-blue-700"}`}>✨ Global Elite</div>
              <div className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest ${darkMode ? "bg-white/5 border-white/10 text-purple-400" : "bg-slate-50 border-slate-200 text-purple-700"}`}>🔥 Future Proof</div>
            </div>
          </div>
          <div className="relative group">
            <div className={`absolute inset-0 blur-[60px] rounded-full opacity-30 group-hover:opacity-50 transition-all duration-700 ${darkMode ? "bg-blue-600" : "bg-blue-400"}`} />
            <div className={`relative p-8 border rounded-[2rem] shadow-4xl flex items-center justify-center bg-white/5 border-white/10 ${!darkMode && "bg-white/40 border-slate-200 backdrop-blur-md"}`}>
              <FaRocket size={80} className="text-blue-500 group-hover:scale-110 transition-transform duration-700 rotate-12 group-hover:rotate-0" />
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="events" title="Events" subtitle="Meet the Community" icon={FaCalendarAlt} darkMode={darkMode}>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          {[
            { title: "Student Meet 2026", date: "June 15, 2026", type: "Conference" },
            { title: "Innovation Day", date: "April 20, 2026", type: "Workshop" },
            { title: "Student Gala", date: "Aug 10, 2026", type: "Social" }
          ].map((ev, i) => (
            <div key={i} className="p-px bg-gradient-to-b from-blue-500/30 to-transparent rounded-[2rem] hover:from-blue-500 transition-all group">
              <div className={`h-full p-8 rounded-[calc(2rem-1px)] relative overflow-hidden ${darkMode ? "bg-slate-950" : "bg-white"}`}>
                <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">{ev.type}</p>
                <h3 className={`text-xl font-black mb-4 italic ${darkMode ? "text-white" : "text-slate-950"}`}>{ev.title}</h3>
                <p className={`text-[9px] font-bold uppercase tracking-widest mb-6 ${darkMode ? "text-white/40" : "text-slate-400"}`}>{ev.date}</p>
                <button onClick={handleActionClick} className={`text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2.5 group-hover:text-blue-500 transition-colors ${darkMode ? "text-white" : "text-slate-950"}`}>
                  RSVP NOW <ArrowRight size={12} className="text-blue-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper id="testimonials" title="Stories" subtitle="Voices of Impact" icon={FaQuoteLeft} darkMode={darkMode}>
        <div className="max-w-2xl mx-auto text-center space-y-8 py-6">
          <FaQuoteLeft size={40} className="text-blue-500 opacity-20 mx-auto" />
          <p className={`text-xl md:text-3xl font-black leading-tight italic ${darkMode ? "text-white/90" : "text-slate-900"}`}>
            "Authentic connections are the foundation of any great career. This portal makes it effortless."
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="w-12 h-12 p-px bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
                <User size={20} className="text-slate-400" />
              </div>
            </div>
            <div className="text-left">
              <p className={`font-black uppercase tracking-widest text-[10px] ${darkMode ? "text-white" : "text-slate-950"}`}>Manish Chandra Deorari</p>
              <p className={`font-bold uppercase tracking-widest text-[8px] ${darkMode ? "text-white" : "text-slate-900"}`}>MCA - 2024-26</p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="contact" title="Connect" subtitle="Reach Out" icon={Mail} darkMode={darkMode}>
        <div className="max-w-xl mx-auto text-center">
          <p className={`mb-8 font-bold uppercase tracking-widest text-[10px] italic ${darkMode ? "text-white/40" : "text-slate-500"}`}>
            Have questions about registration or events?
          </p>
          <form onSubmit={handleContactSubmit} className="flex flex-col sm:flex-row items-stretch gap-4">
            <div className="flex-1 p-px bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 rounded-2xl focus-within:from-blue-500 focus-within:to-purple-500 transition-all">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className={`w-full px-6 py-4 rounded-[calc(1rem-1px)] text-xs font-black outline-none border-none ${darkMode ? "bg-black text-white" : "bg-white text-slate-950"}`}
              />
            </div>
            <button
              type="submit"
              disabled={isSending}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-4xl active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSending ? "..." : "Send Request"}
            </button>
          </form>
        </div>
      </SectionWrapper>

      <footer className={`py-16 border-t transition-colors duration-700 ${darkMode ? "bg-black text-white border-white/5" : "bg-slate-50 text-slate-900 border-slate-200"}`}>
        <div className="max-w-5xl mx-auto px-6 flex flex-col lg:flex-row justify-between items-center gap-10 text-center lg:text-left">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-3">STUDENT PORTAL</h1>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] max-w-sm ${darkMode ? "text-white/20" : "text-slate-400"}`}>
                Empowering university students through a premium digital ecosystem.
              </p>
            </div>
            <div className="flex justify-center lg:justify-start gap-6">
              {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                <Icon key={i} className="text-xl hover:text-blue-500 transition-all cursor-pointer transform hover:scale-110" />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center lg:items-end">
            <div className="p-px bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-6 shadow-3xl">
              <div className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest italic ${darkMode ? "bg-black" : "bg-white"}`}>
                Graphic ERA Hill University
              </div>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.6em] text-white/50">
              © 2025 ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4">
        <div className="p-[1.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2rem] shadow-xl">
          <button
            onClick={toggleDarkMode}
            className={`p-5 rounded-[calc(2rem-1.5px)] backdrop-blur-xl transition-all duration-700 hover:scale-105 active:scale-90 ${darkMode ? "bg-black/60 text-yellow-400" : "bg-white/80 text-slate-900"}`}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </div>
    </TubesBackground>
  );
}
