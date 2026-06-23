import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingOverlay({ isVisible, message = "Processing...", type = "overlay" }) {
    const { darkMode } = useTheme();

    const outerBg = type === "page" 
        ? "bg-[#020617]" 
        : (darkMode ? "bg-[#0f172a]/70 backdrop-blur-lg" : "bg-gray-900/40 backdrop-blur-md");

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`fixed inset-0 w-[100vw] h-[100dvh] ${outerBg} flex justify-center items-center z-[9999]`}
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: -10 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="p-[2.5px] bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)]"
                    >
                        <div className={`relative overflow-hidden flex flex-col items-center gap-6 ${darkMode ? 'bg-[#0f172a] text-white' : 'bg-white text-gray-900'} p-12 rounded-[calc(2.5rem-2.5px)]`}>
                        {/* ✅ Animated Accent Line */}
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "0%" }}
                            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
                        />
                        
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-150 animate-pulse"></div>
                            <div className="p-5 bg-gradient-to-tr from-blue-600/10 to-purple-600/10 rounded-full relative z-10">
                                <Loader2 className="w-16 h-16 text-blue-500 animate-spin stroke-[1.5]" />
                            </div>
                        </div>

                        <div className="text-center space-y-2 relative z-10">
                            <motion.h2 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-black tracking-[0.3em] uppercase text-sm"
                            >
                                {message.split(" ")[0]} <span className="text-blue-500">{message.split(" ").slice(1).join(" ")}</span>
                            </motion.h2>
                            <p className={`text-[10px] font-bold uppercase tracking-widest opacity-40`}>
                                Synchronizing Experience
                            </p>
                        </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
