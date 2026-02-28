"use client";

import React from "react";
import { cn } from "./LoKeyButton";
import { User, Bell, Search, ChevronRight } from "lucide-react";

interface TopBarProps {
    productName?: string;
    className?: string;
}

const TopBar: React.FC<TopBarProps> = ({ productName = "KAVACH", className }) => {
    return (
        <header className={cn("h-[56px] border-b border-[var(--border)] bg-[var(--card)] px-6 flex items-center justify-between shrink-0 z-10", className)}>
            <div className="flex items-center gap-4">
                <div className="bg-white p-1 rounded-[var(--radius-sm)] flex items-center justify-center">
                    <img src="/logo.png" alt="Kavach Logo" className="h-8 w-auto object-contain" />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-[var(--muted)] rounded-[var(--radius-md)] text-[var(--muted-foreground)]">
                    <Search className="w-[18px] h-[18px]" />
                </button>
                <button className="p-2 hover:bg-[var(--muted)] rounded-[var(--radius-md)] text-[var(--muted-foreground)] relative">
                    <Bell className="w-[18px] h-[18px]" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--destructive)] rounded-full border-2 border-[var(--card)]"></span>
                </button>
                <div className="w-[1px] h-6 bg-[var(--border)] mx-2"></div>
                <div className="flex items-center gap-3 pl-2">
                    <div className="flex flex-col items-end">
                        <span className="text-[14px] font-600 leading-none">Ammar B.</span>
                        <span className="text-[12px] text-[var(--muted-foreground)]">Administrator</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[color-mix(in_srgb,var(--primary-500)_12%,transparent)] flex items-center justify-center text-[var(--primary-500)] font-600">
                        AB
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
