"use client";
import React from "react";
import Image from "next/image";
import ImageGallery from "../utils/ImageGallery";
import FullImageViewer from "../utils/FullImageViewer";
import { downloadFileSilently, getOptimizedImageUrl } from "../../../utils/cloudinaryHelper";

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
        <div className="mt-3 flex flex-col gap-2">
          {post.documents.map((doc, index) => (
            <div key={index} className="flex gap-2 w-full sm:w-auto items-center justify-between p-3 rounded-xl border border-gray-200 shadow-sm transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-2xl">📄</span>
                <span className={`text-sm font-bold truncate ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                  {doc.original_filename || `Document ${index + 1}`}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadFileSilently(doc.url, doc.original_filename);
                }}
                className={`text-xs font-black uppercase px-3 py-1 rounded-full ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
