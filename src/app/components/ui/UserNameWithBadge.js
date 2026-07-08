"use client";
import React from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";

export default function UserNameWithBadge({ user, className = "", badgeClassName = "w-[1.1em] h-[1.1em] text-blue-500 shrink-0", onClick, href }) {
  if (!user) return null;

  const isAdminOrFaculty = user?.role === 'admin' || user?.role === 'faculty' || user?.isAdmin || user?.isMainAdmin;
  const isVerified = user?.profileCompletionAwarded === true && !isAdminOrFaculty;
  const innerContent = (
    <>
      <span className="truncate">{user.name || "Unknown User"}</span>
      {isVerified && (
        <div className="relative inline-flex items-center justify-center">
          <BadgeCheck className={badgeClassName} fill="currentColor" stroke="white" strokeWidth={2} />
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={`inline-flex items-center gap-1 min-w-0 max-w-full hover:text-blue-500 transition-colors ${className}`}>
        {innerContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`inline-flex items-center gap-1 min-w-0 max-w-full text-left hover:text-blue-500 transition-colors ${className}`}>
        {innerContent}
      </button>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 min-w-0 max-w-full ${className}`}>
      {innerContent}
    </span>
  );
}
