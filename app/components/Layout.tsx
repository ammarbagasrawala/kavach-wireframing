"use client";

import React, { useState } from "react";
import { cn } from "./LoKeyButton";
import TopBar from "./TopBar";
import {
    LayoutDashboard,
    UserRoundCheck,
    ShieldCheck,
    History,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Fingerprint,
    Clock,
    Bell,
    Layers,
    Menu,
    X
} from "lucide-react";

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    collapsed?: boolean;
    onClick?: () => void;
    badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, collapsed, onClick, badge }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius-md)] transition-colors group relative",
                active
                    ? "bg-[var(--primary-500)] text-[var(--neutral-0)]"
                    : "text-[color-mix(in_srgb,var(--neutral-0)_70%,transparent)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--neutral-0)]"
            )}
        >
            <Icon className={cn("shrink-0", collapsed ? "w-[20px] h-[20px] mx-auto" : "w-[18px] h-[18px]")} />
            {!collapsed && <span className="text-[14px] font-600 tracking-tight">{label}</span>}

            {badge && !collapsed && (
                <span className="ml-auto bg-[var(--color-error-600)] text-white text-[10px] font-800 px-1.5 py-0.5 rounded-full ring-2 ring-[var(--sidebar-bg)]">
                    {badge}
                </span>
            )}

            {badge && collapsed && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-error-600)] rounded-full ring-1 ring-[var(--sidebar-bg)]" />
            )}

            {active && !collapsed && !badge && <div className="ml-auto w-1 h-4 bg-white rounded-full"></div>}
        </button>
    );
};

interface LayoutProps {
    children: React.ReactNode;
    currentPage?: string;
    productName?: string;
}

export default function Layout({ children, currentPage = "Dashboard", productName = "KAVACH" }: LayoutProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [requestCount, setRequestCount] = useState(0);

    React.useEffect(() => {
        const checkRequests = () => {
            const stored = localStorage.getItem("kavach_kyc_requests");
            if (stored) {
                const reqs = JSON.parse(stored);
                const pending = reqs.filter((r: any) => r.status === "pending").length;
                setRequestCount(pending);
            }
        };

        checkRequests();
        window.addEventListener("storage", checkRequests);
        return () => window.removeEventListener("storage", checkRequests);
    }, [currentPage]);

    const navItems = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { label: "Requests", icon: History, href: "/requests", badge: requestCount },
        { label: "Manage Credentials", icon: ShieldCheck, href: "/credentials" },
        { label: "Audit Logs", icon: Clock, href: "/audit-logs" },
        { label: "Navigator", icon: Layers, href: "/" },
    ];

    const handleLogout = () => {
        if (confirm("Are you sure you want to log out? This will clear your current session data.")) {
            localStorage.clear();
            window.location.href = "/onboarding";
        }
    };

    const bottomNavItems = [
        { label: "Settings", icon: Settings, href: "/settings" },
        { label: "Logout", icon: LogOut, onClick: handleLogout },
    ];

    return (
        <div className="flex h-screen w-full bg-[var(--background)] overflow-hidden flex-col lg:flex-row">
            {/* Mobile Header */}
            <header className="lg:hidden h-[60px] flex items-center justify-between px-4 bg-[var(--neutral-900)] border-b border-[rgba(255,255,255,0.08)] shrink-0 z-50">
                <div className="h-8 bg-white px-3 py-1 rounded-[var(--radius-sm)]">
                    <img src="/logo.png" alt="Kavach Logo" className="h-full w-auto object-contain" />
                </div>
                <div className="flex items-center gap-3">
                    <button className="text-[rgba(255,255,255,0.6)] p-2">
                        <Bell className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-500)] flex items-center justify-center text-white text-[12px] font-700">
                        JD
                    </div>
                </div>
            </header>

            {/* Desktop Sidebar (Hidden on mobile) */}
            <aside
                className={cn(
                    "bg-[var(--neutral-900)] h-full flex flex-col transition-all duration-300 relative shrink-0 hidden lg:flex",
                    collapsed ? "w-[64px]" : "w-[280px]"
                )}
            >
                <div className="h-[56px] flex items-center px-4 border-b border-[rgba(255,255,255,0.08)]">
                    {!collapsed ? (
                        <div className="bg-white p-1.5 rounded-[var(--radius-md)] flex items-center justify-center h-10 w-full overflow-hidden">
                            <img src="/logo.png" alt="Kavach Logo" className="h-full w-auto object-contain" />
                        </div>
                    ) : (
                        <div className="bg-white p-1 rounded-[var(--radius-sm)] flex items-center justify-center w-10 h-10 mx-auto">
                            <img src="/logo.png" alt="Kavach Logo" className="h-full w-auto object-contain" />
                        </div>
                    )}
                </div>

                <div className="flex-1 py-6 px-3 flex flex-col gap-1">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.label}
                            {...item}
                            active={currentPage === item.label}
                            collapsed={collapsed}
                            onClick={() => window.location.href = (item as any).href}
                        />
                    ))}
                </div>

                <div className="p-3 flex flex-col gap-1 border-t border-[rgba(255,255,255,0.08)]">
                    {bottomNavItems.map((item) => (
                        <NavItem
                            key={item.label}
                            {...item}
                            collapsed={collapsed}
                            onClick={item.onClick || (() => window.location.href = (item as any).href)}
                        />
                    ))}
                </div>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-[72px] w-6 h-6 bg-[var(--card)] border border-[var(--border)] rounded-full flex items-center justify-center shadow-elevation-sm z-20 text-[var(--muted-foreground)] hover:text-[var(--primary-500)]"
                >
                    {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-[70px] lg:pb-0">
                <TopBar productName={productName} className="hidden lg:flex" />
                <div className="flex-1 overflow-y-auto w-full">
                    {children}
                </div>
            </div>

            {/* Mobile Side Drawer (only visible when open) */}
            {isDrawerOpen && (
                <div className="lg:hidden fixed inset-0 z-[100] animate-in fade-in duration-300">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsDrawerOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="absolute top-0 right-0 w-[280px] h-full bg-[var(--neutral-900)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <span className="text-[16px] font-800 text-white uppercase tracking-widest">More Menu</span>
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="p-2 rounded-full hover:bg-white/10 text-white/60 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 custom-scrollbar">
                            {navItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => {
                                        window.location.href = (item as any).href;
                                        setIsDrawerOpen(false);
                                    }}
                                    className={cn(
                                        "px-6 py-4 flex items-center gap-4 transition-colors",
                                        currentPage === item.label ? "bg-[var(--primary-500)] text-white" : "text-white/70 hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="text-[15px] font-700">{item.label}</span>
                                    {item.badge && (
                                        <span className="ml-auto bg-[var(--color-error-600)] text-white text-[10px] font-900 w-5 h-5 rounded-full flex items-center justify-center">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            ))}

                            <div className="mt-8 px-6 pt-6 border-t border-white/10 flex flex-col gap-4">
                                <button className="flex items-center gap-4 text-white/50 text-[14px] font-600 py-2">
                                    <ShieldCheck className="w-5 h-5" />
                                    Privacy Settings
                                </button>
                                <button
                                    onClick={() => {
                                        localStorage.clear();
                                        window.location.href = "/";
                                    }}
                                    className="flex items-center gap-4 text-[var(--color-error-600)] text-[14px] font-700 py-2"
                                >
                                    <X className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </div>

                        <div className="p-6 bg-black/20 text-white/30 text-[11px] font-600 italic">
                            Kavach Version 1.2.0 • Secured by RBI
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[70px] bg-[var(--neutral-900)] border-t border-[rgba(255,255,255,0.08)] px-4 flex items-center justify-around z-50">
                {navItems.filter(item => ["Dashboard", "Requests", "Manage Credentials"].includes(item.label)).map((item) => (
                    <button
                        key={item.label}
                        onClick={() => window.location.href = (item as any).href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 min-w-[60px] pb-1 transition-all relative",
                            currentPage === item.label ? "text-[var(--primary-500)]" : "text-[rgba(255,255,255,0.6)]"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[9px] font-800 uppercase tracking-tighter text-center leading-none px-1">
                            {item.label === "Manage Credentials" ? "Vault" : item.label}
                        </span>
                        {item.badge && (
                            <span className="absolute top-[2px] right-2 bg-[var(--color-error-600)] text-white text-[9px] font-900 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[var(--neutral-900)] shadow-lg animate-in zoom-in duration-300">
                                {item.badge}
                            </span>
                        )}
                        {currentPage === item.label && (
                            <div className="absolute -bottom-2 w-6 h-1 bg-[var(--primary-500)] rounded-full" />
                        )}
                    </button>
                ))}
                <button
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 min-w-[60px] pb-1 transition-all relative",
                        ["Audit Logs", "Settings"].includes(currentPage) || isDrawerOpen ? "text-[var(--primary-500)]" : "text-[rgba(255,255,255,0.6)]"
                    )}
                    onClick={() => setIsDrawerOpen(true)}
                >
                    <Menu className="w-5 h-5" />
                    <span className="text-[9px] font-800 uppercase tracking-tighter">More</span>
                    {((["Audit Logs", "Settings"].includes(currentPage)) || isDrawerOpen) && (
                        <div className="absolute -bottom-2 w-6 h-1 bg-[var(--primary-500)] rounded-full" />
                    )}
                </button>
            </nav>
        </div >
    );
}
