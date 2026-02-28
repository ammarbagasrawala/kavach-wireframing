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

// --- Initial Consent ---
const UnifiedConsent = ({ onNext }: any) => {
    const [accepted, setAccepted] = useState(false);

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-[22px] font-800 tracking-tight">Unified Consent</h2>
                <p className="text-[14px] text-[var(--muted-foreground)]">Authorize Kavach to fetch your documents via secure registries.</p>
            </div>

            <div className="bg-[var(--muted)] p-4 rounded-[var(--radius-lg)] border border-[var(--border)]">
                <h3 className="text-[12px] font-700 uppercase text-[var(--muted-foreground)] mb-3">Privacy Promise</h3>
                <ul className="flex flex-col gap-2.5">
                    {["Fetched directly to device", "Identity stays locked until VKYC", "Full control to revoke"].map((t, i) => (
                        <li key={i} className="flex gap-2 text-[13px] items-center">
                            <CheckCircle2 className="w-4 h-4 text-[var(--color-success-700)]" />
                            <span>{t}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <label className="flex items-start gap-3 cursor-pointer p-2 rounded-[var(--radius-md)] hover:bg-[var(--muted)]/50 transition-colors">
                <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-1" />
                <span className="text-[13px] text-[var(--muted-foreground)]">I understand my VCs remain <strong>locked</strong> until VKYC is complete.</span>
            </label>

            <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" disabled={!accepted} onClick={onNext}>
                Agree & Continue
            </LoKeyButton>
        </div>
    );
};

// --- OTP Verification Steps (CKYCR + DigiLocker) ---
const OTPVerification = ({ onNext }: any) => {
    const [step, setStep] = useState(1); // 1: CKYCR Query, 2: CKYCR OTP, 3: Aadhaar OTP, 4: PAN OTP
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isQuerying, setIsQuerying] = useState(false);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
    };

    useEffect(() => {
        if (step === 1) {
            setIsQuerying(true);
            setTimeout(() => {
                setIsQuerying(false);
                setStep(2);
            }, 2000);
        }
    }, []);

    const nextSubStep = () => {
        setOtp(["", "", "", "", "", ""]);
        if (step < 4) {
            setStep(step + 1);
        } else {
            onNext();
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full">
                <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center gap-2 text-[var(--primary-500)] font-800 text-[12px] uppercase tracking-wider">
                        <Smartphone className="w-4 h-4" />
                        {step === 1 && "CKYCR Lookup"}
                        {step === 2 && "CKYCR Verification"}
                        {step === 3 && "Aadhaar (DigiLocker)"}
                        {step === 4 && "PAN (DigiLocker)"}
                    </div>
                    <h2 className="text-[20px] font-800 tracking-tight">
                        {step === 1 && (isQuerying ? "Querying CKYCR..." : "Found 1 Record!")}
                        {step >= 2 && "Enter OTP"}
                    </h2>
                    <p className="text-[14px] text-[var(--muted-foreground)]">
                        {step === 1 && (isQuerying ? "Searching central registries for your data..." : "We found a CKYCR record linked to your phone number +91 ••••• 5678.")}
                        {step >= 2 && `A 6-digit code has been sent to your Aadhaar-linked mobile for ${step === 2 ? "CKYCR" : step === 3 ? "Aadhaar" : "PAN"} fetch.`}
                    </p>
                </div>

                {step === 1 && !isQuerying && (
                    <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--primary-500)]/20 bg-[var(--primary-500)]/5 flex flex-col gap-3">
                        <div className="flex justify-between items-center text-[13px]">
                            <span className="font-600">CKYC Identifier</span>
                            <span className="font-700">4002 •••• 9021</span>
                        </div>
                        <div className="flex justify-between items-center text-[13px]">
                            <span className="font-600">Last Verified</span>
                            <span className="font-700">12 Jan 2024</span>
                        </div>
                    </div>
                )}

                {step >= 2 && (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-6 gap-2">
                            {otp.map((digit, i) => (
                                <input
                                    key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                                    onChange={e => handleOtpChange(i, e.target.value)}
                                    className="w-full aspect-square text-center text-[20px] font-800 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary-500)] outline-none"
                                />
                            ))}
                        </div>
                        <button className="text-[12px] font-700 text-[var(--primary-500)] self-start">Resend OTP</button>
                    </div>
                )}

                <LoKeyButton
                    variant="primary"
                    size="xl"
                    className="w-full mt-auto"
                    disabled={isQuerying || (step >= 2 && otp.some(d => !d))}
                    onClick={nextSubStep}
                >
                    {step === 1 ? "Proceed to Verify" : "Verify & Fetch"}
                </LoKeyButton>
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

// --- VKYC Components ---

const VKYCPrompt = ({ onConnect, onSchedule, onSkip }: any) => {
    const [selectedDay, setSelectedDay] = useState("Today");
    const [selectedTime, setSelectedTime] = useState("");
    const [showPicker, setShowPicker] = useState(false);

    const days = [
        { label: "Today", date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) },
        { label: "Tomorrow", date: new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) },
        { label: "Mon, 02 Mar", date: "02 Mar" }
    ];

    const slots = ["10:30 AM", "11:00 AM", "02:30 PM", "04:00 PM", "05:30 PM"];

    const handleConfirmSchedule = () => {
        if (!selectedTime) {
            alert("Please select a time slot.");
            return;
        }
        onSchedule(`${selectedDay} (${days.find(d => d.label === selectedDay)?.date}) at ${selectedTime}`);
    };

    return (
        <div className="flex flex-col h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--primary-500)_12%,transparent)] flex items-center justify-center text-[var(--primary-500)] mb-2">
                    <Video className="w-7 h-7" />
                </div>
                <h2 className="text-[24px] font-800 leading-tight tracking-tight">Final Step: Video KYC</h2>
                <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">
                    To unlock your Verifiable Credentials, we need a 2-minute secure video call to verify your identity.
                </p>
            </div>

            {/* Locked State Warning */}
            <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--amber-500)]/10 border border-[var(--amber-500)]/30 flex gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--amber-600)] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-800 text-[var(--amber-900)] uppercase tracking-tight">Account Not Yet Live</span>
                    <p className="text-[12px] font-600 text-[var(--amber-800)] leading-snug">
                        Your VCs will remain <strong>locked</strong> and unusable for any tokenized KYC until VKYC is successfully completed.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[var(--color-success-700)] shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[14px] font-700">Agent is Available</span>
                            <p className="text-[12px] text-[var(--muted-foreground)]">Average wait time: &lt; 1 minute</p>
                        </div>
                    </div>

                    <LoKeyButton
                        variant="primary"
                        size="xl"
                        className="w-full"
                        onClick={onConnect}
                        leftIcon={<Smartphone className="w-5 h-5" />}
                    >
                        Connect Agent Now
                    </LoKeyButton>
                </div>

                <div className="relative py-2 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]"></div></div>
                    <span className="relative bg-[var(--background)] px-4 text-[12px] font-700 text-[var(--muted-foreground)] uppercase tracking-widest">OR</span>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <LoKeyButton
                            variant="tertiary"
                            size="l"
                            className="w-full border-dashed px-2"
                            onClick={() => setShowPicker(!showPicker)}
                            leftIcon={<Calendar className="w-4 h-4" />}
                        >
                            {selectedTime ? "Reschedule" : "Schedule Later"}
                        </LoKeyButton>
                        <LoKeyButton
                            variant="ghost"
                            size="l"
                            className="w-full text-[var(--muted-foreground)]"
                            onClick={onSkip}
                        >
                            Skip for Now
                        </LoKeyButton>
                    </div>

                    {showPicker && (
                        <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--card)] border border-[var(--border)] flex flex-col gap-6 shadow-elevation-md animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex flex-col gap-3">
                                <label className="text-[11px] font-800 uppercase text-[var(--muted-foreground)] tracking-wider">Select Day</label>
                                <div className="flex gap-2">
                                    {days.map((day) => (
                                        <button
                                            key={day.label}
                                            onClick={() => setSelectedDay(day.label)}
                                            className={cn(
                                                "flex-1 py-3 px-2 rounded-[var(--radius-lg)] border text-center transition-all",
                                                selectedDay === day.label
                                                    ? "bg-[var(--primary-500)] border-[var(--primary-500)] text-white shadow-md shadow-[var(--primary-500)]/20"
                                                    : "bg-[var(--muted)] border-[var(--border)] text-[var(--neutral-900)] hover:border-[var(--primary-500)]/50"
                                            )}
                                        >
                                            <div className="text-[14px] font-800">{day.label}</div>
                                            <div className={cn("text-[10px] font-600", selectedDay === day.label ? "text-white/80" : "text-[var(--muted-foreground)]")}>{day.date}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-[11px] font-800 uppercase text-[var(--muted-foreground)] tracking-wider">Available Slots</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {slots.map((slot) => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedTime(slot)}
                                            className={cn(
                                                "py-2.5 px-3 rounded-[var(--radius-md)] border text-center text-[13px] font-700 transition-all",
                                                selectedTime === slot
                                                    ? "bg-[var(--primary-500)]/10 border-[var(--primary-500)] text-[var(--primary-500)]"
                                                    : "bg-[var(--background)] border-[var(--border)] text-[var(--neutral-900)] hover:bg-[var(--muted)]"
                                            )}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <LoKeyButton
                                variant="secondary"
                                size="l"
                                className="w-full mt-2"
                                onClick={handleConfirmSchedule}
                                disabled={!selectedTime}
                            >
                                Confirm Appointment
                            </LoKeyButton>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-auto flex items-center gap-3 p-4 bg-[var(--primary-500)]/5 rounded-[var(--radius-lg)] border border-[var(--primary-500)]/10">
                <Info className="w-5 h-5 text-[var(--primary-500)] shrink-0" />
                <p className="text-[12px] text-[var(--muted-foreground)] leading-tight">
                    Keep your original PAN and Aadhaar handy for the call.
                </p>
            </div>
        </div>
    );
};

const VKYCSimulation = ({ onComplete }: any) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("Connecting to secure server...");

    useEffect(() => {
        const steps = [
            { p: 20, s: "Connecting to secure server..." },
            { p: 40, s: "Waiting for agent..." },
            { p: 60, s: "Agent Connected: Sandeep V." },
            { p: 80, s: "Verifying Liveness & Face Match..." },
            { p: 100, s: "Verification Successful!" }
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                setProgress(steps[currentStep].p);
                setStatus(steps[currentStep].s);
                currentStep++;
            } else {
                clearInterval(interval);
                setTimeout(onComplete, 1000);
            }
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center gap-8 py-12">
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-[var(--primary-500)] shadow-2xl shadow-[var(--primary-500)]/20 bg-[var(--neutral-900)]">
                {/* Simulated Video Feed */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <User className="w-32 h-32 text-white/10" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 px-2 py-1 bg-black/50 rounded text-[10px] text-white">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        LIVE ENCRYPTED
                    </div>
                </div>

                {/* Scan Overlay */}
                {progress > 60 && progress < 100 && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary-500)] shadow-[0_0_15px_var(--primary-500)] animate-[vkyc_scan_2s_infinite]"></div>
                )}

                {progress === 100 && (
                    <div className="absolute inset-0 bg-[var(--color-success-700)]/20 flex items-center justify-center animate-in fade-in">
                        <CheckCircle2 className="w-16 h-16 text-white" />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-4 w-full max-w-[280px]">
                <div className="flex flex-col gap-1">
                    <h3 className="text-[18px] font-800 tracking-tight">{status}</h3>
                    <p className="text-[12px] text-[var(--muted-foreground)]">DO NOT close this window or lock your phone.</p>
                </div>

                <div className="w-full h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--primary-500)] transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <style jsx>{`
                @keyframes vkyc_scan {
                    0% { top: 0% }
                    50% { top: 100% }
                    100% { top: 0% }
                }
            `}</style>
        </div>
    );
};

// EnrichmentHub is now imported from components

const BlockchainRegistration = ({ onComplete }: any) => {
    const [status, setStatus] = useState("Generating Digital Fingerprints...");
    const [progress, setProgress] = useState(0);
    const [hash, setHash] = useState("");

    useEffect(() => {
        const chars = "0123456789abcdef";
        const generateHash = () => {
            let res = "0x";
            for (let i = 0; i < 40; i++) res += chars[Math.floor(Math.random() * chars.length)];
            return res;
        };

        const steps = [
            { p: 30, s: "Creating cryptographic hashes...", h: "" },
            { p: 60, s: "Singing with Biometric Binding...", h: generateHash() },
            { p: 100, s: "Written to Blockchain Network", h: generateHash() }
        ];

        let current = 0;
        const interval = setInterval(() => {
            if (current < steps.length) {
                setProgress(steps[current].p);
                setStatus(steps[current].s);
                if (steps[current].h) setHash(steps[current].h);
                current++;
            } else {
                clearInterval(interval);
                setTimeout(onComplete, 1500);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center gap-8 py-10 animate-in fade-in duration-500">
            <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
                    <ShieldCheck className="w-12 h-12 animate-pulse" />
                </div>
                <div className="absolute inset-0 border-2 border-dashed border-[var(--primary-500)]/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-[320px]">
                <h3 className="text-[20px] font-800 tracking-tight">{status}</h3>
                <div className="w-full h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--primary-500)] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>
                {hash && (
                    <div className="mt-2 p-2 bg-[var(--muted)]/50 rounded border border-[var(--border)] font-mono text-[10px] text-[var(--muted-foreground)] break-all animate-in fade-in slide-in-from-top-2">
                        TX: {hash}
                    </div>
                )}
            </div>

            <div className="p-5 rounded-[var(--radius-xl)] bg-[color-mix(in_srgb,var(--primary-500)_8%,transparent)] border border-[var(--primary-500)]/20 flex flex-col gap-3 text-left">
                <div className="flex items-center gap-2 text-[var(--primary-500)]">
                    <LockIcon className="w-4 h-4" />
                    <span className="text-[12px] font-800 uppercase tracking-wider">Privacy Guaranteed</span>
                </div>
                <p className="text-[12px] text-[var(--neutral-900)] leading-relaxed font-600">
                    Your personal information is <span className="text-[var(--primary-500)] underline decoration-2">NOT</span> stored on the blockchain.
                </p>
                <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                    Only a unique digital fingerprint (hash) is recorded. This allows banks to verify your document's authenticity without ever seeing your data until you explicitly share it.
                </p>
            </div>
        </div>
    );
};

const SuccessLocked = () => {
    useEffect(() => {
        localStorage.setItem("kavach_pending_kyc", "false");
        localStorage.setItem("kavach_identity_verified", "true");
        // Clear pending logs
        const logs = localStorage.getItem("kavach_audit_logs");
        if (logs) {
            const parsed = JSON.parse(logs);
            const filtered = parsed.filter((l: any) => l.action !== "Video KYC Call");
            localStorage.setItem("kavach_audit_logs", JSON.stringify([
                { id: `vkyc-${Date.now()}-${Math.random()}`, action: "Video KYC", details: "Handled by Agent #902, Success", time: "Just now", status: "Success" },
                ...filtered
            ]));
        }
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
                    onClick={() => window.location.href = "/dashboard"}
                >
                    Go to Dashboard
                </LoKeyButton>
            </div>
        </div>
    );
};

// --- Main Page Component ---

export default function CreateVCPage() {
    const [currentStep, setCurrentStep] = useState(1); // 1: Consent, 2: Selection, 3: Face, 4: OTP, 5: Enrichment, 6: VKYC Prompt, 7: Simulation, 8: Blockchain, 9: Success

    useEffect(() => {
        // Handle resume state
        const isPending = localStorage.getItem("kavach_pending_kyc") === "true";
        if (isPending) {
            setCurrentStep(7); // Resume simulation (VKYC) directly for demo
        }
    }, []);

    const handleScheduleVkyc = (date: string) => {
        localStorage.setItem("kavach_pending_kyc", "true");
        localStorage.setItem("kavach_vkyc_date", date);

        // Add to audit logs
        const logs = localStorage.getItem("kavach_audit_logs") || "[]";
        const parsed = JSON.parse(logs);
        localStorage.setItem("kavach_audit_logs", JSON.stringify([
            { id: `vkyc-sched-${Date.now()}-${Math.random()}`, action: "Video KYC Call", details: `Scheduled for ${date}`, time: "Just now", status: "Scheduled" },
            ...parsed
        ]));

        window.location.href = "/dashboard";
    };

    return (
        <OnboardingLayout
            step={currentStep}
            totalSteps={9}
            showAudioToggle={true}
        >
            {currentStep === 1 && <UnifiedConsent onNext={() => setCurrentStep(2)} />}
            {currentStep === 2 && <FieldSelection onComplete={() => setCurrentStep(3)} />}
            {currentStep === 3 && <FaceCapture onNext={() => setCurrentStep(4)} />}
            {currentStep === 4 && <OTPVerification onNext={() => setCurrentStep(5)} />}
            {currentStep === 5 && <EnrichmentHub onNext={() => setCurrentStep(6)} />}
            {currentStep === 6 && (
                <VKYCPrompt
                    onConnect={() => setCurrentStep(7)}
                    onSchedule={handleScheduleVkyc}
                    onSkip={() => {
                        localStorage.setItem("kavach_pending_kyc", "true");
                        window.location.href = "/dashboard";
                    }}
                />
            )}
            {currentStep === 7 && <VKYCSimulation onComplete={() => setCurrentStep(8)} />}
            {currentStep === 8 && <BlockchainRegistration onComplete={() => setCurrentStep(9)} />}
            {currentStep === 9 && <SuccessLocked />}
        </OnboardingLayout>
    );
}
