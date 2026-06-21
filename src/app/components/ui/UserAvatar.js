"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { getFocalImageUrl, getOptimizedImageUrl } from "../../utils/cloudinaryHelper";

export default function UserAvatar({ user, src, alt, width, height, className = "", wrapperClassName = "", onClick, unoptimized, hideBadge = false, ...props }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setCurrentUser(JSON.parse(u));
    } catch (e) {}
  }, []);

  const isComplete = user?.profileCompletionAwarded === true;
  const showBadge = isComplete;

  const imageSrc = src || user?.profilePicture || "/default-profile.jpg";
  const finalImageSrc = src ? src : (getFocalImageUrl(imageSrc, width ? width * 2 : 200, height ? height * 2 : 200, user?.profileImageFocus) || getOptimizedImageUrl(imageSrc));
  const finalUnoptimized = unoptimized !== undefined ? unoptimized : finalImageSrc.includes("default-profile.jpg");

  return (
    <div
      className={`relative inline-flex flex-shrink-0 items-center justify-center rounded-full aspect-square ${wrapperClassName}`}
      style={{ overflow: 'visible', ...(!wrapperClassName.includes('w-') ? { width: width || 48 } : {}), ...(!wrapperClassName.includes('h-') ? { height: height || 48 } : {}) }}
      onClick={onClick}
    >
      <Image
        src={finalImageSrc}
        alt={alt || user?.name || "User Avatar"}
        width={width || 48}
        height={height || 48}
        className={`rounded-full object-cover ${className}`}
        unoptimized={finalUnoptimized}
        {...props}
      />
      {showBadge && !hideBadge && (
        <span
          className="absolute z-30 pointer-events-none flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-800 shadow-md"
          title="100% Profile Completed"
          style={{
            width: '28%',
            height: '28%',
            minWidth: '1.1rem',
            minHeight: '1.1rem',
            maxWidth: '2.5rem',
            maxHeight: '2.5rem',
            bottom: '2%',
            right: '2%',
            overflow: 'visible',
          }}
        >
          <BadgeCheck className="text-green-500" style={{ width: '100%', height: '100%' }} />
        </span>
      )}
    </div>
  );
}
