"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
    Zap,
    Lock as LockIcon,
    Cpu,
    ScanFace
} from "lucide-react";
import { addAuditLog } from "../components/AuditLogger";

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
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--primary-500)_12%,transparent)] flex items-center justify-center text-[var(--primary-500)] shadow-sm">
                <ShieldCheck className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <h2 className="text-[20px] md:text-[24px] font-800 leading-tight tracking-tight">Secure Login</h2>
            <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">
                Choose how you'd like to sign in. We've made it simple and safe for everyone.
            </p>
        </div>
        <div className="flex flex-col gap-4">
            <button
                onClick={onDigiLocker}
                className="group p-5 rounded-[var(--radius-xl)] border-2 border-[var(--primary-500)] bg-white text-left hover:bg-[color-mix(in_srgb,var(--primary-500)_4%,transparent)] transition-all shadow-elevation-sm relative overflow-hidden"
            >
                <div className="flex flex-col gap-1 relative z-10">
                    <span className="text-[16px] md:text-[18px] font-800 text-[var(--primary-500)] uppercase tracking-tight flex items-center gap-2">
                        I have a DigiLocker
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[12px] text-[var(--muted-foreground)] font-500 italic">Recommended for faster setup</span>
                </div>
                <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[var(--primary-500)]/5 to-transparent skew-x-12 translate-x-12"></div>
            </button>

            <button
                onClick={onAssisted}
                className="p-5 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] text-left hover:bg-[var(--muted)]/50 transition-colors flex flex-col gap-1"
            >
                <span className="text-[15px] md:text-[16px] font-700 text-[var(--neutral-900)]">I need help setting up</span>
                <span className="text-[12px] text-[var(--muted-foreground)]">Step-by-step guide for DigiLocker</span>
            </button>
        </div>

        <div className="mt-auto p-4 bg-[var(--muted)]/30 rounded-[var(--radius-lg)] border border-[var(--border)] flex gap-3">
            <Info className="w-5 h-5 text-[var(--primary-500)] shrink-0" />
            <p className="text-[11px] text-[var(--muted-foreground)] leading-normal">
                <strong>Accessibility Note:</strong> If you need assistance, you can enable Audio Mode at the top right of the screen at any time.
            </p>
        </div>
    </div>
);

const AssistedSetup = ({ onBack, onComplete }: any) => (
    <div className="flex flex-col h-full gap-6 overflow-y-auto pr-1">
        <LoKeyButton variant="ghost" size="xs" onClick={onBack} leftIcon={<ChevronLeft className="w-4 h-4" />} className="-ml-2">
            Back to Login
        </LoKeyButton>

        <div className="flex flex-col gap-2">
            <h2 className="text-[22px] md:text-[26px] font-800 leading-tight tracking-tight">Creating your Digital Identity</h2>
            <p className="text-[14px] text-[var(--muted-foreground)]">Follow these 3 simple steps to get started with DigiLocker.</p>
        </div>

        <div className="flex flex-col gap-4">
            {[
                { step: "1", title: "Signup with Mobile", desc: "Enter your mobile number on the DigiLocker portal.", icon: Smartphone },
                { step: "2", title: "Link Aadhaar", desc: "For security, link your 12-digit Aadhaar number.", icon: FileText },
                { step: "3", title: "Set Security PIN", desc: "Create a 6-digit PIN to keep your documents safe.", icon: Key },
            ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-sm ring-1 ring-black/5">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary-500)] flex items-center justify-center text-white font-900 text-[18px] shrink-0">
                        {item.step}
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[15px] font-700">{item.title}</span>
                        <p className="text-[12px] text-[var(--muted-foreground)] leading-snug">{item.desc}</p>
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-4 p-4 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/5 border border-[var(--primary-500)]/20 flex gap-3">
            <HelpCircle className="w-5 h-5 text-[var(--primary-500)] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[var(--primary-500)] leading-normal italic">
                You can do this at any Sahaj Kendra or Aadhaar Center if you need physical assistance.
            </p>
        </div>

        <LoKeyButton variant="primary" className="w-full mt-auto py-6" size="xxl" onClick={onComplete} rightIcon={<ArrowRight className="w-5 h-5" />}>
            Open DigiLocker Setup
        </LoKeyButton>
    </div>
);

const PhoneInput = ({ onNext, isLogin }: any) => {
    const [phone, setPhone] = useState("");
    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--primary-500)_12%,transparent)] flex items-center justify-center text-[var(--primary-500)] shadow-sm">
                    {isLogin ? <ShieldCheck className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
                </div>
                <h2 className="text-[20px] md:text-[24px] font-800 leading-tight tracking-tight">
                    {isLogin ? "Welcome Back" : "Verify Mobile"}
                </h2>
                <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">
                    {isLogin ? "Enter your registered mobile number to access your Kavach identity." : "Enter the mobile number linked to your DigiLocker or Aadhaar."}
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[12px] font-800 uppercase tracking-widest text-[var(--muted-foreground)]">Mobile Number</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-700 text-[var(--muted-foreground)]">+91</span>
                    <input
                        type="tel"
                        placeholder="00000 00000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full pl-14 pr-4 py-4 rounded-[var(--radius-lg)] border-2 border-[var(--border)] focus:border-[var(--primary-500)] outline-none text-[18px] font-700 tracking-[0.1em] transition-all"
                    />
                </div>
            </div>

            <div className="mt-auto flex flex-col gap-3">
                <LoKeyButton
                    variant="primary"
                    className="w-full"
                    size="xxl"
                    disabled={phone.length < 10}
                    onClick={() => onNext(phone)}
                >
                    Get OTP
                </LoKeyButton>
                <p className="text-[11px] text-center text-[var(--muted-foreground)] px-6">
                    By continuing, you agree to receive a secure verification code via SMS.
                </p>
            </div>
        </div>
    );
};

const OTPVerify = ({ phone, onNext, onResend }: any) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

    const handleChange = (val: string, index: number) => {
        if (val.length > 1) val = val.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);

        if (val && index < 5) {
            const next = document.getElementById(`otp-${index + 1}`);
            next?.focus();
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--primary-500)_12%,transparent)] flex items-center justify-center text-[var(--primary-500)]">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-[20px] md:text-[24px] font-800 leading-tight tracking-tight">Enter OTP</h2>
                <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">
                    We've sent a 6-digit code to <span className="font-700 text-[var(--neutral-900)]">+91 {phone.slice(0, 3)}...{phone.slice(-3)}</span>
                </p>
            </div>

            <div className="flex justify-between gap-2 py-4">
                {otp.map((digit, i) => (
                    <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleChange(e.target.value.replace(/\D/g, ''), i)}
                        className="w-10 h-14 md:w-12 md:h-16 text-center text-[24px] font-800 border-2 border-[var(--border)] rounded-[var(--radius-md)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-500)]/10 outline-none transition-all"
                    />
                ))}
            </div>

            <div className="mt-auto flex flex-col gap-4">
                <button onClick={onResend} className="text-[13px] font-700 text-[var(--primary-500)] hover:underline mx-auto">
                    Didn't receive code? Resend
                </button>
                <LoKeyButton
                    variant="primary"
                    className="w-full"
                    size="xxl"
                    disabled={otp.some(d => !d)}
                    onClick={onNext}
                >
                    Verify & Continue
                </LoKeyButton>
            </div>
        </div>
    );
};

const OAuthSimulation = ({ onComplete }: any) => {
    const [status, setStatus] = useState("connecting");

    useEffect(() => {
        const t1 = setTimeout(() => setStatus("authorizing"), 1500);
        const t2 = setTimeout(() => setStatus("success"), 3000);
        const t3 = setTimeout(() => onComplete(), 4500);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center gap-8 py-8">
            <div className="relative w-28 h-28">
                <div className="absolute inset-0 rounded-full border-4 border-[var(--border)] border-dashed animate-[spin_10s_linear_infinite]"></div>
                <div className={cn(
                    "absolute inset-0 rounded-full border-4 border-t-[var(--primary-500)] transition-all duration-500",
                    status === "success" ? "border-[var(--color-success-700)] rotate-0" : "animate-spin"
                )}></div>
                <div className="absolute inset-0 m-auto w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-[var(--border)]">
                    <img src="/logo.png" alt="Kavach" className="w-10 h-10 object-contain" />
                </div>
                {status === "success" && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[var(--color-success-700)] rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2 max-w-[240px]">
                <p className="text-[18px] font-800 uppercase tracking-tight">
                    {status === "connecting" && "Connecting..."}
                    {status === "authorizing" && "Authorizing Kavach"}
                    {status === "success" && "Access Granted"}
                </p>
                <p className="text-[13px] text-[var(--muted-foreground)] leading-relaxed">
                    {status === "connecting" && "Establishing secure tunnel to DigiLocker servers."}
                    {status === "authorizing" && "Approving identity request via OAuth 2.0 protocol."}
                    {status === "success" && "Secure connection established successfully!"}
                </p>
            </div>

            <div className="flex gap-4 opacity-40 grayscale pointer-events-none">
                <div className="px-3 py-1 rounded bg-[var(--muted)] border border-[var(--border)] text-[10px] font-800 uppercase">SSL 256-bit</div>
                <div className="px-3 py-1 rounded bg-[var(--muted)] border border-[var(--border)] text-[10px] font-800 uppercase">OAuth 2.0</div>
            </div>
        </div>
    );
};

const UnifiedSecuritySetup = ({ onComplete, isLogin }: any) => {
    // For signup (isLogin=false), we want biometric -> pin. 
    // For login (isLogin=true), we want selection (biometric or pin).
    const [mode, setMode] = useState<"select" | "biometric" | "pin">(isLogin ? "select" : "biometric");
    const [pin, setPin] = useState(["", "", "", "", "", ""]);
    const [isBinding, setIsBinding] = useState(false);

    const handleBiometric = () => {
        setIsBinding(true);
        setTimeout(() => {
            setIsBinding(false);
            if (isLogin) {
                onComplete();
            } else {
                setMode("pin");
            }
        }, 2000);
    };

    const handlePinChange = (val: string, index: number) => {
        if (val.length > 1) val = val.slice(-1);
        const newPin = [...pin];
        newPin[index] = val;
        setPin(newPin);

        if (val && index < 5) {
            const next = document.getElementById(`pin-${index + 1}`);
            next?.focus();
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-success-700)_12%,transparent)] flex items-center justify-center text-[var(--color-success-700)] shadow-sm">
                    <LockIcon className="w-6 h-6" />
                </div>
                <h2 className="text-[20px] md:text-[24px] font-800 leading-tight tracking-tight">
                    {isLogin ? "Security Check" : "Set Security"}
                </h2>
                <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">
                    {mode === "select" && "Choose how you'd like to protect your Kavach identity."}
                    {mode === "biometric" && (
                        isLogin
                            ? "Authenticating your session using biometrics."
                            : "Step 1: Protect your identity using your device's secure hardware."
                    )}
                    {mode === "pin" && (
                        isLogin
                            ? "Enter your 6-digit PIN to continue."
                            : "Step 2: Create a 6-digit secure PIN as a backup for your biometrics."
                    )}
                </p>
            </div>

            {mode === "select" && (
                <div className="flex-1 flex flex-col gap-4 py-4 animate-in fade-in duration-500">
                    <button
                        onClick={() => setMode("biometric")}
                        className="p-5 rounded-[var(--radius-xl)] border-2 border-[var(--border)] bg-white text-left hover:border-[var(--primary-500)] hover:bg-[color-mix(in_srgb,var(--primary-500)_4%,transparent)] transition-all flex items-center gap-4 group"
                    >
                        <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 text-[var(--primary-500)] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ScanFace className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[16px] font-800 text-[var(--neutral-900)]">Biometrics</span>
                            <span className="text-[12px] text-[var(--muted-foreground)]">Use Face / Touch ID</span>
                        </div>
                        <ArrowRight className="w-5 h-5 ml-auto text-[var(--border)] group-hover:text-[var(--primary-500)] group-hover:translate-x-1 transition-all" />
                    </button>

                    <button
                        onClick={() => setMode("pin")}
                        className="p-5 rounded-[var(--radius-xl)] border-2 border-[var(--border)] bg-white text-left hover:border-[var(--primary-500)] hover:bg-[color-mix(in_srgb,var(--primary-500)_4%,transparent)] transition-all flex items-center gap-4 group"
                    >
                        <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 text-[var(--primary-500)] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Key className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[16px] font-800 text-[var(--neutral-900)]">Security PIN</span>
                            <span className="text-[12px] text-[var(--muted-foreground)]">Use a 6-digit secret code</span>
                        </div>
                        <ArrowRight className="w-5 h-5 ml-auto text-[var(--border)] group-hover:text-[var(--primary-500)] group-hover:translate-x-1 transition-all" />
                    </button>

                    <div className="mt-auto p-4 rounded-[var(--radius-lg)] bg-[var(--muted)]/30 border border-[var(--border)] flex gap-3">
                        <Cpu className="w-5 h-5 text-[var(--primary-500)] shrink-0 mt-0.5" />
                        <p className="text-[11px] text-[var(--muted-foreground)] leading-snug italic">
                            All security keys are stored in your device's <strong>Secure Enclave</strong> and never leave your phone.
                        </p>
                    </div>
                </div>
            )}

            {mode === "biometric" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-10 py-8 animate-in zoom-in duration-500">
                    <div className="relative">
                        <div className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-[var(--primary-500)]/10 animate-ping"></div>
                        <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-[var(--primary-500)]/20 animate-pulse"></div>

                        <div className="relative w-24 h-24 rounded-3xl bg-white border border-[var(--border)] shadow-elevation-md flex items-center justify-center z-10 transition-transform hover:scale-105 active:scale-95 cursor-pointer" onClick={handleBiometric}>
                            {isBinding ? (
                                <Fingerprint className="w-12 h-12 text-[var(--primary-500)] animate-pulse" />
                            ) : (
                                <ScanFace className="w-12 h-12 text-[var(--primary-500)]" />
                            )}
                        </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-3 w-full">
                        <LoKeyButton
                            variant="primary"
                            className="w-full"
                            size="xxl"
                            onClick={handleBiometric}
                            disabled={isBinding}
                        >
                            {isBinding
                                ? (isLogin ? "Verifying..." : "Registering...")
                                : (isLogin ? "Verify Biometrics" : "Step 1: Enable Face / Touch ID")}
                        </LoKeyButton>
                        {isLogin ? (
                            <button
                                className="text-[13px] font-700 text-[var(--primary-500)] hover:underline mx-auto"
                                onClick={() => setMode("select")}
                            >
                                Choose another method
                            </button>
                        ) : (
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <div className="w-2 h-2 rounded-full bg-[var(--primary-500)]"></div>
                                <div className="w-2 h-2 rounded-full bg-[var(--muted-foreground)]/30"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {mode === "pin" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-8 py-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="flex justify-between gap-2 w-full max-w-[300px]">
                        {pin.map((digit, i) => (
                            <input
                                key={i}
                                id={`pin-${i}`}
                                type="password"
                                inputMode="numeric"
                                value={digit}
                                onChange={(e) => handlePinChange(e.target.value.replace(/\D/g, ''), i)}
                                className="w-10 h-14 text-center text-[24px] font-800 border-2 border-[var(--border)] rounded-[var(--radius-md)] focus:border-[var(--primary-500)] outline-none bg-white shadow-sm"
                                autoFocus={i === 0}
                            />
                        ))}
                    </div>

                    <div className="mt-auto flex flex-col gap-3 w-full">
                        <LoKeyButton
                            variant="primary"
                            className="w-full"
                            size="xxl"
                            disabled={pin.some(d => !d)}
                            onClick={onComplete}
                        >
                            {isLogin ? "Log In" : "Step 2: Set PIN & Complete"}
                        </LoKeyButton>
                        {isLogin ? (
                            <button
                                className="text-[13px] font-700 text-[var(--primary-500)] hover:underline mx-auto"
                                onClick={() => setMode("select")}
                            >
                                Choose another method
                            </button>
                        ) : (
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <div className="w-2 h-2 rounded-full bg-[var(--primary-500)] opacity-40"></div>
                                <div className="w-2 h-2 rounded-full bg-[var(--primary-500)]"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Page Component ---

function OnboardingContent() {
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedLang, setSelectedLang] = useState("en");
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [phone, setPhone] = useState("");
    const [isLogin, setIsLogin] = useState(false);

    useEffect(() => {
        if (searchParams.get("login") === "true") {
            setIsLogin(true);
            setCurrentStep(4);
        }
    }, [searchParams]);

    // Step Map:
    // 0: Splash
    // 1: Language
    // 2: Auth Gateway
    // 3: Assisted Setup
    // 4: Phone Input
    // 5: OTP Verify
    // 6: OAuth Simulation
    // 7: Security Setup
    // 8: Success

    if (currentStep === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary-500)]/5 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--primary-500)]/5 blur-[120px] rounded-full"></div>
                </div>

                <div className="mb-10 relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[var(--radius-xl)] flex items-center justify-center mx-auto shadow-2xl shadow-black/5 overflow-hidden animate-in zoom-in duration-1000 delay-300">
                        <img src="/logo.png" alt="Kavach Logo" className="w-full h-auto object-contain p-4" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--primary-500)] rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                </div>

                <div className="flex flex-col gap-3 mb-12 max-w-sm mx-auto">
                    <h1 className="text-[32px] md:text-[42px] font-900 text-[var(--neutral-900)] tracking-tighter leading-none">
                        KAVACH
                    </h1>
                    <div className="h-1 w-12 bg-[var(--primary-500)] mx-auto rounded-full"></div>
                    <p className="text-[18px] md:text-[20px] font-700 text-[var(--neutral-800)] leading-tight mt-2">
                        Your Right to Identity, <span className="text-[var(--primary-500)]">with Ease.</span>
                    </p>
                    <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed mt-1">
                        India's first secure, user-held identity platform.
                        Simple for Everyone. Secure for India.
                    </p>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-[320px]">
                    <LoKeyButton
                        variant="primary"
                        size="xxl"
                        onClick={() => {
                            setIsLogin(false);
                            setCurrentStep(1);
                            addAuditLog("Onboarding Started", "User initiated new identity creation");
                        }}
                        className="w-full text-[16px] font-800 uppercase tracking-widest shadow-xl group"
                        rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    >
                        Get Started
                    </LoKeyButton>

                    <LoKeyButton
                        variant="tertiary"
                        size="xl"
                        onClick={() => {
                            setIsLogin(true);
                            setCurrentStep(4);
                            addAuditLog("Login Initiated", "Existing user started authentication flow", "Info");
                        }}
                        className="w-full text-[15px] font-700"
                    >
                        Already have an identity? <span className="text-[var(--primary-500)] ml-1">Login</span>
                    </LoKeyButton>

                    <div className="flex items-center justify-center gap-6 mt-4 opacity-60">
                        <div className="flex flex-col items-center gap-1">
                            <Smartphone className="w-4 h-4" />
                            <span className="text-[10px] font-700 uppercase">Mobile First</span>
                        </div>
                        <div className="w-px h-6 bg-[var(--border)]"></div>
                        <div className="flex flex-col items-center gap-1">
                            <Languages className="w-4 h-4" />
                            <span className="text-[10px] font-700 uppercase">12+ Languages</span>
                        </div>
                        <div className="w-px h-6 bg-[var(--border)]"></div>
                        <div className="flex flex-col items-center gap-1">
                            <Info className="w-4 h-4" />
                            <span className="text-[10px] font-700 uppercase">Inclusive</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <OnboardingLayout step={currentStep > 3 ? currentStep - 1 : currentStep} totalSteps={7} audioEnabled={audioEnabled} onAudioToggle={setAudioEnabled}>
            {currentStep === 1 && <LanguageSelection selectedLang={selectedLang} onSelect={(l: string) => {
                setSelectedLang(l);
                addAuditLog("Language Updated", `Interface language set to ${l === 'en' ? 'English' : 'Hindi'}`);
            }} onContinue={() => setCurrentStep(2)} />}
            {currentStep === 2 && <AuthGateway onDigiLocker={() => {
                setCurrentStep(4);
                addAuditLog("Auth Path Selected", "User chose DigiLocker direct path");
            }} onAssisted={() => {
                setCurrentStep(3);
                addAuditLog("Auth Path Selected", "User chose Assisted DigiLocker path");
            }} />}
            {currentStep === 3 && <AssistedSetup onBack={() => setCurrentStep(2)} onComplete={() => {
                addAuditLog("Help Portal Accessed", "Opened DigiLocker external setup guide");
                window.open('https://www.digilocker.gov.in/', '_blank');
            }} />}

            {currentStep === 4 && <PhoneInput isLogin={isLogin} onNext={(p: string) => {
                setPhone(p);
                setCurrentStep(5);
                addAuditLog("OTP Requested", `Verification code sent to +91 ${p.slice(0, 2)}...${p.slice(-2)}`);
            }} />}
            {currentStep === 5 && <OTPVerify phone={phone} onNext={() => {
                addAuditLog("Mobile Verified", "Successful SMS authentication");
                isLogin ? setCurrentStep(7) : setCurrentStep(6);
            }} onResend={() => {
                addAuditLog("OTP Resend", "User requested new verification code", "Warning");
                alert("OTP Resent!");
            }} />}
            {currentStep === 6 && <OAuthSimulation onComplete={() => {
                addAuditLog("DigiLocker Linked", "Secure OAuth 2.0 handshake successful");
                setCurrentStep(7);
            }} />}
            {currentStep === 7 && <UnifiedSecuritySetup isLogin={isLogin} onComplete={() => {
                addAuditLog(isLogin ? "Auth Checked" : "Security Setup Complete", isLogin ? "Session secured with device hardware" : "Biometrics and PIN successfully registered");
                setCurrentStep(8);
            }} />}

            {currentStep === 8 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-6 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 rounded-full bg-[var(--color-success-700)] flex items-center justify-center text-white shadow-lg shadow-[var(--color-success-700)]/20 animate-bounce">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-[24px] md:text-[28px] font-900 tracking-tight text-[var(--neutral-900)] uppercase">
                            {isLogin ? "Identity Authenticated" : "Identity Secured"}
                        </h2>
                        <p className="text-[15px] md:text-[16px] text-[var(--muted-foreground)] px-4 leading-relaxed">
                            {isLogin
                                ? "Welcome back! Your secure session has been established."
                                : "Congratulations! Your Kavach profile is ready. You now have full control over your digital identity."}
                        </p>
                    </div>

                    <div className="w-full flex flex-col gap-4">
                        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white flex items-center justify-between w-full shadow-sm">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--primary-500)] text-white flex items-center justify-center shadow-md">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div className="text-left flex flex-col min-w-0">
                                    <span className="text-[10px] font-800 uppercase text-[var(--muted-foreground)] tracking-widest">Kavach Discovery ID</span>
                                    <span className="text-[15px] font-900 text-[var(--primary-500)] truncate">ammar@kavach</span>
                                </div>
                            </div>
                            <div className="px-2 py-0.5 rounded bg-[var(--primary-500)]/5 border border-[var(--primary-500)]/10 text-[9px] font-800 text-[var(--primary-500)] uppercase tracking-tighter">
                                Primary Handle
                            </div>
                        </div>

                        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white flex items-center gap-4 w-full shadow-sm">
                            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--muted)] text-[var(--muted-foreground)] flex items-center justify-center">
                                <Key className="w-5 h-5" />
                            </div>
                            <div className="text-left flex flex-col min-w-0">
                                <span className="text-[10px] font-800 uppercase text-[var(--muted-foreground)] tracking-widest">Digital ID (DID)</span>
                                <span className="text-[12px] font-700 font-mono truncate text-[var(--muted-foreground)]">did:kavach:982fd8...7a4x9</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-success-700)]/30 bg-[var(--color-success-700)]/5 flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-[var(--color-success-700)] shrink-0" />
                            <p className="text-[11px] text-[var(--color-success-700)] font-700 text-left leading-tight">
                                Validated via DigiLocker Trust Network. Ready for Verifiable Credential issuance.
                            </p>
                        </div>

                        <LoKeyButton
                            variant="primary"
                            className="w-full mt-2 py-6"
                            size="xxl"
                            onClick={() => {
                                localStorage.setItem("kavach_identity_verified", "false"); // Still need VKYC for full verify
                                localStorage.setItem("kavach_user_id", "ammar@kavach");
                                addAuditLog("Session Active", "User redirected to Dashboard");
                                window.location.href = "/dashboard";
                            }}
                            rightIcon={<ArrowRight className="w-5 h-5" />}
                        >
                            Go to Dashboard
                        </LoKeyButton>
                    </div>
                </div>
            )}
        </OnboardingLayout>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OnboardingContent />
        </Suspense>
    );
}
