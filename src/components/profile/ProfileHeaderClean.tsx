import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, MapPin, School, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
    user: {
        firstName: string;
        lastName: string;
        email: string;
        avatar: string;
        university: string;
        graduationYear: string;
        major: string;
        isVerified: boolean;
        totalSavings: number;
        dealsUsed: number;
        membershipTier: string;
        joinDate: string;
    };
}

export const ProfileHeaderClean: React.FC<ProfileHeaderProps> = ({ user }) => {
    return (
        <div className="bg-white rounded-xl p-6 border border-neutral-lighter mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm">
            <div className="relative">
                <Avatar className="w-20 h-20 border-2 border-neutral-100">
                    <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback className="text-xl font-bold bg-brand-primary/10 text-brand-primary">
                        {user.firstName[0]}{user.lastName[0]}
                    </AvatarFallback>
                </Avatar>
                {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                        <BadgeCheck className="w-5 h-5 text-brand-primary fill-brand-primary/10" />
                    </div>
                )}
            </div>

            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-text-primary">
                        {user.firstName} {user.lastName}
                    </h1>
                    {/* Optional: Tier Badge */}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                    {user.university && (
                        <div className="flex items-center gap-1.5">
                            <School className="w-4 h-4" />
                            {user.university}
                        </div>
                    )}
                    {user.major && (
                        <div className="flex items-center gap-1.5 sm:flex">
                            <MapPin className="w-4 h-4" />
                            {user.major}
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        Joined {new Date(user.joinDate).getFullYear()}
                    </div>
                </div>
            </div>

            {/* Stats - Compact */}
            <div className="flex items-center gap-6 border-l border-neutral-lighter pl-6 md:flex">
                <div className="text-center">
                    <div className="text-xl font-bold text-text-primary">{user.dealsUsed}</div>
                    <div className="text-xs text-text-secondary uppercase tracking-wider">Deals Used</div>
                </div>
                {/* <div className="text-center">
                    <div className="text-xl font-bold text-text-primary">{user.totalSavings}</div>
                    <div className="text-xs text-text-secondary uppercase tracking-wider">Saved</div>
                </div> */} 
                {/* TODO: Make this a stat for coupons instead of savings e.g deals used vs active coupons */}
            </div>
        </div>
    );
};
