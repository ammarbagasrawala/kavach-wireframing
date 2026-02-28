"use client";

import React from "react";
import { cn } from "./LoKeyButton";
import { Fingerprint, Headphones } from "lucide-react";

interface OnboardingLayoutProps {
    children: React.ReactNode;
    step?: number;
    totalSteps?: number;
    showAudioToggle?: boolean;
    onAudioToggle?: (enabled: boolean) => void;
    audioEnabled?: boolean;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
    children,
    step,
    totalSteps,
    showAudioToggle = true,
    onAudioToggle,
    audioEnabled = false,
}) => {
    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col md:items-center md:justify-center p-0 md:p-4">
            {/* Container (Simulating a mobile/high-focus view) */}
            <div className="w-full h-full md:h-auto md:max-w-[440px] bg-[var(--card)] md:rounded-[var(--radius-xl)] shadow-none md:shadow-elevation-md flex flex-col overflow-hidden min-h-screen md:min-h-[600px] border-0 md:border md:border-[var(--border)]">

                {/* Header */}
                <div className="px-4 md:px-6 pt-6 md:pt-8 pb-4 flex items-center justify-between">
                    <div className="bg-white p-1 md:p-1.5 rounded-[var(--radius-md)] border border-[var(--border)] flex items-center justify-center shrink-0">
                        <img src="/logo.png" alt="Kavach Logo" className="h-8 md:h-10 w-auto object-contain" />
                    </div>

                    {showAudioToggle && (
                        <button
                            onClick={() => onAudioToggle?.(!audioEnabled)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border",
                                audioEnabled
                                    ? "bg-[color-mix(in_srgb,var(--primary-500)_12%,transparent)] border-[var(--primary-500)] text-[var(--primary-500)]"
                                    : "bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
                            )}
                            aria-label={audioEnabled ? "Disable audio guidance" : "Enable audio guidance"}
                        >
                            <Headphones className="w-4 h-4" />
                            <span className="text-[12px] font-600">{audioEnabled ? "Audio On" : "Audio Guide"}</span>
                        </button>
                    )}
                </div>

                {/* Progress Bar (Optional) */}
                {step !== undefined && totalSteps !== undefined && (
                    <div className="px-6 mb-6">
                        <div className="h-1.5 w-full bg-[var(--muted)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[var(--primary-500)] transition-all duration-500"
                                style={{ width: `${(step / totalSteps) * 100}%` }}
                            ></div>
                        </div>
                        <div className="mt-2 text-[12px] font-600 text-[var(--muted-foreground)] text-right">
                            Step {step} of {totalSteps}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 p-6 flex flex-col overflow-y-auto">
                    {children}
                </main>

                {/* Accessibility Note Footer */}
                <div className="p-4 bg-[var(--muted)] text-center">
                    <p className="text-[11px] text-[var(--muted-foreground)] font-500 leading-tight">
                        WCAG 2.2 AA Compliant • Secure Device Binding Enabled
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OnboardingLayout;
