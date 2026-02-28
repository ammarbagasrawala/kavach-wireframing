"use client";

import React from "react";
import OnboardingLayout from "../components/OnboardingLayout";
import LoKeyButton from "../components/LoKeyButton";
import { Lock } from "lucide-react";

export default function LoginPage() {
    return (
        <OnboardingLayout showAudioToggle={false}>
            <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-12">
                <div className="w-20 h-20 rounded-full bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
                    <Lock className="w-10 h-10" />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-[24px] font-800 tracking-tight">Login</h2>
                    <p className="text-[14px] text-[var(--muted-foreground)] px-4">
                        This is a wireframe placeholder. In the real app, this would be the authentication gateway.
                    </p>
                </div>
                <LoKeyButton
                    variant="primary"
                    className="w-full mt-4"
                    size="xl"
                    onClick={() => window.location.href = "/onboarding"}
                >
                    Return to Journey
                </LoKeyButton>
            </div>
        </OnboardingLayout>
    );
}
