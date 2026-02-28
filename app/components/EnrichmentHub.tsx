"use client";

import React, { useState, useEffect } from "react";
import LoKeyButton from "./LoKeyButton";
import { cn } from "./LoKeyButton";
import {
    ShieldCheck,
    CheckCircle2,
    Search,
    GraduationCap,
    Briefcase,
    Plus,
    ChevronLeft,
    Smartphone,
    Info
} from "lucide-react";

interface EnrichmentHubProps {
    onNext?: () => void;
    standalone?: boolean;
}

export const EnrichmentHub: React.FC<EnrichmentHubProps> = ({ onNext, standalone = false }) => {
    const [view, setView] = useState<"hub" | "assisted">("hub");
    const [fetching, setFetching] = useState<string | null>(null);
    const [fetched, setFetched] = useState<string[]>([]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

    useEffect(() => {
        const stored = localStorage.getItem("kavach_fetched_docs");
        if (stored) setFetched(JSON.parse(stored));
    }, []);

    const docs = [
        { id: "ssc", name: "Class X Marksheet", issuer: "CBSE", icon: <GraduationCap className="w-5 h-5" />, category: "Education" },
        { id: "hsc", name: "Class XII Marksheet", issuer: "CBSE", icon: <GraduationCap className="w-5 h-5" />, category: "Education" },
        { id: "degree", name: "Degree Certificate", issuer: "Mumbai University", icon: <GraduationCap className="w-5 h-5" />, category: "Education" },
        { id: "passport", name: "Passport", issuer: "Min. of External Affairs", icon: <Search className="w-5 h-5" />, category: "Identity" },
        { id: "exp", name: "Experience Letter", issuer: "Previous Employer", icon: <Briefcase className="w-5 h-5" />, category: "Employment" },
    ];

    const handleFetch = (id: string) => {
        setVerifyingDocId(id);
        setIsVerifying(true);
        setOtp(["", "", "", "", "", ""]);
    };

    const handleVerifyOtp = () => {
        if (otp.some(d => !d)) return;

        const id = verifyingDocId!;
        setFetching(id);
        setIsVerifying(false);

        setTimeout(() => {
            const newFetched = [...fetched, id];
            setFetched(newFetched);
            localStorage.setItem("kavach_fetched_docs", JSON.stringify(newFetched));

            const logs = JSON.parse(localStorage.getItem("kavach_audit_logs") || "[]");
            const docName = docs.find(d => d.id === id)?.name;
            logs.unshift({
                id: `enrich-${Date.now()}-${Math.random()}`,
                action: "Document Linked",
                details: `${docName} fetched from DigiLocker (OTP Verified)`,
                time: "Just Now",
                status: "Success"
            });
            localStorage.setItem("kavach_audit_logs", JSON.stringify(logs));

            setFetching(null);
            setVerifyingDocId(null);
            window.dispatchEvent(new Event("storage"));
        }, 1500);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) document.getElementById(`enrich-otp-${index + 1}`)?.focus();
    };

    if (isVerifying) {
        const doc = docs.find(d => d.id === verifyingDocId);
        return (
            <div className="flex flex-col h-full gap-8 animate-in slide-in-from-right duration-300 px-1 py-4">
                <div className="flex flex-col gap-3">
                    <button onClick={() => setIsVerifying(false)} className="flex items-center gap-2 text-[13px] font-700 text-[var(--muted-foreground)] hover:text-[var(--neutral-900)] transition-colors w-fit">
                        <ChevronLeft className="w-4 h-4" /> Cancel Fetch
                    </button>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="w-10 h-10 rounded-lg bg-[var(--primary-500)] text-white flex items-center justify-center">
                            {doc?.icon}
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-[20px] font-800 leading-tight">{doc?.name}</h2>
                            <span className="text-[12px] text-[var(--muted-foreground)] font-600">Secure DigiLocker Fetch</span>
                        </div>
                    </div>
                    <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed mt-2">
                        Enter the 6-digit verification code sent to your mobile to authorize the fetch of your **{doc?.name}** from DigiLocker.
                    </p>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-6 gap-1.5 md:gap-2">
                        {otp.map((digit, i) => (
                            <input
                                key={i} id={`enrich-otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                                onChange={e => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                                className="w-full aspect-square text-center text-[18px] md:text-[20px] font-800 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary-500)] outline-none shadow-sm"
                                autoFocus={i === 0}
                            />
                        ))}
                    </div>

                    <LoKeyButton
                        variant="primary"
                        size="xl"
                        className="w-full shadow-lg"
                        disabled={otp.some(d => !d)}
                        onClick={handleVerifyOtp}
                    >
                        Verify & Link Document
                    </LoKeyButton>

                    <button className="text-[12px] font-700 text-[var(--primary-500)] self-center">Resend Code</button>
                </div>
            </div>
        );
    }

    if (view === "assisted") {
        return (
            <div className="flex flex-col h-full gap-6 animate-in slide-in-from-right duration-300 px-1">
                <div className="flex flex-col gap-2">
                    <button onClick={() => setView("hub")} className="flex items-center gap-2 text-[13px] font-600 text-[var(--muted-foreground)] hover:text-[var(--neutral-900)] transiton-colors w-fit">
                        <ChevronLeft className="w-4 h-4" /> Back to Hub
                    </button>
                    <h2 className="text-[24px] font-700 leading-tight tracking-tight">Document Missing?</h2>
                    <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">
                        If you don't see a document in your DigiLocker, we can help you upload or link it.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] flex flex-col gap-4">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] shrink-0">
                                <span className="font-800">1</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[15px] font-700">Open DigiLocker App</span>
                                <p className="text-[13px] text-[var(--muted-foreground)]">Search for your document issuer and fetch the digital copy first.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] shrink-0">
                                <span className="font-800">2</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[15px] font-700">Self-Upload (Optional)</span>
                                <p className="text-[13px] text-[var(--muted-foreground)]">Upload a scanned PDF to your DigiLocker "Uploaded Documents" section.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 border-t border-[var(--border)] pt-4 mt-2">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-success-700)]/10 flex items-center justify-center text-[var(--color-success-700)] shrink-0">
                                <span className="font-800">3</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[15px] font-700">Refresh Hub</span>
                                <p className="text-[13px] text-[var(--muted-foreground)]">Come back to Kavach and one-tap fetch the latest document into your VC.</p>
                            </div>
                        </div>
                    </div>

                    <LoKeyButton
                        variant="primary"
                        className="w-full bg-[#0052cc] py-4"
                        leftIcon={<Smartphone className="w-5 h-5" />}
                        onClick={() => window.open("https://www.digilocker.gov.in/", "_blank")}
                    >
                        Go to DigiLocker
                    </LoKeyButton>
                </div>

                <div className="mt-auto p-4 rounded-[var(--radius-lg)] bg-[var(--muted)] border border-[var(--border)] flex gap-3 italic">
                    <Info className="w-5 h-5 text-[var(--primary-500)] shrink-0" />
                    <p className="text-[12px] text-[var(--muted-foreground)]">
                        Deep-linking to specific document issuers (like CBSE or Passport Seva) helps automate this journey.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 px-1">
            <div className="flex flex-col gap-2">
                <h2 className="text-[24px] md:text-[28px] font-800 leading-tight tracking-tight">Enrich Identity</h2>
                <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">
                    Add documents from DigiLocker to your VC for richer use-cases like job apps or loans.
                </p>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                {docs.map((doc) => (
                    <div key={doc.id} className={cn(
                        "p-4 rounded-[var(--radius-lg)] border transition-all flex items-center justify-between",
                        fetched.includes(doc.id) ? "border-[var(--color-success-700)] bg-[var(--color-success-700)]/5" : "border-[var(--border)] bg-[var(--card)]"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center",
                                fetched.includes(doc.id) ? "bg-[var(--color-success-700)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                            )}>
                                {doc.icon}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[14px] font-700">{doc.name}</span>
                                <span className="text-[11px] text-[var(--muted-foreground)]">{doc.issuer} • {doc.category}</span>
                            </div>
                        </div>
                        {fetched.includes(doc.id) ? (
                            <CheckCircle2 className="w-5 h-5 text-[var(--color-success-700)]" />
                        ) : (
                            <LoKeyButton
                                variant="tertiary"
                                size="s"
                                disabled={fetching === doc.id}
                                onClick={() => handleFetch(doc.id)}
                            >
                                {fetching === doc.id ? "Fetching..." : "Add"}
                            </LoKeyButton>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={() => setView("assisted")}
                className="flex items-center justify-center gap-2 p-4 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--muted-foreground)] transition-all"
            >
                <Plus className="w-5 h-5" />
                <span className="text-[14px] font-600">Document missing? Get help</span>
            </button>

            {onNext && (
                <div className="mt-auto pt-4 border-t border-[var(--border)] flex flex-col gap-3">
                    <LoKeyButton
                        variant="primary"
                        className="w-full"
                        size="xl"
                        onClick={onNext}
                    >
                        {standalone ? "Done" : "Finish Enrichment"}
                    </LoKeyButton>
                    {!standalone && (
                        <button
                            onClick={onNext}
                            className="text-[13px] font-600 text-[var(--muted-foreground)] hover:text-[var(--neutral-900)] mb-2"
                        >
                            I'll add later, proceed with Core VC
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
