"use client";

import React, { useState, useEffect } from "react";
import OnboardingLayout from "../components/OnboardingLayout";
import LoKeyButton from "../components/LoKeyButton";
import { cn } from "../components/LoKeyButton";
import {
    Search,
    CheckCircle2,
    Languages,
    ArrowRight,
    Fingerprint,
    ShieldCheck,
    HelpCircle,
    Smartphone,
    Info,
    ChevronLeft,
    PlayCircle,
    Video,
    FileText,
    Key,
    Lock as LockIcon,
    Cpu,
    ScanFace
} from "lucide-react";

// --- Components for Steps (truncated versions of earlier ones for maintenance) ---

const LanguageSelection = ({ selectedLang, onSelect, onContinue }: any) => (
    <div className="flex flex-col h-full gap-6">
        <h2 className="text-[20px] md:text-[24px] font-800 leading-tight tracking-tight">Select Language</h2>
        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {[{ id: "en", name: "English", display: "English" }, { id: "hi", name: "Hindi", display: "हिन्दी" }].map((lang) => (
                <button key={lang.id} onClick={() => onSelect(lang.id)} className={cn("p-4 rounded-[var(--radius-xl)] border text-left flex flex-col relative transition-all", selectedLang === lang.id ? "bg-[color-mix(in_srgb,var(--primary-500)_8%,transparent)] border-[var(--primary-500)] ring-1 ring-[var(--primary-500)]/20 shadow-elevation-sm" : "bg-[var(--card)] border-[var(--border)]")}>
                    <span className={cn("text-[15px] md:text-[16px] font-700", selectedLang === lang.id ? "text-[var(--primary-500)]" : "text-[var(--neutral-900)]")}>{lang.display}</span>
                    {selectedLang === lang.id && <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-[var(--primary-500)]" />}
                </button>
            ))}
        </div>
        <LoKeyButton variant="primary" className="w-full mt-auto" size="xxl" onClick={onContinue} rightIcon={<ArrowRight className="w-4 h-4" />}>Continue</LoKeyButton>
    </div>
);

const AuthGateway = ({ onDigiLocker, onAssisted }: any) => (
    <div className="flex flex-col h-full gap-6">
        <div className="flex flex-col gap-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--primary-500)_12%,transparent)] flex items-center justify-center text-[var(--primary-500)]"><ShieldCheck className="w-6 h-6 md:w-8 md:h-8" /></div>
            <h2 className="text-[20px] md:text-[24px] font-800 leading-tight tracking-tight">Secure Login</h2>
            <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">Choose your preferred way to register your identity with Kavach.</p>
        </div>
        <div className="flex flex-col gap-4">
            <button onClick={onDigiLocker} className="p-5 rounded-[var(--radius-xl)] border-2 border-[var(--primary-500)] bg-[color-mix(in_srgb,var(--primary-500)_4%,transparent)] text-left hover:scale-[1.01] transition-transform shadow-elevation-sm"><span className="text-[16px] md:text-[18px] font-800 block text-[var(--primary-500)] text-center sm:text-left uppercase tracking-tight">Continue with DigiLocker</span></button>
            <button onClick={onAssisted} className="p-5 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] text-left hover:bg-[var(--muted)]/50 transition-colors"><span className="text-[14px] md:text-[16px] font-700 block text-center sm:text-left text-[var(--muted-foreground)]">Assisted Registration</span></button>
        </div>
    </div>
);

const AssistedSetup = ({ onBack, onComplete }: any) => (
    <div className="flex flex-col h-full gap-6">
        <LoKeyButton variant="ghost" size="xs" onClick={onBack} leftIcon={<ChevronLeft />}>Back</LoKeyButton>
        <h2 className="text-[24px] font-700">Create DigiLocker</h2>
        <div className="flex flex-col gap-3">
            <div className="p-4 rounded-[var(--radius-md)] border border-[var(--primary-500)] bg-[color-mix(in_srgb,var(--primary-500)_4%,transparent)] flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-500)] text-white flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                <span className="text-[14px] font-700">1. Enter Aadhaar</span>
            </div>
        </div>
        <LoKeyButton variant="primary" className="w-full mt-auto" size="l" onClick={onComplete} rightIcon={<ArrowRight />}>Complete Registration</LoKeyButton>
    </div>
);

const BiometricBinding = ({ onComplete }: any) => {
    const [isBinding, setIsBinding] = useState(false);

    useEffect(() => {
        if (isBinding) {
            const timer = setTimeout(() => onComplete(), 2000);
            return () => clearTimeout(timer);
        }
    }, [isBinding]);

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex flex-col gap-2">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-success-700)_12%,transparent)] flex items-center justify-center text-[var(--color-success-700)]">
                    <LockIcon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <h2 className="text-[20px] md:text-[24px] font-800 leading-tight tracking-tight">Secure Device</h2>
                <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">
                    Bind your identity to this device hardware for maximum security.
                </p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-8 py-8">
                <div className="relative">
                    {/* Pulsing rings animation placeholder */}
                    <div className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-[var(--primary-500)]/10 animate-ping"></div>
                    <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-[var(--primary-500)]/20 animate-pulse"></div>

                    <div className="relative w-24 h-24 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-elevation-md flex items-center justify-center z-10">
                        {isBinding ? (
                            <Fingerprint className="w-12 h-12 text-[var(--primary-500)] animate-pulse" />
                        ) : (
                            <ScanFace className="w-12 h-12 text-[var(--primary-500)]" />
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full">
                    <div className="flex items-start gap-3 p-4 rounded-[var(--radius-md)] bg-[var(--background)] border border-[var(--border)]">
                        <Cpu className="w-5 h-5 text-[var(--primary-500)] shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-700">Hardware Level Protection</span>
                            <p className="text-[11px] text-[var(--muted-foreground)] leading-snug">
                                Your private keys will be stored in the Secure Enclave of this {navigator.platform.includes('Mac') ? 'Mac' : 'Phone'}.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-[var(--radius-md)] bg-[var(--background)] border border-[var(--border)]">
                        <Fingerprint className="w-5 h-5 text-[var(--primary-500)] shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-700">Biometric Authentication</span>
                            <p className="text-[11px] text-[var(--muted-foreground)] leading-snug">
                                Every time you share your identity, we'll verify it's you with FaceID or TouchID.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-[var(--border)] flex flex-col gap-3">
                <LoKeyButton
                    variant="primary"
                    className="w-full"
                    size="xxl"
                    onClick={() => setIsBinding(true)}
                    disabled={isBinding}
                    leftIcon={isBinding ? null : <Fingerprint className="w-5 h-5" />}
                >
                    {isBinding ? "Securing device..." : "Enable Biometrics"}
                </LoKeyButton>
                <LoKeyButton variant="ghost" size="m" className="text-[var(--muted-foreground)]">
                    Maybe later (use PIN)
                </LoKeyButton>
            </div>
        </div>
    );
};

// --- Main Page Component ---

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedLang, setSelectedLang] = useState("en");
    const [audioEnabled, setAudioEnabled] = useState(false);

    if (currentStep === 0) {
        return (
            <div className="min-h-screen bg-[var(--neutral-900)] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
                <div className="mb-8">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[var(--radius-xl)] flex items-center justify-center mx-auto shadow-xl shadow-white/5 animate-pulse overflow-hidden">
                        <img src="/logo.png" alt="Kavach Logo" className="w-full h-auto object-contain" />
                    </div>
                </div>
                <h1 className="text-[28px] md:text-[36px] font-800 text-white mb-2 tracking-tighter uppercase">KAVACH</h1>
                <p className="text-[16px] md:text-[18px] text-[color-mix(in_srgb,var(--neutral-0)_70%,transparent)] mb-12 max-w-[280px] md:max-w-xs leading-tight font-500">
                    India's First Truly User-Held Tokenised KYC
                </p>
                <div className="flex flex-col gap-4 w-full max-w-[280px]">
                    <LoKeyButton variant="primary" size="xxl" onClick={() => setCurrentStep(1)} className="w-full text-[16px] md:text-[18px] font-800 uppercase tracking-widest shadow-2xl" rightIcon={<ArrowRight className="w-5 h-5" />}>
                        Get Started
                    </LoKeyButton>
                </div>
            </div>
        );
    }

    return (
        <OnboardingLayout step={currentStep} totalSteps={5} audioEnabled={audioEnabled} onAudioToggle={setAudioEnabled}>
            {currentStep === 1 && <LanguageSelection selectedLang={selectedLang} onSelect={setSelectedLang} onContinue={() => setCurrentStep(2)} />}
            {currentStep === 2 && <AuthGateway onDigiLocker={() => setCurrentStep(4)} onAssisted={() => setCurrentStep(3)} />}
            {currentStep === 3 && <AssistedSetup onBack={() => setCurrentStep(2)} onComplete={() => setCurrentStep(4)} />}
            {currentStep === 4 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-12">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-[var(--primary-500)] animate-spin"></div>
                        <ShieldCheck className="absolute inset-0 m-auto w-10 h-10 text-[var(--primary-500)]" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-[18px] font-700">Verifying Identity</p>
                        <p className="text-[14px] text-[var(--muted-foreground)] px-8">Securely connecting with government registries via DigiLocker.</p>
                    </div>
                    <LoKeyButton variant="primary" size="s" className="mt-4" onClick={() => setCurrentStep(5)}>Continue</LoKeyButton>
                </div>
            )}
            {currentStep === 5 && <BiometricBinding onComplete={() => setCurrentStep(6)} />}
            {currentStep === 6 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-12 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 rounded-full bg-[var(--color-success-700)] flex items-center justify-center text-white shadow-lg shadow-[var(--color-success-700)]/20">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-[24px] md:text-[28px] font-800 tracking-tight">You're all set!</h2>
                        <p className="text-[15px] md:text-[16px] text-[var(--muted-foreground)] px-4">Your Kavach identity is ready and secured.</p>
                    </div>
                    <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] flex items-center gap-4 w-full">
                        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-white border border-[var(--border)] flex items-center justify-center text-[var(--primary-500)]">
                            <Key className="w-5 h-5" />
                        </div>
                        <div className="text-left flex flex-col">
                            <span className="text-[12px] font-700 uppercase text-[var(--muted-foreground)]">Your DID</span>
                            <span className="text-[13px] font-600 font-mono">did:kavach:982...7a4</span>
                        </div>
                    </div>
                    <LoKeyButton variant="primary" className="w-full mt-4" size="xl" onClick={() => window.location.href = "/"}>
                        Go to Dashboard
                    </LoKeyButton>
                </div>
            )}
        </OnboardingLayout>
    );
}
