"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";

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
  const finalUnoptimized = unoptimized !== undefined ? unoptimized : imageSrc.includes("default-profile.jpg");

  return (
    <div
      className={`relative inline-flex flex-shrink-0 ${wrapperClassName}`}
      style={{ overflow: 'visible' }}
      onClick={onClick}
    >
      <Image
        src={imageSrc}
        alt={alt || user?.name || "User Avatar"}
        width={width || 48}
        height={height || 48}
        className={className}
        unoptimized={finalUnoptimized}
        {...props}
      />
      {showBadge && !hideBadge && (
        <span
          className="absolute bottom-0 right-0 z-30 pointer-events-none flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-white dark:border-slate-800 shadow-md"
          title="100% Profile Completed"
          style={{
            width: '1.1rem',
            height: '1.1rem',
            transform: 'translate(30%, 30%)',
            overflow: 'visible',
          }}
        >
          <BadgeCheck className="text-green-500" style={{ width: '100%', height: '100%' }} />
        </span>
      )}
    </div>
  );
}
