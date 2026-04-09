// frontend/src/app/components/groups/GroupAvatar.js
"use client";
import React from "react";

export default function GroupAvatar({ group, size = 48, className = "" }) {
    if (!group) return null;

    const { profileImage, profileImageSettings, name } = group;
    const imageUrl = profileImage || "/default-group.jpg";
    
    // Default settings if not present
    const settings = profileImageSettings || { x: 0, y: 0, width: 100, height: 100 };
    
    // If it's a default image or no settings, just show it normally
    const isDefault = imageUrl === "/default-group.jpg";
    
    return (
        <div 
            className={`relative rounded-full overflow-hidden flex-shrink-0 ${className}`}
            style={{ width: size, height: size }}
        >
            {isDefault ? (
                <img 
                    src={imageUrl} 
                    alt={name} 
                    className="w-full h-full object-cover"
                />
            ) : (
                <img 
                    src={imageUrl} 
                    alt={name} 
                    style={{
                        position: 'absolute',
                        width: (10000 / (settings.width || 100)) + "%",
                        height: (10000 / (settings.height || 100)) + "%",
                        left: (-(settings.x || 0) * 100 / (settings.width || 100)) + "%",
                        top: (-(settings.y || 0) * 100 / (settings.height || 100)) + "%",
                        maxWidth: 'none', // Important for Next.js or global styles
                        maxHeight: 'none'
                    }}
                />
            )}
        </div>
    );
}
