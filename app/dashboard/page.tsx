"use client";

import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import LoKeyButton from "../components/LoKeyButton";
import StatusChip from "../components/StatusChip";
import { cn } from "../components/LoKeyButton";
import {
    Users,
    ShieldCheck,
    Clock,
    Plus,
    Filter,
    ShieldAlert,
    ArrowRight,
    Lock as LockIcon,
    FileText,
    Video,
    AlertCircle,
    Calendar,
    Smartphone,
    Info,
    CheckCircle2,
    X,
    User
} from "lucide-react";
import { addAuditLog } from "../components/AuditLogger";

export default function DashboardPage() {
    const [pendingKyc, setPendingKyc] = useState(false);
    const [verified, setVerified] = useState(false);
    const [fetchedDocs, setFetchedDocs] = useState<string[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [vkycDate, setVkycDate] = useState<string | null>(null);
    const [showVkycModal, setShowVkycModal] = useState(false);
    const [vkycStep, setVkycStep] = useState<"prompt" | "connecting" | "success">("prompt");
    const [kavachId, setKavachId] = useState<string | null>(null);

    useEffect(() => {
        const isPending = localStorage.getItem("kavach_pending_kyc") === "true";
        const isVerified = localStorage.getItem("kavach_identity_verified") === "true";
        setPendingKyc(isPending);
        setVerified(isVerified);

        const docs = localStorage.getItem("kavach_fetched_docs");
        if (docs) setFetchedDocs(JSON.parse(docs));

        const date = localStorage.getItem("kavach_vkyc_date");
        setVkycDate(date);

        const id = localStorage.getItem("kavach_user_id");
        setKavachId(id || "ammar@kavach"); // Fallback for wireframe

        const logs = localStorage.getItem("kavach_audit_logs");
        if (logs) {
            setAuditLogs(JSON.parse(logs));
        } else {
            const defaultLogs = [
                { id: 1, action: "Device Binding", details: "Secure Enclave activation successful", time: "2h ago", status: "Success" },
                { id: 2, action: "Authentication", details: "Linked via DigiLocker #9021", time: "1h ago", status: "Success" }
            ];
            setAuditLogs(defaultLogs);
            localStorage.setItem("kavach_audit_logs", JSON.stringify(defaultLogs));
        }
    }, []);

    const docLibrary: Record<string, any> = {
        "ssc": { name: "Class X Marksheet", provider: "CBSE" },
        "hsc": { name: "Class XII Marksheet", provider: "CBSE" },
        "degree": { name: "Degree Certificate", provider: "Mumbai University" },
        "passport": { name: "Passport", provider: "Min. of External Affairs" },
        "exp": { name: "Experience Letter", provider: "Previous Employer" },
    };

    return (
        <Layout currentPage="Dashboard">
            <PageHeader
                title="Dashboard"
                breadcrumbs={[{ label: "Kavach" }, { label: "Dashboard" }]}
                actions={
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-[10px] font-800 uppercase text-[var(--muted-foreground)] tracking-widest leading-none mb-1">Discovery ID</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[14px] font-900 text-[var(--primary-500)]">{kavachId}</span>
                                <div className="w-4 h-4 rounded-full bg-[var(--primary-500)] flex items-center justify-center text-white">
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                </div>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-[var(--border)] hidden md:block"></div>
                        <LoKeyButton variant="tertiary" size="s" leftIcon={<Filter className="w-4 h-4" />}>
                            Filter
                        </LoKeyButton>
                        <LoKeyButton
                            variant="primary"
                            size="s"
                            leftIcon={verified ? <ShieldCheck className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            onClick={() => {
                                if (verified) {
                                    window.location.href = "/credentials";
                                } else if (pendingKyc) {
                                    setShowVkycModal(true);
                                } else {
                                    window.location.href = "/create-vc";
                                }
                            }}
                        >
                            {verified ? "Manage Credentials" : "Verify Identity"}
                        </LoKeyButton>
                    </div>
                }
            />

            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[var(--background)] pb-24 lg:pb-6">
                {/* Profile Incomplete Banner */}
                {!pendingKyc && !verified && (
                    <div className="mb-6 p-4 md:p-6 rounded-[var(--radius-xl)] bg-[color-mix(in_srgb,var(--primary-500)_8%,transparent)] border border-[var(--primary-500)] flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[var(--primary-500)] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[var(--primary-500)]/20">
                            <ShieldAlert className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-[16px] md:text-[18px] font-700 text-[var(--neutral-900)]">Identity Profile Incomplete</h2>
                            <p className="text-[13px] md:text-[14px] text-[var(--muted-foreground)]">Fetch your documents from DigiLocker to generate your Verifiable Credential.</p>
                        </div>
                        <LoKeyButton variant="primary" size="l" className="w-full md:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => window.location.href = "/create-vc"}>
                            Add Documents
                        </LoKeyButton>
                    </div>
                )}

                {/* Orange Alert Banner (Locked State) */}
                {pendingKyc && !verified && (
                    <div className="mb-6 p-4 md:p-6 rounded-[var(--radius-xl)] bg-[var(--color-warning-600)]/10 border border-[var(--color-warning-600)] flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-6 animate-in slide-in-from-top-4 duration-500">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[var(--color-warning-600)] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[var(--color-warning-600)]/20">
                            <LockIcon className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-[16px] md:text-[18px] font-800 text-[var(--neutral-900)] tracking-tight">Credentials Locked</h2>
                            <p className="text-[13px] md:text-[14px] text-[var(--muted-foreground)]">Complete your Video KYC call to verify your identity and unlock your credentials.</p>
                        </div>
                        <LoKeyButton variant="primary" size="l" className="w-full md:w-auto bg-[var(--color-warning-600)] hover:bg-[color-mix(in_srgb,var(--color-warning-600),black_10%)] border-none" onClick={() => setShowVkycModal(true)}>
                            Complete VKYC Now
                        </LoKeyButton>
                    </div>
                )}

                {/* Success Banner (Unlocked State) */}
                {verified && (
                    <div className="mb-6 p-4 md:p-6 rounded-[var(--radius-xl)] bg-[var(--color-success-700)]/10 border border-[var(--color-success-700)] flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[var(--color-success-700)] flex items-center justify-center text-white shrink-0">
                            <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-[16px] md:text-[18px] font-700 text-[var(--neutral-900)]">Identity Fully Verified</h2>
                            <p className="text-[13px] md:text-[14px] text-[var(--muted-foreground)]">Your credentials are unlocked and ready for selective disclosure.</p>
                        </div>
                        <LoKeyButton variant="tertiary" size="l" className="w-full md:w-auto" leftIcon={<ShieldCheck className="w-4 h-4" />} onClick={() => window.location.href = "/credentials"}>
                            Manage Now
                        </LoKeyButton>
                    </div>
                )}

                <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", (!pendingKyc && !verified) && "opacity-50")}>
                    <StatCard label="Total Verifications" value={verified ? "1" : "0"} icon={Users} />
                    <StatCard label="Active Credentials" value={pendingKyc || verified ? (2 + fetchedDocs.length).toString() : "0"} icon={ShieldCheck} />
                    <StatCard label="Audit Log Entries" value={auditLogs.length.toString()} icon={Clock} />
                </div>

                {/* Credentials Grid */}
                {(pendingKyc || verified) && (
                    <div className="mb-8">
                        <h2 className="text-[18px] font-800 mb-4 px-1 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                Manage Verifiable Credentials
                                {!verified && <span className="text-[10px] bg-[var(--color-warning-600)]/20 text-[var(--color-warning-600)] px-2 py-0.5 rounded-full uppercase tracking-tighter">Locked</span>}
                            </div>
                            {!verified && (
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1.5 text-[var(--color-error-600)] bg-[var(--color-error-600)]/5 px-3 py-1.5 rounded-full border border-[var(--color-error-600)]/20 animate-pulse">
                                        <ShieldAlert className="w-4 h-4" />
                                        <span className="text-[11px] font-800 uppercase tracking-tight">Account Inactive</span>
                                    </div>
                                    <span className="text-[9px] text-[var(--muted-foreground)] font-600 max-w-[180px] text-right leading-none">Complete VKYC to activate sharing features</span>
                                </div>
                            )}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { name: "Digital Aadhaar VC", provider: "UIDAI" },
                                { name: "Digital PAN VC", provider: "Income Tax Dept" },
                                ...fetchedDocs.map(id => ({
                                    name: docLibrary[id]?.name || "Document",
                                    provider: docLibrary[id]?.provider || "DigiLocker"
                                }))
                            ].map((vc, i) => (
                                <div key={i} className={cn(
                                    "bg-[var(--card)] border border-[var(--border)] p-5 rounded-[var(--radius-lg)] flex items-center justify-between group transition-all relative overflow-hidden",
                                    !verified && "grayscale-[0.5] opacity-70"
                                )} style={!verified ? { background: 'linear-gradient(135deg, var(--card) 0%, color-mix(in srgb, var(--card), var(--muted) 40%) 100%)' } : {}}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center transition-colors", verified ? "bg-[var(--primary-500)] text-white shadow-lg shadow-[var(--primary-500)]/20" : "bg-[var(--muted)] text-[var(--muted-foreground)]")}>
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[15px] font-700">{vc.name}</span>
                                            <span className="text-[12px] text-[var(--muted-foreground)]">{verified ? `Issued by ${vc.provider}` : "VERIFICATION PENDING"}</span>
                                        </div>
                                    </div>
                                    {verified ? (
                                        <LoKeyButton variant="ghost" size="xs" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => window.location.href = "/credentials"}>
                                            View Securely
                                        </LoKeyButton>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-warning-600)]/10 rounded-full text-[10px] font-800 text-[var(--color-warning-600)] uppercase tracking-tighter border border-[var(--color-warning-600)]/20 shadow-sm">
                                            <LockIcon className="w-3 h-3" /> Locked
                                        </div>
                                    )}

                                    {!verified && (
                                        <div className="absolute top-0 right-0 p-1 opacity-10">
                                            <LockIcon className="w-12 h-12 -mr-4 -mt-4 rotate-12" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Audit Logs */}
                    <div className="lg:col-span-2">
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden h-full flex flex-col">
                            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between shrink-0">
                                <h2 className="text-[16px] font-700">Audit Logs (Activity Trail)</h2>
                                <LoKeyButton variant="tertiary" size="xxs">Download Logs</LoKeyButton>
                            </div>
                            <div className="flex-1 overflow-x-auto">
                                <div className="divide-y divide-[var(--border)]">
                                    {auditLogs.slice(0, 5).map((log) => (
                                        <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-[var(--muted)]/30 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-[var(--color-success-700)]/5 flex items-center justify-center text-[var(--color-success-700)] shrink-0">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[14px] font-700 text-[var(--neutral-900)] truncate uppercase tracking-tight">{log.action}</p>
                                                <p className="text-[12px] text-[var(--muted-foreground)] truncate">{log.details}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[12px] font-600 text-[var(--neutral-900)] mb-0.5">{log.time}</p>
                                                <div className="flex items-center justify-end gap-1 px-2 py-0.5 bg-[var(--color-success-700)]/10 rounded-full">
                                                    <span className="text-[9px] font-700 text-[var(--color-success-700)] uppercase">{log.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Actions */}
                    <div className="lg:col-span-1">
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden h-full">
                            <div className="p-5 border-b border-[var(--border)]">
                                <h2 className="text-[16px] font-700">Pending Actions</h2>
                            </div>
                            <div className="p-5">
                                {pendingKyc && !verified ? (
                                    <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-warning-600)] bg-[var(--color-warning-600)]/5 flex flex-col gap-4 text-center">
                                        <div className="w-12 h-12 rounded-full bg-[var(--color-warning-600)] flex items-center justify-center text-white mx-auto shadow-md">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[14px] font-800 tracking-tight">Video KYC Pending</span>
                                            {vkycDate ? (
                                                <p className="text-[12px] text-[var(--color-warning-600)] font-600 italic">Scheduled for {vkycDate}</p>
                                            ) : (
                                                <p className="text-[12px] text-[var(--muted-foreground)]">Verification call required.</p>
                                            )}
                                        </div>
                                        <LoKeyButton variant="primary" size="s" className="bg-[var(--color-warning-600)] hover:bg-[color-mix(in_srgb,var(--color-warning-600),black_10%)] border-none w-full" onClick={() => setShowVkycModal(true)}>
                                            Complete Now
                                        </LoKeyButton>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center flex flex-col items-center gap-3 opacity-60">
                                        <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-[var(--color-success-700)]" />
                                        <p className="text-[12px] text-[var(--muted-foreground)]">No pending tasks.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {/* VKYC Resume Modal */}
            {showVkycModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-[var(--background)] w-full max-w-[500px] max-h-[90vh] rounded-[var(--radius-2xl)] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]">
                            <span className="text-[12px] font-800 uppercase tracking-widest text-[var(--muted-foreground)]">Identity Verification</span>
                            <button onClick={() => setShowVkycModal(false)} className="p-2 hover:bg-[var(--muted)] rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            {vkycStep === "prompt" && (
                                <VKYCPrompt
                                    onConnect={() => {
                                        addAuditLog("VKYC Initiated", "Connect to agent request from Dashboard");
                                        setVkycStep("connecting");
                                    }}
                                    onSchedule={(date: string) => {
                                        localStorage.setItem("kavach_vkyc_date", date);
                                        setVkycDate(date);
                                        addAuditLog("VKYC Scheduled", `Verification call confirmed for ${date}`, "Info");
                                        setShowVkycModal(false);
                                    }}
                                    onSkip={() => {
                                        addAuditLog("VKYC Deferred", "User opted to postpone verification from Dashboard", "Warning");
                                        setShowVkycModal(false);
                                    }}
                                />
                            )}
                            {vkycStep === "connecting" && (
                                <VKYCSimulation
                                    onComplete={() => {
                                        setVkycStep("success");
                                        localStorage.setItem("kavach_identity_verified", "true");
                                        localStorage.removeItem("kavach_pending_kyc");
                                        addAuditLog("Identity Fully Verified", "Account successfully activated via Video KYC");
                                        setTimeout(() => {
                                            window.location.reload();
                                        }, 1500);
                                    }}
                                />
                            )}
                            {vkycStep === "success" && (
                                <div className="flex flex-col items-center justify-center py-12 text-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-[var(--color-success-700)]/10 flex items-center justify-center text-[var(--color-success-700)]">
                                        <ShieldCheck className="w-10 h-10" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-[20px] font-800">Verification Complete</h2>
                                        <p className="text-[14px] text-[var(--muted-foreground)]">Your identity has been verified and credentials unlocked.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

const VKYCPrompt = ({ onConnect, onSchedule, onSkip }: any) => {
    const [selectedDay, setSelectedDay] = useState("Today");
    const [selectedTime, setSelectedTime] = useState("");
    const [showPicker, setShowPicker] = useState(false);

    const days = [
        { label: "Today", date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) },
        { label: "Tomorrow", date: new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) },
    ];

    const slots = ["10:30 AM", "11:00 AM", "02:30 PM", "04:00 PM", "05:30 PM"];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] mb-2">
                    <Video className="w-7 h-7" />
                </div>
                <h3 className="text-[24px] font-800 leading-tight tracking-tight">Complete Video KYC</h3>
                <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">
                    To unlock your Verifiable Credentials, we need a 2-minute secure video call to verify your identity.
                </p>
            </div>

            <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-warning-600)]/10 border border-[var(--color-warning-600)]/30 flex gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--color-warning-600)] shrink-0 mt-0.5" />
                <p className="text-[12px] font-600 text-[var(--color-warning-600)] leading-snug">
                    Your credentials will remain **locked** and unusable until VKYC is successfully completed.
                </p>
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
                    <LoKeyButton variant="primary" size="xl" className="w-full" onClick={onConnect} leftIcon={<Smartphone className="w-5 h-5" />}>
                        Connect Agent Now
                    </LoKeyButton>
                </div>

                <div className="relative py-2 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]"></div></div>
                    <span className="relative bg-[var(--background)] px-4 text-[12px] font-700 text-[var(--muted-foreground)] uppercase tracking-widest">OR</span>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <LoKeyButton variant="tertiary" size="l" className="w-full border-dashed" onClick={() => setShowPicker(!showPicker)} leftIcon={<Calendar className="w-4 h-4" />}>
                            {selectedTime ? "Reschedule" : "Schedule Later"}
                        </LoKeyButton>
                        <LoKeyButton variant="ghost" size="l" className="w-full text-[var(--muted-foreground)]" onClick={onSkip}>
                            Skip for Now
                        </LoKeyButton>
                    </div>

                    {showPicker && (
                        <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--card)] border border-[var(--border)] flex flex-col gap-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-800 uppercase text-[var(--muted-foreground)] tracking-wider">Select Day</label>
                                <div className="flex gap-2">
                                    {days.map((day) => (
                                        <button key={day.label} onClick={() => setSelectedDay(day.label)} className={cn("flex-1 py-2 px-1 rounded-md border text-center transition-all", selectedDay === day.label ? "bg-[var(--primary-500)] border-[var(--primary-500)] text-white" : "bg-[var(--muted)] border-[var(--border)]")}>
                                            <div className="text-[12px] font-800">{day.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-800 uppercase text-[var(--muted-foreground)] tracking-wider">Available Slots</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {slots.map((slot) => (
                                        <button key={slot} onClick={() => setSelectedTime(slot)} className={cn("py-2 px-3 rounded-md border text-center text-[12px] font-700", selectedTime === slot ? "bg-[var(--primary-500)]/10 border-[var(--primary-500)] text-[var(--primary-500)]" : "bg-[var(--background)] border-[var(--border)]")}>
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <LoKeyButton variant="secondary" size="s" className="w-full" onClick={() => onSchedule(`${selectedDay} at ${selectedTime}`)} disabled={!selectedTime}>
                                Confirm Appointment
                            </LoKeyButton>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[var(--primary-500)]/5 rounded-[var(--radius-lg)] border border-[var(--primary-500)]/10">
                <Info className="w-5 h-5 text-[var(--primary-500)] shrink-0" />
                <p className="text-[11px] text-[var(--muted-foreground)] leading-tight">Keep your original PAN and Aadhaar handy for the call.</p>
            </div>
        </div>
    );
};

const VKYCSimulation = ({ onComplete }: any) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("Connecting...");

    useEffect(() => {
        const steps = [
            { p: 30, s: "Waiting for agent..." },
            { p: 60, s: "Agent Connected: Sandeep V." },
            { p: 100, s: "Verification Successful!" }
        ];
        let current = 0;
        const interval = setInterval(() => {
            if (current < steps.length) {
                setProgress(steps[current].p);
                setStatus(steps[current].s);
                current++;
            } else {
                clearInterval(interval);
                setTimeout(onComplete, 1000);
            }
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-8">
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[var(--primary-500)] bg-[var(--neutral-900)]">
                <div className="absolute inset-0 flex items-center justify-center">
                    <User className="w-24 h-24 text-white/10" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 px-2 py-1 bg-black/50 rounded text-[10px] text-white">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> LIVE
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4 w-full max-w-[280px]">
                <h3 className="text-[18px] font-800 tracking-tight">{status}</h3>
                <div className="w-full h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--primary-500)] transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
    );
};
