"use client";

import React, { useState } from "react";
import { cn } from "./LoKeyButton";
import TopBar from "./TopBar";
import {
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Home
} from "lucide-react";

interface BankNavItem {
    key: string;
    label: string;
    icon: React.ElementType;
}

interface BankLayoutProps {
    children: React.ReactNode;
    currentPage: string;
    bankName: string;
    navItems: BankNavItem[];
    onNavClick: (key: string) => void;
    onLogout: () => void;
}

function getBankInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
    return name.slice(0, 2).toUpperCase() || "BK";
}

const NavButton: React.FC<{
    icon: React.ElementType;
    label: string;
    active: boolean;
    collapsed?: boolean;
    onClick: () => void;
}> = ({ icon: Icon, label, active, collapsed, onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius-md)] transition-colors",
            active ? "bg-[var(--primary-500)] text-[var(--neutral-0)]" : "text-[color-mix(in_srgb,var(--neutral-0)_70%,transparent)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--neutral-0)]"
        )}
    >
        <Icon className={cn("shrink-0", collapsed ? "w-[20px] h-[20px] mx-auto" : "w-[18px] h-[18px]")} />
        {!collapsed && <span className="text-[14px] font-600 tracking-tight">{label}</span>}
        {active && !collapsed && <div className="ml-auto w-1 h-4 bg-white rounded-full" />}
    </button>
);

export default function BankLayout({ children, currentPage, bankName, navItems, onNavClick, onLogout }: BankLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const initials = getBankInitials(bankName);

    return (
        <div className="flex h-screen w-full bg-[var(--background)] overflow-hidden flex-col lg:flex-row">
            {/* Mobile Header - bank identity */}
            <header className="lg:hidden h-[60px] flex items-center justify-between px-4 bg-[var(--neutral-900)] border-b border-[rgba(255,255,255,0.08)] shrink-0 z-50">
                <div className="h-8 bg-white px-3 py-1 rounded-[var(--radius-sm)]">
                    <img src="/logo.png" alt="Kavach Logo" className="h-full w-auto object-contain" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[12px] font-700 text-white leading-none">{bankName}</span>
                        <span className="text-[10px] text-white/60">Bank Officer</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-500)] flex items-center justify-center text-white text-[12px] font-700">
                        {initials}
                    </div>
                </div>
            </header>

            {/* Desktop Sidebar - bank nav only */}
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
                        <NavButton
                            key={item.key}
                            icon={item.icon}
                            label={item.label}
                            active={currentPage === item.key}
                            collapsed={collapsed}
                            onClick={() => onNavClick(item.key)}
                        />
                    ))}
                </div>

                <div className="p-3 flex flex-col gap-1 border-t border-[rgba(255,255,255,0.08)]">
                    <NavButton
                        icon={LogOut}
                        label="Logout"
                        active={false}
                        collapsed={collapsed}
                        onClick={onLogout}
                    />
                </div>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-[72px] w-6 h-6 bg-[var(--card)] border border-[var(--border)] rounded-full flex items-center justify-center shadow-elevation-sm z-20 text-[var(--muted-foreground)] hover:text-[var(--primary-500)]"
                >
                    {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-[70px] lg:pb-0">
                <TopBar
                    productName="Bank Portal"
                    className="hidden lg:flex"
                    userLabel={bankName}
                    userSubLabel="Bank Officer"
                    userInitials={initials}
                />
                <div className="flex-1 overflow-y-auto w-full">
                    {children}
                </div>
            </div>

            {/* Mobile Drawer - bank nav only */}
            {isDrawerOpen && (
                <div className="lg:hidden fixed inset-0 z-[100] animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
                    <div className="absolute top-0 right-0 w-[280px] h-full bg-[var(--neutral-900)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <span className="text-[16px] font-800 text-white uppercase tracking-widest">Bank Portal</span>
                            <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white/60">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => {
                                        onNavClick(item.key);
                                        setIsDrawerOpen(false);
                                    }}
                                    className={cn(
                                        "px-6 py-4 flex items-center gap-4 transition-colors w-full text-left",
                                        currentPage === item.key ? "bg-[var(--primary-500)] text-white" : "text-white/70 hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="text-[15px] font-700">{item.label}</span>
                                </button>
                            ))}
                            <button
                                onClick={() => { onLogout(); setIsDrawerOpen(false); }}
                                className="px-6 py-4 flex items-center gap-4 text-[var(--color-destructive)] text-[14px] font-700"
                            >
                                <LogOut className="w-5 h-5" /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Nav - limited items */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[70px] bg-[var(--neutral-900)] border-t border-[rgba(255,255,255,0.08)] px-4 flex items-center justify-around z-50">
                {navItems.slice(0, 3).map((item) => (
                    <button
                        key={item.key}
                        onClick={() => onNavClick(item.key)}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 min-w-[60px] pb-1 transition-all relative",
                            currentPage === item.key ? "text-[var(--primary-500)]" : "text-[rgba(255,255,255,0.6)]"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[9px] font-800 uppercase tracking-tighter text-center leading-none px-1">
                            {item.label.length > 12 ? item.label.slice(0, 10) + "…" : item.label}
                        </span>
                        {currentPage === item.key && <div className="absolute -bottom-2 w-6 h-1 bg-[var(--primary-500)] rounded-full" />}
                    </button>
                ))}
                <button
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 min-w-[60px] pb-1 transition-all relative",
                        isDrawerOpen ? "text-[var(--primary-500)]" : "text-[rgba(255,255,255,0.6)]"
                    )}
                    onClick={() => setIsDrawerOpen(true)}
                >
                    <Menu className="w-5 h-5" />
                    <span className="text-[9px] font-800 uppercase tracking-tighter">More</span>
                </button>
            </nav>
        </div>
    );
}
