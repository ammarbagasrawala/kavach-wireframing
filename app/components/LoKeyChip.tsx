"use client";

import React from "react";
import { cn } from "./LoKeyButton";

type ChipStyle = "filled" | "accent" | "outline";
type ChipType = "primary" | "neutral" | "success" | "warning" | "error" | "info" | "extra";
type ChipSize = "s" | "m" | "l" | "xl";

interface LoKeyChipProps {
    children: React.ReactNode;
    variant?: ChipStyle;
    type?: ChipType;
    size?: ChipSize;
    className?: string;
    leftIcon?: React.ReactNode;
}

const LoKeyChip: React.FC<LoKeyChipProps> = ({
    children,
    variant = "accent",
    type = "primary",
    size = "s",
    className,
    leftIcon,
}) => {
    const colorMap: Record<ChipType, string> = {
        primary: "var(--primary-500)",
        neutral: "var(--neutral-900)",
        success: "var(--color-success-700)",
        warning: "var(--color-warning-600)",
        error: "var(--color-destructive-600)",
        info: "var(--color-info-600)",
        extra: "var(--primary-500)", // fallback
    };

    const variants = {
        filled: `bg-[${colorMap[type]}] text-[var(--neutral-0)]`,
        accent: `bg-[color-mix(in_srgb,${colorMap[type]}_12%,transparent)] text-[${colorMap[type]}]`,
        outline: `bg-transparent border border-[${colorMap[type]}] text-[${colorMap[type]}]`,
    };

    const sizes = {
        s: "h-6 px-2 text-[12px]",
        m: "h-7 px-2.5 text-[12px]",
        l: "h-8 px-3 text-[12px]",
        xl: "h-9 px-4 text-[12px]",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-[20px] font-500 whitespace-nowrap",
                variants[variant],
                sizes[size],
                className
            )}
        >
            {leftIcon && <span className="flex items-center justify-center shrink-0">{leftIcon}</span>}
            {children}
        </div>
    );
};

export default LoKeyChip;
