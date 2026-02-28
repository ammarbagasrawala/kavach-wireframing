"use client";

import React from "react";
import { cn } from "./LoKeyButton";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: string;
        positive?: boolean;
    };
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, trend, className }) => {
    return (
        <div className={cn(
            "bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 transition-all hover:shadow-elevation-sm",
            className
        )}>
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] md:text-[12px] font-700 uppercase tracking-wider text-[var(--muted-foreground)]">{label}</span>
                    <span className="text-[28px] md:text-[32px] font-800 text-[var(--foreground)] tracking-tight">{value}</span>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--primary-500)_8%,transparent)] flex items-center justify-center text-[var(--primary-500)]">
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
            </div>

            {trend && (
                <div className="mt-3 flex items-center gap-1.5">
                    <span className={cn(
                        "text-[12px] font-600",
                        trend.positive ? "text-[var(--color-success-700)]" : "text-[var(--color-destructive-600)]"
                    )}>
                        {trend.positive ? "+" : "-"}{trend.value}
                    </span>
                    <span className="text-[12px] text-[var(--muted-foreground)]">from last month</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
