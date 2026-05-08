"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGlobe, FaCalendarAlt, FaQuoteLeft, FaRocket } from "react-icons/fa";
import { Mail, ArrowRight, ShieldCheck, ChevronDown, Monitor, Moon, Sun, User } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "./components/ui/ThemeToggle";

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
        {subtitle && <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-blue-300">{subtitle}</p>}
      </div>

      <div className="p-[2px] md:p-[2.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-blue-500/10">
        <div className={`transition-all duration-500 ${darkMode ? "bg-slate-900/20 sm:bg-slate-900/60" : "bg-white/20 sm:bg-white/60"} backdrop-blur-lg sm:backdrop-blur-3xl rounded-[calc(2.5rem-2.5px)] p-8 md:p-12`}>
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
    <div className="relative min-h-screen bg-background overflow-hidden selection:bg-white/20">
      {/* 🎬 Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
      </video>

      {/* 🚀 Navigation Bar */}
      <nav className="relative z-10 flex flex-row justify-between px-8 py-6 max-w-7xl mx-auto items-center">
        <div className="flex items-center gap-1 group cursor-pointer">
          <h1 className="text-3xl tracking-tight text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Velorah<sup className="text-xs">®</sup>
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-10">
          {["Home", "Studio", "About", "Journal", "Reach Us"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`text-sm tracking-tight transition-colors duration-300 ${item === "Home" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {item}
            </a>
          ))}
          <button className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform duration-300">
            Begin Journey
          </button>
        </div>
      </nav>

      {/* 🌌 Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 py-[90px] min-h-[90vh]">
        <motion.h1 
          className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal text-foreground animate-fade-rise"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where <em className="not-italic text-muted-foreground">dreams</em> rise <em className="not-italic text-muted-foreground">through the silence.</em>
        </motion.h1>
        
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
          We&apos;re designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we build digital spaces for sharp focus and inspired work.
        </p>

        <button className="liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 hover:scale-[1.03] cursor-pointer transition-transform duration-300 animate-fade-rise-delay-2">
          Begin Journey
        </button>
      </section>

      {/* Existing Content Sections Wrapper */}
      <div className="relative z-10 bg-background/50 backdrop-blur-sm">

      {/* 🔷 Sections - Sizing and containers optimized for performance */}
      <SectionWrapper id="about" title="Our Mission" subtitle="Community First" icon={FaGlobe} darkMode={darkMode}>
        <div className="grid md:grid-cols-2 gap-10 items-center text-left">
          <div className={`space-y-6 text-lg md:text-xl font-bold leading-relaxed ${darkMode ? "text-white" : "text-slate-800"}`}>
            <p>
              Empowering graduates through technology, mentorship, and global professional networking.
            </p>
            <p className={`text-base font-medium leading-loose ${darkMode ? "text-white/70" : "text-slate-700"}`}>
              The Student Portal serves as the primary bridge between university life and professional success. We provide tools for seamless networking and career acceleration.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className={`px-6 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest ${darkMode ? "bg-white/5 border-white/10 text-blue-400" : "bg-slate-50 border-slate-200 text-blue-700"}`}>✨ Global Elite</div>
              <div className={`px-6 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest ${darkMode ? "bg-white/5 border-white/10 text-purple-400" : "bg-slate-50 border-slate-200 text-purple-700"}`}>🔥 Future Proof</div>
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
                <p className="text-blue-500 text-xs font-black uppercase tracking-[0.3em] mb-3">{ev.type}</p>
                <h3 className={`text-2xl font-black mb-4 italic ${darkMode ? "text-white" : "text-slate-950"}`}>{ev.title}</h3>
                <p className={`text-xs font-bold uppercase tracking-widest mb-8 ${darkMode ? "text-white/60" : "text-slate-600"}`}>{ev.date}</p>
                <button onClick={handleActionClick} className={`text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 group-hover:text-blue-500 transition-colors ${darkMode ? "text-white" : "text-slate-950"}`}>
                  RSVP NOW <ArrowRight size={14} className="text-blue-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper id="testimonials" title="Stories" subtitle="Voices of Impact" icon={FaQuoteLeft} darkMode={darkMode}>
        <div className="max-w-2xl mx-auto text-center space-y-8 py-6">
          <FaQuoteLeft size={40} className="text-blue-500 opacity-20 mx-auto" />
          <p className={`text-xl md:text-3xl font-black leading-tight italic ${darkMode ? "text-white" : "text-slate-950"}`}>
            "Authentic connections are the foundation of any great career. This portal makes it effortless."
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="w-12 h-12 p-px bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
                <User size={20} className="text-slate-400" />
              </div>
            </div>
            <div className="text-left">
              <p className={`font-black uppercase tracking-widest text-xs ${darkMode ? "text-white" : "text-slate-950"}`}>Manish Chandra Deorari</p>
              <p className={`font-bold uppercase tracking-widest text-[10px] ${darkMode ? "text-white/60" : "text-slate-600"}`}>MCA - 2024-26</p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="contact" title="Connect" subtitle="Reach Out" icon={Mail} darkMode={darkMode}>
        <div className="max-w-xl mx-auto text-center">
          <p className={`mb-10 font-bold uppercase tracking-widest text-xs italic ${darkMode ? "text-white/60" : "text-slate-600"}`}>
            Have questions about registration or events?
          </p>
          <form onSubmit={handleContactSubmit} className="flex flex-col sm:flex-row items-stretch gap-4">
            <div className="flex-1 p-px bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 rounded-2xl focus-within:from-blue-500 focus-within:to-purple-500 transition-all">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className={`w-full px-8 py-5 rounded-[calc(1rem-1px)] text-sm font-black outline-none border-none ${darkMode ? "bg-black text-white" : "bg-white text-slate-950"}`}
              />
            </div>
            <button
              type="submit"
              disabled={isSending}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-4xl active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSending ? "..." : "Send Request"}
            </button>
          </form>
        </div>
      </SectionWrapper>

      <footer className={`py-20 border-t transition-colors duration-700 ${darkMode ? "bg-black text-white border-white/5" : "bg-slate-50 text-slate-900 border-slate-200"}`}>
        <div className="max-w-[96%] mx-auto px-6 flex flex-col lg:flex-row justify-between items-center gap-12 text-center lg:text-left">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4">STUDENT PORTAL</h1>
              <p className={`text-sm font-black uppercase tracking-[0.2em] max-w-sm ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                Empowering university students through a premium digital ecosystem.
              </p>
            </div>
            <div className="flex justify-center lg:justify-start gap-8">
              {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                <Icon key={i} className="text-2xl hover:text-blue-500 transition-all cursor-pointer transform hover:scale-110" />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center lg:items-end">
            <div className="p-px bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-8 shadow-3xl">
              <div className={`px-10 py-3 rounded-full text-[12px] md:text-[13px] font-black uppercase tracking-widest italic ${darkMode ? "bg-black" : "bg-white"}`}>
                Graphic ERA Hill University
              </div>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.6em] text-white/40">
              © 2025 ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      </footer>

      </div>

      <ThemeToggle />
    </div>
  );
}

