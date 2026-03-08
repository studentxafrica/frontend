import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, MapPin, Calendar, Link as LinkIcon, Pencil, Check, X, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import axiosInstance from '@/api/axios';
import { toast } from '@/hooks/use-toast';

interface ProfileInfoSidebarProps {
    user: {
        firstName: string;
        lastName: string;
        avatar: string;
        university?: string;
        major?: string;
        joinDate: string;
        isVerified: boolean;
        dealsUsed: number;
        totalSavings: number;
        website?: string;
        bio?: string;
    };
    onEditProfile?: () => void;
}

export const ProfileInfoSidebar: React.FC<ProfileInfoSidebarProps> = ({ user, onEditProfile }) => {
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioValue, setBioValue] = useState(user.bio || '');
    const [savingBio, setSavingBio] = useState(false);

    const handleSaveBio = async () => {
        try {
            setSavingBio(true);
            const response = await axiosInstance.put('/user/me', {
                bio: bioValue || undefined,
            });
            if (response.status !== 200) {
                throw new Error('Failed to update bio');
            }
            user.bio = bioValue;
            setIsEditingBio(false);
            toast({ title: 'Bio updated', description: 'Your bio has been saved.', variant: 'default' });
        } catch (error: any) {
            toast({
                title: error.response?.data?.message || 'Update failed',
                description: 'Could not save your bio. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setSavingBio(false);
        }
    };

    const handleCancelBio = () => {
        setBioValue(user.bio || '');
        setIsEditingBio(false);
    };

    return (
        <div className="flex flex-col gap-6 relative px-4 sm:px-0">
            {/* Avatar - overlaps banner */}
            <div className="mb-2">
                <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-white shadow-sm bg-slate-200">
                    <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback className="text-3xl font-bold bg-brand-primary/10 text-brand-primary">
                        {user.firstName[0]}{user.lastName[0]}
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* Identity */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-text-primary">
                        {user.firstName} {user.lastName}
                    </h1>
                    {user.isVerified && (
                        <BadgeCheck className="w-5 h-5 text-brand-primary fill-brand-primary/10" />
                    )}
                </div>
                <p className="text-text-secondary">@{user.firstName.toLowerCase()}{user.lastName.toLowerCase()}</p>
            </div>

            {/* Bio — inline editable */}
            {/* <div className="group">
                {isEditingBio ? (
                    <div className="space-y-2">
                        <Textarea
                            value={bioValue}
                            onChange={(e) => setBioValue(e.target.value)}
                            placeholder="Write a short bio..."
                            className="min-h-20 text-sm resize-none"
                            maxLength={160}
                            disabled={savingBio}
                            autoFocus
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-text-secondary">{bioValue.length}/160</span>
                            <div className="flex gap-1.5">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCancelBio}
                                    disabled={savingBio}
                                    className="h-7 px-2 text-xs"
                                >
                                    <X className="w-3 h-3 mr-1" />
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSaveBio}
                                    disabled={savingBio}
                                    className="h-7 px-2 text-xs bg-brand-primary hover:bg-brand-primary/90 text-white"
                                >
                                    {savingBio ? (
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    ) : (
                                        <Check className="w-3 h-3 mr-1" />
                                    )}
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        className="flex items-start gap-2 cursor-pointer rounded-md -mx-2 px-2 py-1 transition-colors hover:bg-neutral-100"
                        onClick={() => setIsEditingBio(true)}
                    >
                        <p className="text-text-primary leading-relaxed text-sm flex-1">
                            {user.bio || <span className="text-text-secondary italic">Add a bio...</span>}
                        </p>
                        <Pencil className="w-3.5 h-3.5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
                    </div>
                )}
            </div> */}

            {/* Stats */}
            <div className="flex gap-6 text-sm">
                <div className="flex gap-1.5">
                    <span className="font-bold text-text-primary">{user.dealsUsed}</span>
                    <span className="text-text-secondary">Deals Used</span>
                </div>
                <div className="flex gap-1.5">
                    <span className="font-bold text-text-primary">${user.totalSavings}</span>
                    <span className="text-text-secondary">Saved</span>
                </div>
            </div>

            {/* Meta Details */}
            <div className="flex flex-col gap-2 text-sm text-text-secondary">
                {user.university && (
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{user.university}</span>
                    </div>
                )}
                {user.website && (
                    <div className="flex items-center gap-2 hover:text-brand-primary cursor-pointer">
                        <LinkIcon className="w-4 h-4" />
                        <span className="truncate">{user.website}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(user.joinDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                </div>
            </div>


        </div>
    );
};
