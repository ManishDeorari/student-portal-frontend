"use client";

import React, { useEffect, useState } from "react";
import LoginPopup from "./LoginPopup";

const AuthGuard = ({ children }) => {
    // Synchronous initial check for client-side hydration
    const initialToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const [isAuthenticated, setIsAuthenticated] = useState(!!initialToken);
    const [isLoading, setIsLoading] = useState(false); // No spinner needed if we check sync

    useEffect(() => {
        // Double check in useEffect to handle storage changes or edge cases
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="relative min-h-screen w-full">
                {/* Show blurred background content or just the popup */}
                <LoginPopup />
            </div>
        );
    }

    return <>{children}</>;
};

export default AuthGuard;
