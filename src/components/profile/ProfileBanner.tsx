import React from 'react';
import { cn } from "@/lib/utils";

interface ProfileBannerProps {
    className?: string;
    coverImage?: string;
}

export const ProfileBanner: React.FC<ProfileBannerProps> = ({ className, coverImage }) => {
    return (
        <div className={cn("relative w-full h-48 sm:h-64 bg-linear-to-r from-blue-600 to-indigo-600 overflow-hidden", className)}>
            {coverImage ? (
                <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover filter brightness-50"
                />
            ) : (
                // Fallback decorative pattern
                <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="white" strokeWidth="1" fill="none" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                    </svg>
                </div>
            )}

        </div>
    );
};
