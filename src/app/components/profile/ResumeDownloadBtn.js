"use client";
import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ResumePDF from './ResumePDF';
import { Download } from 'lucide-react';

export default function ResumeDownloadBtn({ profile, darkMode }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>;
  }

    return (
        <div className="w-full mt-6 mb-2 flex justify-center">
            <div className="w-full sm:w-2/3 p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <PDFDownloadLink
                    document={<ResumePDF profile={profile} />}
                    fileName={`${profile.name?.replace(/\s+/g, '_') || 'User'}_Resume.pdf`}
                    className={`flex items-center justify-center gap-4 px-6 py-4 rounded-[calc(1rem-2px)] w-full h-full ${darkMode ? 'bg-slate-900 hover:bg-slate-800' : 'bg-white hover:bg-gray-50'}`}
                >
                    {({ blob, url, loading, error }) => (
                        <>
                            <div className={`p-3 rounded-full ${darkMode ? 'bg-slate-800' : 'bg-gray-100'} shadow-sm`}>
                                {loading ? (
                                    <Download className="w-6 h-6 animate-pulse text-purple-500" />
                                ) : (
                                    <Download className="w-6 h-6 text-purple-600" />
                                )}
                            </div>
                            <div className="text-left">
                                <h3 className={`text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 ${loading ? 'animate-pulse' : ''}`}>
                                    {loading ? 'Generating PDF...' : '🪄 Auto-Generate PDF Resume'}
                                </h3>
                                <p className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Instantly builds a beautiful 1-page resume from your profile
                                </p>
                            </div>
                        </>
                    )}
                </PDFDownloadLink>
            </div>
        </div>
    );
}
