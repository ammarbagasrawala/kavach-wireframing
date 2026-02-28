"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type ButtonVariant = "primary" | "secondary" | "tertiary" | "outlined" | "ghost";
type ButtonSize = "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";

interface LoKeyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const LoKeyButton = React.forwardRef<HTMLButtonElement, LoKeyButtonProps>(
    ({ className, variant = "primary", size = "m", leftIcon, rightIcon, children, ...props }, ref) => {
        const variants = {
            primary: "bg-[var(--primary-500)] text-[var(--neutral-0)] hover:bg-[var(--primary-600)]",
            secondary:
                "bg-[color-mix(in_srgb,var(--primary-500)_12%,transparent)] text-[var(--primary-500)] hover:bg-[color-mix(in_srgb,var(--primary-500)_20%,transparent)]",
            tertiary: "bg-[var(--neutral-0)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--muted)]",
            outlined: "bg-transparent text-[var(--primary-500)] border border-[var(--primary-500)] hover:bg-[color-mix(in_srgb,var(--primary-500)_8%,transparent)]",
            ghost: "bg-transparent text-[var(--primary-500)] hover:bg-[color-mix(in_srgb,var(--primary-500)_8%,transparent)]",
        };

        const sizes = {
            xxs: "h-6 px-2 text-[12px]",
            xs: "h-7 px-2.5 text-[12px]",
            s: "h-8 px-3 text-[14px]",
            m: "h-9 px-4 text-[14px]",
            l: "h-10 px-5 text-[14px]",
            xl: "h-11 px-6 text-[16px]",
            xxl: "h-12 px-8 text-[16px]",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-500 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {leftIcon && <span className="w-4 h-4 flex items-center justify-center">{leftIcon}</span>}
                {children}
                {rightIcon && <span className="w-4 h-4 flex items-center justify-center">{rightIcon}</span>}
            </button>
        );
    }
);

LoKeyButton.displayName = "LoKeyButton";

export default LoKeyButton;
export { cn };
