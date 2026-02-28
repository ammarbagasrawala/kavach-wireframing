"use client";

import React, { useState, useEffect } from "react";
import OnboardingLayout from "../components/OnboardingLayout";
import LoKeyButton from "../components/LoKeyButton";
import { cn } from "../components/LoKeyButton";
import { EnrichmentHub } from "../components/EnrichmentHub";
import {
    ShieldCheck,
    ArrowRight,
    Info,
    ChevronLeft,
    Lock as LockIcon,
    Smartphone,
    CheckCircle2,
    Camera,
    Scan,
    AlertCircle,
    FileText,
    ChevronDown,
    User,
    MapPin,
    Calendar,
    Clock,
    Video,
    Hash,
    Search,
    GraduationCap,
    Briefcase,
    Plus
} from "lucide-react";

// --- Flow 2 Components ---

const UnifiedConsent = ({ onNext }: any) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [accepted, setAccepted] = useState(false);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex flex-col gap-2">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--primary-500)_12%,transparent)] flex items-center justify-center text-[var(--primary-500)]">
                    <ShieldCheck className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <h2 className="text-[20px] md:text-[24px] font-800 leading-tight tracking-tight">Unified Consent</h2>
                <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">
                    Authorize Kavach to fetch your documents and create your secure Verifiable Credential.
                </p>
            </div>

            <div className="flex flex-col gap-4 bg-[var(--muted)] p-4 rounded-[var(--radius-lg)] border border-[var(--border)]">
                <h3 className="text-[13px] font-700 uppercase tracking-wider text-[var(--muted-foreground)]">Kavach Privacy Promise</h3>
                <ul className="flex flex-col gap-3">
                    {[
                        "We never store your personal data on our servers.",
                        "Documents are fetched directly from DigiLocker to your device.",
                        "Your identity remains locked until verified via VKYC.",
                        "You have full control to revoke access at any time."
                    ].map((item, i) => (
                        <li key={i} className="flex gap-3 text-[13px] leading-snug">
                            <CheckCircle2 className="w-4 h-4 text-[var(--color-success-700)] shrink-0 mt-0.5" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[14px] font-700">Enter DigiLocker OTP</label>
                    <div className="grid grid-cols-6 gap-1 md:gap-2">
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                id={`otp-${i}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                className="w-full aspect-square text-center text-[18px] md:text-[20px] font-800 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20 outline-none"
                            />
                        ))}
                    </div>
                    <p className="text-[12px] text-[var(--muted-foreground)] leading-tight">Sent to your Aadhaar-linked mobile number ending in •••• 5678</p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-[var(--border)] text-[var(--primary-500)] focus:ring-[var(--primary-500)]"
                    />
                    <span className="text-[13px] text-[var(--muted-foreground)] leading-snug group-hover:text-[var(--neutral-900)] transition-colors">
                        I understand that my fetched info will be stored securely on this device but remain <strong>locked/unusable</strong> until I complete VKYC.
                    </span>
                </label>
            </div>

            <div className="mt-auto pt-4 border-t border-[var(--border)] flex flex-col gap-3">
                <LoKeyButton
                    variant="primary"
                    className="w-full"
                    size="xxl"
                    disabled={!accepted || otp.some(d => !d)}
                    onClick={onNext}
                    rightIcon={<LockIcon className="w-4 h-4" />}
                >
                    Securely Fetch & Lock VC
                </LoKeyButton>
                <button className="text-[12px] font-600 text-[var(--primary-500)] py-2">Resend OTP</button>
            </div>
        </div>
    );
};

const FaceCapture = ({ onNext }: any) => {
    const [status, setStatus] = useState("idle"); // idle, scanning, success

    const startScan = () => {
        setStatus("scanning");
        setTimeout(() => setStatus("success"), 3000);
    };

    useEffect(() => {
        if (status === "success") {
            setTimeout(onNext, 1500);
        }
    }, [status]);

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-[20px] md:text-[24px] font-800 leading-tight tracking-tight">Live Face Capture</h2>
                <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">
                    Mandatory for future 3-way matches and anti-fraud protection.
                </p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-4 md:py-8">
                <div className="relative w-48 h-48 md:w-64 md:h-64">
                    {/* Facial Mask Overlay */}
                    <div className="absolute inset-0 border-4 border-[var(--primary-500)]/30 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-[var(--neutral-900)] flex items-center justify-center overflow-hidden relative">
                            <User className="w-32 h-32 md:w-40 md:h-40 text-white/5" />
                            {status === "scanning" && (
                                <div className="absolute top-0 left-0 w-full h-2 bg-[var(--primary-500)] shadow-[0_0_15px_var(--primary-500)] animate-[scan_2s_infinite]"></div>
                            )}
                            {status === "success" && (
                                <div className="absolute inset-0 bg-[var(--color-success-700)]/20 flex items-center justify-center animate-in fade-in">
                                    <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Corner Brackets */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--primary-500)] rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--primary-500)] rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--primary-500)] rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--primary-500)] rounded-br-xl"></div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-2">
                    <p className={cn(
                        "text-[14px] font-700",
                        status === "scanning" ? "text-[var(--primary-500)]" : "text-[var(--neutral-900)]"
                    )}>
                        {status === "idle" && "Center your face in the frame"}
                        {status === "scanning" && "Verifying Liveness... Look Straight"}
                        {status === "success" && "Liveness Verified!"}
                    </p>
                    <div className="flex items-center gap-2 text-[12px] text-[var(--muted-foreground)]">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Image will be stored as base64 in your VC</span>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-[var(--border)]">
                <LoKeyButton
                    variant="primary"
                    className="w-full"
                    size="xxl"
                    onClick={startScan}
                    disabled={status !== "idle"}
                    leftIcon={<Scan className="w-5 h-5" />}
                >
                    Capture Live Face
                </LoKeyButton>
                <p className="text-[11px] text-center text-[var(--muted-foreground)] mt-3">
                    Ensures your identity cannot be reused by others.
                </p>
            </div>

            <style jsx>{`
        @keyframes scan {
          0% { top: 0% }
          50% { top: 100% }
          100% { top: 0% }
        }
      `}</style>
        </div>
    );
};

const FieldSelection = ({ onComplete }: any) => {
    const [expanded, setExpanded] = useState<string | null>("aadhaar");

    const docs = [
        {
            id: "aadhaar",
            title: "Aadhaar Card",
            icon: FileText,
            fields: [
                { label: "Full Name", required: true, desc: "Standard identifier" },
                { label: "DOB", required: true, desc: "Required for age proof" },
                { label: "Gender", required: true },
                { label: "Masked Number", required: true },
                { label: "Address", required: false, desc: "Commonly used for residency" },
                { label: "Photo Hash", required: true, desc: "Base64 reference" },
            ]
        },
        {
            id: "pan",
            title: "PAN Card",
            icon: Hash,
            fields: [
                { label: "PAN Number", required: true },
                { label: "Full Name", required: true },
            ]
        },
        {
            id: "ckycr",
            title: "CKYCR Record",
            icon: ShieldCheck,
            badge: "Found!",
            fields: [
                { label: "KYC Identifier", required: false },
                { label: "Verification Date", required: false },
            ]
        }
    ];

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-[20px] md:text-[24px] font-800 leading-tight tracking-tight">Select Fields</h2>
                <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">
                    Control exactly what information is included in your Verifiable Credential.
                </p>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto pr-1 max-h-[440px]">
                {docs.map((doc) => (
                    <div key={doc.id} className="border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--card)] transition-all">
                        <button
                            onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}
                            className="w-full p-4 flex items-center justify-between hover:bg-[var(--muted)]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--primary-500)]">
                                    <doc.icon className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[14px] font-700">{doc.title}</span>
                                    {doc.badge && <span className="text-[10px] bg-[var(--color-success-700)] text-white px-1.5 py-0.5 rounded-full font-700">{doc.badge}</span>}
                                </div>
                            </div>
                            <ChevronDown className={cn("w-4 h-4 transition-transform", expanded === doc.id && "rotate-180")} />
                        </button>

                        {expanded === doc.id && (
                            <div className="px-4 pb-4 border-t border-[var(--border)] flex flex-col divide-y divide-[var(--border)]">
                                {doc.fields.map((field, i) => (
                                    <div key={i} className="py-3 flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            defaultChecked={field.required}
                                            disabled={field.required}
                                            className="mt-1 w-4 h-4 rounded border-[var(--border)] text-[var(--primary-500)] focus:ring-[var(--primary-500)]"
                                        />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[13px] font-600">
                                                {field.label} {field.required && <span className="text-[var(--destructive)]">*</span>}
                                            </span>
                                            {field && 'desc' in field && field.desc && <p className="text-[11px] text-[var(--muted-foreground)]">{field.desc}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-4 border-t border-[var(--border)]">
                <LoKeyButton
                    variant="primary"
                    className="w-full"
                    size="xxl"
                    onClick={onComplete}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                    Create My Token
                </LoKeyButton>
                <p className="text-[12px] text-center text-[var(--muted-foreground)] mt-3">
                    Fields marked with <span className="text-[var(--destructive)]">*</span> are mandatory for basic identity.
                </p>
            </div>
        </div>
    );
};

// EnrichmentHub is now imported from components

const SuccessLocked = () => {
    useEffect(() => {
        localStorage.setItem("kavach_pending_kyc", "false");
        localStorage.setItem("kavach_identity_verified", "true");
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center gap-8 py-12 animate-in fade-in zoom-in duration-500">
            <div className="relative">
                <div className="w-32 h-32 rounded-full bg-[color-mix(in_srgb,var(--color-success-700)_12%,transparent)] flex items-center justify-center text-[var(--color-success-700)] shadow-xl shadow-[var(--color-success-700)]/10">
                    <div className="w-24 h-24 rounded-full bg-[var(--color-success-700)] flex items-center justify-center text-white">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="text-[28px] md:text-[32px] font-800 leading-tight tracking-tight">All Set!</h2>
                <p className="text-[15px] md:text-[16px] text-[var(--muted-foreground)] px-4">
                    Your Identity Profile is now enriched and tokens are fully unlocked for use.
                </p>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mt-4">
                <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--card)] border border-[var(--border)] flex flex-col items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-[var(--color-success-700)]" />
                    <span className="text-[13px] font-700">Verified</span>
                </div>
                <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--card)] border border-[var(--border)] flex flex-col items-center gap-2">
                    <Plus className="w-6 h-6 text-[var(--primary-500)]" />
                    <span className="text-[13px] font-700">Enriched</span>
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full mt-auto">
                <LoKeyButton
                    variant="primary"
                    className="w-full shadow-lg"
                    size="xxl"
                    onClick={() => window.location.href = "/"}
                >
                    Go to Dashboard
                </LoKeyButton>
            </div>
        </div>
    );
};

// --- Main Page Component ---

export default function CreateVCPage() {
    const [currentStep, setCurrentStep] = useState(1); // 1: Consent, 2: Face, 3: Selection, 4: Enrichment, 5: Success

    useEffect(() => {
        // No auto-redirect. Users only come here for Initial Issuance.
        // If they find their way back while verified, they can re-run or enrichment step is still there.
    }, []);

    return (
        <OnboardingLayout
            step={currentStep}
            totalSteps={5}
            showAudioToggle={true}
        >
            {currentStep === 1 && <UnifiedConsent onNext={() => setCurrentStep(2)} />}
            {currentStep === 2 && <FaceCapture onNext={() => setCurrentStep(3)} />}
            {currentStep === 3 && <FieldSelection onComplete={() => setCurrentStep(4)} />}
            {currentStep === 4 && <EnrichmentHub onNext={() => setCurrentStep(5)} />}
            {currentStep === 5 && <SuccessLocked />}
        </OnboardingLayout>
    );
}
