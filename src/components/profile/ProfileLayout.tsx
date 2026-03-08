import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, Shield, BadgeCheck, Gift, Bookmark, Settings, LogOut } from "lucide-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        href: string;
        title: string;
        icon: React.ReactNode;
        id: string; // matches the tab value
    }[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function SidebarNav({ className, items, activeTab, onTabChange, ...props }: SidebarNavProps) {
    return (
        <nav
            className={cn(
                "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2 lg:pb-0",
                className
            )}
            {...props}
        >
            {items.map((item) => (
                <Button
                    key={item.href}
                    variant="ghost"
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                        "justify-start hover:bg-transparent hover:underline",
                        activeTab === item.id
                            ? "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/10 hover:no-underline font-semibold"
                            : "hover:bg-neutral-lighter hover:no-underline text-text-secondary transform transition-colors",
                        "w-full px-4 py-2 h-10 rounded-lg flex items-center gap-3 transition-all duration-200"
                    )}
                >
                    <span className={cn(
                        "transition-colors",
                        activeTab === item.id ? "text-brand-primary" : "text-neutral-medium"
                    )}>
                        {item.icon}
                    </span>
                    {item.title}
                </Button>
            ))}
        </nav>
    );
}

interface ProfileLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    user?: any; // strict typing can be added if User type is available globally
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children, activeTab, onTabChange, user }) => {
    const sidebarItems = [
        {
            title: "Account",
            icon: <Shield size={18} />,
            href: "/profile?tab=account",
            id: "account",
        },
        {
            title: "Verification",
            icon: <BadgeCheck size={18} />,
            href: "/profile?tab=verification",
            id: "verification",
        },
        {
            title: "Coupons",
            icon: <Gift size={18} />,
            href: "/profile?tab=coupons",
            id: "coupons",
        },
        {
            title: "Saved Deals",
            icon: <Bookmark size={18} />,
            href: "/profile?tab=saved",
            id: "saved",
        },
        {
            title: "Settings",
            icon: <Settings size={18} />,
            href: "/profile?tab=preferences",
            id: "preferences",
        },
    ];

    return (
        <div className="min-h-screen bg-background-lighter">
            {/* Mobile Header / Title - visible only on small screens if needed, 
                but usually global header handles this. We might add a specific "Profile" title here. 
            */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row lg:space-x-12 lg:space-y-0">
                    <aside className="lg:w-1/5 xl:w-1/6">
                        <div className="sticky top-24">
                            <div className="mb-6 px-2">
                                <h2 className="text-2xl font-bold tracking-tight text-text-primary">Settings</h2>
                                <p className="text-sm text-text-secondary">Manage your account</p>
                            </div>
                            <SidebarNav
                                items={sidebarItems}
                                activeTab={activeTab}
                                onTabChange={onTabChange}
                            />
                        </div>
                    </aside>
                    <div className="flex-1 lg:max-w-4xl">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
