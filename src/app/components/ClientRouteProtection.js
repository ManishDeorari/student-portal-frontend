"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoginPopup from "./LoginPopup";

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/signup"];

/**
 * RouteProtectionWrapper manages access to protected routes.
 * If a user tries to access a private route while unauthenticated,
 * it displays the LoginPopup and hides the main content to prevent "ghosting" or reflections.
 */
export default function RouteProtectionWrapper({ children }) {
    const pathname = usePathname();
    const [isProtected, setIsProtected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const isPublic = PUBLIC_ROUTES.includes(pathname);
            
            if (!isPublic && !token) {
                setIsProtected(true);
            } else {
                setIsProtected(false);
            }
            setIsLoading(false);
        };

        checkAuth();
        
        // Listen for auth changes (login/logout) to update protection status immediately
        window.addEventListener("local-auth-change", checkAuth);
        return () => window.removeEventListener("local-auth-change", checkAuth);
    }, [pathname]);

    if (isLoading) {
        return null;
    }

    if (isProtected) {
        return (
            <div className="relative min-h-screen">
                {/* 
                   We only render the LoginPopup here. 
                   Hiding the 'children' completely prevents the "reflection" issue 
                   where a blurred version of the page content appears behind the popup.
                */}
                <LoginPopup />
                
                {/* Optional: Add a placeholder background if LoginPopup's background isn't enough */}
                <div className="fixed inset-0 bg-[#0f172a] z-0" />
            </div>
        );
    }

    return <>{children}</>;
}
