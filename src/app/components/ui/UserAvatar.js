"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { getFocalImageUrl, getOptimizedImageUrl, getAvatarImageUrl } from "../../utils/cloudinaryHelper";

export default function UserAvatar({ user, src, alt, width, height, className = "", wrapperClassName = "", onClick, unoptimized, hideBadge = false, ...props }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setCurrentUser(JSON.parse(u));
    } catch (e) {}
  }, []);

  const isComplete = user?.profileCompletionAwarded === true;

  const imageSrc = src || user?.profilePicture || "/default-profile.jpg";
  const finalImageSrc = user?.profileImageFocus 
    ? getFocalImageUrl(imageSrc, width ? width * 2 : 200, height ? height * 2 : 200, user?.profileImageFocus)
    : (src ? src : getAvatarImageUrl(imageSrc, width ? width * 2 : 150));
  const finalUnoptimized = unoptimized !== undefined ? unoptimized : (typeof finalImageSrc === 'string' && finalImageSrc.includes("default-profile.jpg"));

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

    </div>
  );
}
