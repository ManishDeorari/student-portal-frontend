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
    <div className="p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg">
        <PDFDownloadLink
            document={<ResumePDF profile={profile} />}
            fileName={`${profile.name?.replace(/\s+/g, '_') || 'User'}_Resume.pdf`}
            className={`p-3 sm:p-2 rounded-[calc(9999px-2px)] transition-all hover:scale-105 flex items-center justify-center ${darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
            title="Download Resume PDF"
        >
            {({ blob, url, loading, error }) =>
                loading ? <Download className="w-5 h-5 sm:w-5 sm:h-5 animate-pulse opacity-50" /> : <Download className="w-5 h-5 sm:w-5 sm:h-5 text-blue-500" />
            }
        </PDFDownloadLink>
    </div>
  );
}
