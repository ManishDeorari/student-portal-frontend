"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { getProxiedMediaUrl } from "@/app/utils/mediaProxy";

export default function UserAvatar({ user, src, alt, width, height, className = "", wrapperClassName = "", onClick, unoptimized, ...props }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setCurrentUser(JSON.parse(u));
    } catch (e) {}
  }, []);

  const isComplete = user?.profileCompletionAwarded === true;
  const showBadge = isComplete;

  const rawImageSrc = src || user?.profilePicture || "/default-profile.jpg";
  const imageSrc = getProxiedMediaUrl(rawImageSrc);
  const finalUnoptimized = unoptimized !== undefined ? unoptimized : imageSrc.includes("default-profile.jpg") || imageSrc.includes("/api/files/proxy");

  return (
    <div className={`relative inline-flex flex-shrink-0 ${wrapperClassName}`} onClick={onClick}>
      <Image
        src={imageSrc}
        alt={alt || user?.name || "User Avatar"}
        width={width || 48}
        height={height || 48}
        className={className}
        unoptimized={finalUnoptimized}
        {...props}
      />
      {showBadge && (
        <div 
          className="absolute bottom-0 right-0 translate-x-[15%] translate-y-[15%] bg-white dark:bg-slate-900 rounded-full flex items-center justify-center p-[2px] shadow-md z-20 border border-gray-100 dark:border-slate-700"
          title="100% Profile Completed"
        >
          <BadgeCheck className="text-green-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      )}
    </div>
  );
}
