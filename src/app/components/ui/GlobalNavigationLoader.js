"use client";

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LoadingOverlay from './LoadingOverlay';

export default function GlobalNavigationLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [isNavigating, setIsNavigating] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const navigationStartTime = useRef(null);
    const MIN_DURATION = 800; // 0.8 seconds for a premium reveal feel

    // When navigation completes (pathname or searchParams change)
    useEffect(() => {
        if (isNavigating) {
            const elapsed = Date.now() - navigationStartTime.current;
            const remaining = Math.max(0, MIN_DURATION - elapsed);

            const timer = setTimeout(() => {
                setIsNavigating(false);
                setShowLoader(false);
                navigationStartTime.current = null;
            }, remaining);

            return () => clearTimeout(timer);
        }
    }, [pathname, searchParams]);

    // Global click listener to detect internal navigations
    useEffect(() => {
        const handleClick = (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                try {
                    const url = new URL(link.href);
                    // Only intercept internal links that are NOT the current page
                    const isInternal = url.origin === window.location.origin;
                    const isDifferentPath = url.pathname !== window.location.pathname || url.search !== window.location.search;
                    const isNotSpecial = !link.hasAttribute('download') && link.target !== '_blank';

                    if (isInternal && isDifferentPath && isNotSpecial) {
                        navigationStartTime.current = Date.now();
                        setIsNavigating(true);
                        // Delay visible show slightly to avoid flickering for ultra-fast cache hits
                        const showTimer = setTimeout(() => {
                            if (navigationStartTime.current) {
                                setShowLoader(true);
                            }
                        }, 50); 
                        
                        return () => clearTimeout(showTimer);
                    }
                } catch (err) {
                    // Ignore invalid URLs
                }
            }
        };

        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    }, []);

    return <LoadingOverlay isVisible={showLoader} type="page" message="Synchronizing Page..." />;
}
