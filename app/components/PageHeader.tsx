"use client";

import React from "react";
import { cn } from "./LoKeyButton";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    breadcrumbs?: Breadcrumb[];
    entryCount?: number;
    actions?: React.ReactNode;
    className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs = [], entryCount, actions, className }) => {
    return (
        <div className={cn("bg-[var(--card)] border-b border-[var(--border)] px-4 md:px-6 py-4 flex flex-col gap-1 shrink-0", className)}>
            <nav className="hidden md:flex items-center gap-1">
                {breadcrumbs.map((bc, idx) => (
                    <React.Fragment key={idx}>
                        <span className="text-[12px] font-500 text-[var(--muted-foreground)] cursor-pointer hover:text-[var(--primary-500)] transition-colors">
                            {bc.label}
                        </span>
                        {idx < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3 text-[var(--muted-foreground)]" />}
                    </React.Fragment>
                ))}
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:mt-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-[18px] md:text-[20px] font-700 md:font-600 tracking-tight">{title}</h1>
                    {entryCount !== undefined && (
                        <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--muted)] text-[var(--muted-foreground)] text-[12px] font-600">
                            {entryCount}
                        </span>
                    )}
                </div>

                {actions && <div className="flex items-center gap-2 md:gap-3">{actions}</div>}
            </div>
        </div>
    );
};

export default PageHeader;
