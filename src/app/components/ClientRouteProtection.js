"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoginPopup from "./LoginPopup";

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/signup"];

const ClientRouteProtection = ({ children }) => {
    const pathname = usePathname();
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if current path is public
        const isPublic = PUBLIC_ROUTES.includes(pathname);

        // Check if user is authenticated
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (!isPublic && !token) {
            setShowPopup(true);
        } else {
            setShowPopup(false);
        }

        setIsLoading(false);
    }, [pathname]);

    if (isLoading) {
        // Optional: returns a spinner or null while checking. 
        // Returning null prevents flash of content but might delay rendering.
        // For a popup overlay approach, we can verify authentication and just overlay the popup 
        // so we don't strictly *need* to block rendering, but blocking is safer behaviorally.
        // However, the user asked for a "popup window/div", implying the background *might* be visible or just overlaid.
        return null;
    }

    return (
        <>
            {showPopup && <LoginPopup />}
            {/* If I want to block content completely I could condition children here, 
          but usually popup overlay is enough if it blocks interaction (z-index).
          LoginPopup has fixed inset-0 and z-[9999] so it acts as a blocking overlay.
      */}
            {!showPopup && children}
            {showPopup && <div className="blur-sm pointer-events-none">{children}</div>}
            {/* 
          I'll modify to: Show children always, but if showPopup is true, 
          maybe blur the children or just rely on LoginPopup backdrop.
          Option A: Render LoginPopup AND Children (blurred).
      */}
        </>
    );
};

export default function RouteProtectionWrapper({ children }) {
    const pathname = usePathname();
    const [isProtected, setIsProtected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const isPublic = PUBLIC_ROUTES.includes(pathname);
        if (!isPublic && !token) {
            setIsProtected(true);
        } else {
            setIsProtected(false);
        }
    }, [pathname]);

    if (isProtected) {
        return (
            <>
                <LoginPopup />
                <div style={{ filter: "blur(8px)", pointerEvents: "none", userSelect: "none" }}>
                    {children}
                </div>
            </>
        );
    }

    return <>{children}</>;
}
