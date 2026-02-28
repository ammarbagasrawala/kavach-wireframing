"use client";

import React from "react";
import OnboardingLayout from "./components/OnboardingLayout";
import LoKeyButton from "./components/LoKeyButton";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
    return (
        <OnboardingLayout showAudioToggle={false}>
            <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-12">
                <div className="w-20 h-20 rounded-full bg-[var(--destructive)]/10 flex items-center justify-center text-[var(--destructive)]">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-[24px] font-800 tracking-tight">404 - Page Not Found</h2>
                    <p className="text-[14px] text-[var(--muted-foreground)] px-4">
                        The page you're looking for doesn't exist in the Kavach wireframes.
                    </p>
                </div>
                <LoKeyButton
                    variant="primary"
                    className="w-full mt-4"
                    size="xl"
                    onClick={() => window.location.href = "/navigator"}
                >
                    Back to Navigator
                </LoKeyButton>
            </div>
        </OnboardingLayout>
    );
}
