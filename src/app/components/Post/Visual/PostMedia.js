"use client";
import React from "react";
import Image from "next/image";
import ImageGallery from "../utils/ImageGallery";
import FullImageViewer from "../utils/FullImageViewer";
import { downloadFileSilently, getOptimizedImageUrl } from "../../../utils/cloudinaryHelper";

const getDocumentIcon = (filename) => {
  if (!filename) return "📄";
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) return "📕";
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return "📘";
  if (lower.endsWith('.xls') || lower.endsWith('.xlsx') || lower.endsWith('.csv')) return "📗";
  if (lower.endsWith('.ppt') || lower.endsWith('.pptx')) return "📙";
  if (lower.endsWith('.txt')) return "📝";
  return "📄";
};

export default function PostMedia({ post, setSelectedImage, currentUser, darkMode = false }) {
  if (!(post.images?.length > 0 || post.video || post.image || post.documents?.length > 0)) return null;

  const isRestricted = post.user?._id !== currentUser?._id && currentUser?.role !== 'admin';

  return (
    <div className="mt-2">
      {/* Multiple Images */}
      {post.images?.length > 0 && (
        <ImageGallery
          images={post.images}
          onImageClick={setSelectedImage}
          isRestricted={isRestricted} // Assuming ImageGallery might use it
        />
      )}

      {/* Single fallback image (older posts) */}
      {!post.images?.length && post.image && (
        <div 
          onClick={() => setSelectedImage(0)}
          className={`relative max-h-96 w-full flex justify-center border ${darkMode ? "border-white/10" : "border-gray-200"} rounded-lg overflow-hidden cursor-pointer group`}
        >
          <Image
            src={post.image}
            alt="post"
            width={800}
            height={400}
            onContextMenu={(e) => isRestricted && e.preventDefault()}
            onDragStart={(e) => isRestricted && e.preventDefault()}
            className={`rounded-lg max-h-96 w-full object-contain ${isRestricted ? 'select-none' : ''} transition-transform group-hover:scale-[1.01]`}
          />
          {/* Protective Overlay */}
          {isRestricted && (
            <div
              className="absolute inset-0 z-10"
              onContextMenu={(e) => e.preventDefault()}
            />
          )}
        </div>
      )}

      {/* Video */}
      {post.video?.url && (
        <video
          controls
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => isRestricted && e.preventDefault()}
          className={`rounded-lg w-full max-h-96 border ${darkMode ? "border-white/10" : "border-gray-200"} mt-2 ${isRestricted ? 'select-none' : ''}`}
          controlsList={isRestricted ? "nodownload" : ""}
        >
          <source src={post.video.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Documents */}
      {post.documents?.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {post.documents.map((doc, index) => (
            <div key={index} className={`p-[1.5px] rounded-2xl bg-gradient-to-tr from-blue-400 to-purple-500 shadow-sm transition-transform hover:scale-[1.02] group/doc cursor-pointer`}
                 onClick={(e) => {
                   e.stopPropagation();
                   downloadFileSilently(doc.url, doc.original_filename);
                 }}
            >
              <div className={`flex items-center justify-between p-3 rounded-[calc(1rem-1.5px)] ${darkMode ? "bg-[#121213]" : "bg-white"}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner ${darkMode ? "bg-slate-800" : "bg-gray-50"}`}>
                    {getDocumentIcon(doc.original_filename)}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className={`text-sm font-black truncate tracking-tight ${darkMode ? "text-white" : "text-gray-800"}`}>
                      {doc.original_filename || `Document ${index + 1}`}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                      {doc.format || 'FILE'} • Download
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 text-white shadow-md transform group-hover/doc:translate-y-1 transition-transform">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
