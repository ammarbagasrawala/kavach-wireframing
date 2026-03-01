"use client";

import React, { useState, useEffect, Suspense } from "react";
import OnboardingLayout from "../components/OnboardingLayout";
import PageHeader from "../components/PageHeader";
import LoKeyButton from "../components/LoKeyButton";
import { cn } from "../components/LoKeyButton";
import { addBankAuditLog, getBankAuditLogs } from "../components/AuditLogger";
import BankLayout from "../components/BankLayout";
import {
    ShieldCheck,
    ArrowRight,
    Building2,
    CheckCircle2,
    FileText,
    Camera,
    Clock,
    RefreshCw,
    LogOut,
    ChevronLeft,
    User,
    Lock,
    Send,
    List,
    Home,
    History,
    Smartphone,
    Hash,
    AlertTriangle,
    Zap
} from "lucide-react";

const BANK_STORAGE_KEYS = {
    loggedIn: "kavach_bank_official_logged_in",
    org: "kavach_bank_org",
    sentRequestIds: "kavach_bank_sent_request_ids",
} as const;

const AVAILABLE_ATTRIBUTES = [
    "Full Name",
    "Aadhaar Number",
    "PAN Card",
    "Current Address",
    "Date of Birth",
    "Phone Number",
];

const RETENTION_OPTIONS = [
    "Duration of the customer relationship",
    "Legal requirement (2 years)",
    "1 year from termination",
    "Single session use",
];

interface KYCRequest {
    id: string;
    org: string;
    purpose: string;
    fields: string[];
    reason: string;
    retention: string;
    timestamp: string;
    status: "pending" | "granted" | "denied" | "revoked";
    targetKavachId?: string;
}

// --- Bank official login ---
const BankLoginScreen = ({ onLogin }: { onLogin: (bankName: string) => void }) => {
    const [bankName, setBankName] = useState("HDFC Bank");
    const [officerId, setOfficerId] = useState("");

    const handleSubmit = () => {
        localStorage.setItem(BANK_STORAGE_KEYS.loggedIn, "true");
        localStorage.setItem(BANK_STORAGE_KEYS.org, bankName);
        addBankAuditLog("Bank Portal", `Officer logged in to ${bankName}`);
        onLogin(bankName);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-[400px] bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-8 shadow-elevation-md">
                <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] mb-6">
                    <Building2 className="w-8 h-8" />
                </div>
                <h1 className="text-[22px] font-800 tracking-tight text-[var(--neutral-900)] mb-1">Bank official login</h1>
                <p className="text-[14px] text-[var(--muted-foreground)] mb-6">Sign in to access the KYC portal.</p>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-[12px] font-700 uppercase tracking-widest text-[var(--muted-foreground)] block mb-1">Bank / Organisation</label>
                        <input
                            type="text"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full px-4 py-3 rounded-[var(--radius-md)] border-2 border-[var(--border)] focus:border-[var(--primary-500)] outline-none"
                            placeholder="e.g. HDFC Bank"
                        />
                    </div>
                    <div>
                        <label className="text-[12px] font-700 uppercase tracking-widest text-[var(--muted-foreground)] block mb-1">Officer ID</label>
                        <input
                            type="text"
                            value={officerId}
                            onChange={(e) => setOfficerId(e.target.value)}
                            className="w-full px-4 py-3 rounded-[var(--radius-md)] border-2 border-[var(--border)] focus:border-[var(--primary-500)] outline-none"
                            placeholder="Optional for simulation"
                        />
                    </div>
                    <LoKeyButton variant="primary" size="xl" className="w-full mt-2" onClick={handleSubmit} rightIcon={<ArrowRight className="w-4 h-4" />}>
                        Login as bank official
                    </LoKeyButton>
                </div>
            </div>
        </div>
    );
};

// --- Portal home: two cards (KYC Provider includes Issue VC & Publish to ledger) ---
const PortalHome = ({ bankName, onLogout, onProvider, onSeeker }: { bankName: string; onLogout: () => void; onProvider: () => void; onSeeker: () => void }) => (
    <div className="min-h-screen bg-[var(--background)] flex flex-col p-6">
        <div className="max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-[20px] font-800 text-[var(--neutral-900)]">Bank KYC Portal</h1>
                        <p className="text-[13px] text-[var(--muted-foreground)]">{bankName}</p>
                    </div>
                </div>
                <LoKeyButton variant="ghost" size="s" onClick={onLogout} leftIcon={<LogOut className="w-4 h-4" />}>
                    Logout
                </LoKeyButton>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={onProvider}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 flex flex-col gap-4 shadow-elevation-sm hover:shadow-elevation-md transition-all text-left group"
                >
                    <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--primary-500)] flex items-center justify-center text-white">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h2 className="text-[18px] font-800 tracking-tight">We are a KYC Provider</h2>
                    <p className="text-[14px] text-[var(--muted-foreground)]">Perform KYC, issue Verifiable Credentials, and publish to the ledger.</p>
                    <span className="text-[12px] text-[var(--muted-foreground)] font-500">Perform VKYC → Issue VC → Publish to ledger</span>
                    <span className="text-[13px] font-700 text-[var(--primary-500)] flex items-center gap-1 group-hover:gap-2 transition-all">
                        Enter <ArrowRight className="w-4 h-4" />
                    </span>
                </button>
                <button
                    onClick={onSeeker}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 flex flex-col gap-4 shadow-elevation-sm hover:shadow-elevation-md transition-all text-left group"
                >
                    <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-info-600)] flex items-center justify-center text-white">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h2 className="text-[18px] font-800 tracking-tight">We are a KYC Seeker</h2>
                    <p className="text-[14px] text-[var(--muted-foreground)]">Request KYC attributes from a user via their Kavach identity.</p>
                    <span className="text-[13px] font-700 text-[var(--primary-500)] flex items-center gap-1 group-hover:gap-2 transition-all">
                        Enter <ArrowRight className="w-4 h-4" />
                    </span>
                </button>
            </div>
        </div>
    </div>
);

// --- KYC Provider flow steps ---
const ProviderStep1 = ({ onNext }: { onNext: (customerId: string) => void }) => {
    const [customerId, setCustomerId] = useState("");
    return (
        <div className="flex flex-col h-full gap-6">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
                <User className="w-6 h-6" />
            </div>
            <h2 className="text-[20px] font-800 tracking-tight">Start KYC for customer</h2>
            <p className="text-[14px] text-[var(--muted-foreground)]">Enter customer identifier (phone or Kavach DID) or leave blank for new customer.</p>
            <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="e.g. ammar@kavach or +91 98765 43210"
                className="w-full px-4 py-3 rounded-[var(--radius-md)] border-2 border-[var(--border)] focus:border-[var(--primary-500)] outline-none"
            />
            <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" onClick={() => onNext(customerId || "New customer")} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue
            </LoKeyButton>
        </div>
    );
};

const ProviderStep2 = ({ onNext }: { onNext: (service: string) => void }) => {
    const [service, setService] = useState("");
    return (
        <div className="flex flex-col h-full gap-6">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
                <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-[20px] font-800 tracking-tight">Select service</h2>
            <div className="flex flex-col gap-3">
                {["Perform VKYC and issue credential", "Only perform KYC verification"].map((opt) => (
                    <button
                        key={opt}
                        onClick={() => setService(opt)}
                        className={cn(
                            "p-4 rounded-[var(--radius-lg)] border text-left transition-all",
                            service === opt ? "border-[var(--primary-500)] bg-[var(--primary-500)]/5 ring-1 ring-[var(--primary-500)]/20" : "border-[var(--border)] bg-[var(--card)]"
                        )}
                    >
                        <span className="text-[14px] font-700">{opt}</span>
                    </button>
                ))}
            </div>
            <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" disabled={!service} onClick={() => onNext(service)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue
            </LoKeyButton>
        </div>
    );
};

const ProviderStep3 = ({ onNext }: { onNext: () => void }) => (
    <div className="flex flex-col h-full gap-6">
        <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
            <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-[20px] font-800 tracking-tight">Collect / link documents</h2>
        <p className="text-[14px] text-[var(--muted-foreground)]">Customer will link Aadhaar/PAN via DigiLocker or upload documents.</p>
        <div className="p-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--muted)]/30 text-center text-[13px] text-[var(--muted-foreground)]">
            Document upload placeholder
        </div>
        <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" onClick={onNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Continue
        </LoKeyButton>
    </div>
);

const ProviderStep4 = ({ onNext }: { onNext: () => void }) => {
    const [done, setDone] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setDone(true), 2000);
        return () => clearTimeout(t);
    }, []);
    return (
        <div className="flex flex-col h-full gap-6">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
                <Camera className="w-6 h-6" />
            </div>
            <h2 className="text-[20px] font-800 tracking-tight">VKYC / Face verification</h2>
            {!done ? (
                <div className="flex flex-col items-center gap-4 py-8">
                    <div className="w-16 h-16 rounded-full border-4 border-[var(--primary-500)] border-t-transparent animate-spin" />
                    <p className="text-[14px] text-[var(--muted-foreground)]">Initiating VKYC…</p>
                </div>
            ) : (
                <div className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] bg-[var(--color-success-700)]/10 border border-[var(--color-success-700)]/30">
                    <CheckCircle2 className="w-6 h-6 text-[var(--color-success-700)] shrink-0" />
                    <span className="text-[14px] font-700 text-[var(--color-success-700)]">VKYC completed successfully</span>
                </div>
            )}
            <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" disabled={!done} onClick={onNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue
            </LoKeyButton>
        </div>
    );
};

const ProviderStep5 = ({ onNext }: { onNext: () => void }) => (
    <div className="flex flex-col h-full gap-6">
        <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-success-700)]/10 flex items-center justify-center text-[var(--color-success-700)]">
            <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-[20px] font-800 tracking-tight">KYC completed for customer</h2>
        <p className="text-[14px] text-[var(--muted-foreground)]">VKYC and document checks are done. Next: issue a Verifiable Credential and publish it to the ledger so it can be verified by others.</p>
        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)]/30 text-[13px] text-[var(--muted-foreground)]">
            <span className="font-700 text-[var(--neutral-900)]">Next steps:</span> Issue VC → Publish to ledger → Done
        </div>
        <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" onClick={onNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Continue to Issue VC
        </LoKeyButton>
    </div>
);

// --- Issue VC & Publish to ledger (within KYC Provider flow) ---
const ProviderStep6IssueVC = ({ customerId, onNext }: { customerId: string; onNext: () => void }) => (
    <div className="flex flex-col h-full gap-6">
        <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
            <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-[20px] font-800 tracking-tight">Issue Verifiable Credential</h2>
        <p className="text-[14px] text-[var(--muted-foreground)]">Confirm the attributes to include in the VC for <strong>{customerId}</strong>. The VC will be signed by your bank and can later be presented by the customer.</p>
        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)]/30 space-y-2">
            <p className="text-[12px] font-700 uppercase tracking-widest text-[var(--muted-foreground)]">Attributes in this VC</p>
            <p className="text-[13px] font-600 text-[var(--neutral-900)]">Full Name, Aadhaar Number, PAN Card, Date of Birth, Phone</p>
        </div>
        <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" onClick={onNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Issue VC
        </LoKeyButton>
    </div>
);

const ProviderStep7PublishLedger = ({ onNext }: { onNext: () => void }) => {
    const [done, setDone] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setDone(true), 2500);
        return () => clearTimeout(t);
    }, []);
    return (
        <div className="flex flex-col h-full gap-6">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
                <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-[20px] font-800 tracking-tight">Publish to ledger</h2>
            <p className="text-[14px] text-[var(--muted-foreground)]">Publishing the VC’s commitment (hash) to the ledger so any KYC Seeker can verify that the credential is genuine and issued by your bank.</p>
            {!done ? (
                <div className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--primary-500)] border-t-transparent animate-spin" />
                    <span className="text-[14px] font-600">Publishing to ledger…</span>
                </div>
            ) : (
                <div className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] bg-[var(--color-success-700)]/10 border border-[var(--color-success-700)]/30">
                    <CheckCircle2 className="w-6 h-6 text-[var(--color-success-700)] shrink-0" />
                    <span className="text-[14px] font-700 text-[var(--color-success-700)]">Published to ledger successfully</span>
                </div>
            )}
            <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" disabled={!done} onClick={onNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue
            </LoKeyButton>
        </div>
    );
};

const ProviderStep8Success = ({ onBackToPortal }: { onBackToPortal: () => void }) => (
    <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
        <div className="w-20 h-20 rounded-full bg-[var(--color-success-700)] flex items-center justify-center text-white">
            <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-[22px] font-800 tracking-tight text-center">KYC completed & VC published</h2>
        <p className="text-[14px] text-[var(--muted-foreground)] text-center max-w-sm">KYC was completed for the customer, a Verifiable Credential was issued, and its commitment was published to the ledger. The customer can now present this VC to KYC Seekers.</p>
        <LoKeyButton variant="primary" size="xl" onClick={onBackToPortal} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Back to portal
        </LoKeyButton>
    </div>
);

// --- KYC Seeker: Create request ---
const SeekerCreateRequest = ({ bankName, onSent, onBack }: { bankName: string; onSent: () => void; onBack: () => void }) => {
    const [did, setDid] = useState("ammar@kavach");
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [purpose, setPurpose] = useState("Savings Account Opening");
    const [reason, setReason] = useState("Regulatory requirement for Digital KYC as per RBI Master Direction on KYC.");
    const [retention, setRetention] = useState(RETENTION_OPTIONS[0]);

    const toggleField = (f: string) => {
        setSelectedFields((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
    };

    const handleSend = () => {
        const id = `req_bank_${Date.now()}`;
        const request: KYCRequest = {
            id,
            org: bankName,
            purpose,
            reason,
            retention,
            fields: selectedFields.length ? selectedFields : ["Full Name", "Aadhaar Number", "PAN Card", "Current Address"],
            targetKavachId: did.trim() || undefined,
            status: "pending",
            timestamp: "Just now",
        };
        const stored = localStorage.getItem("kavach_kyc_requests");
        const list: KYCRequest[] = stored ? JSON.parse(stored) : [];
        list.push(request);
        localStorage.setItem("kavach_kyc_requests", JSON.stringify(list));
        const sentIds = JSON.parse(localStorage.getItem(BANK_STORAGE_KEYS.sentRequestIds) || "[]");
        sentIds.push(id);
        localStorage.setItem(BANK_STORAGE_KEYS.sentRequestIds, JSON.stringify(sentIds));
        addBankAuditLog("Bank Portal", `KYC request sent to ${did || "user"}`);
        onSent();
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <LoKeyButton variant="ghost" size="xs" onClick={onBack} leftIcon={<ChevronLeft className="w-4 h-4" />} className="-ml-2">
                Back
            </LoKeyButton>
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-info-600)]/10 flex items-center justify-center text-[var(--color-info-600)]">
                <Send className="w-6 h-6" />
            </div>
            <h2 className="text-[20px] font-800 tracking-tight">Create KYC request</h2>
            <div>
                <label className="text-[12px] font-700 uppercase tracking-widest text-[var(--muted-foreground)] block mb-1">Kavach DID (target user)</label>
                <input
                    type="text"
                    value={did}
                    onChange={(e) => setDid(e.target.value)}
                    placeholder="e.g. ammar@kavach"
                    className="w-full px-4 py-3 rounded-[var(--radius-md)] border-2 border-[var(--border)] focus:border-[var(--primary-500)] outline-none"
                />
            </div>
            <div>
                <label className="text-[12px] font-700 uppercase tracking-widest text-[var(--muted-foreground)] block mb-2">Requested attributes</label>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_ATTRIBUTES.map((f) => (
                        <label key={f} className={cn("px-3 py-2 rounded-[var(--radius-md)] border cursor-pointer text-[13px] font-600 transition-all", selectedFields.includes(f) ? "bg-[var(--primary-500)]/10 border-[var(--primary-500)] text-[var(--primary-500)]" : "bg-[var(--muted)]/50 border-[var(--border)]")}>
                            <input type="checkbox" checked={selectedFields.includes(f)} onChange={() => toggleField(f)} className="sr-only" />
                            {f}
                        </label>
                    ))}
                </div>
            </div>
            <div>
                <label className="text-[12px] font-700 uppercase tracking-widest text-[var(--muted-foreground)] block mb-1">Purpose</label>
                <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full px-4 py-3 rounded-[var(--radius-md)] border-2 border-[var(--border)] focus:border-[var(--primary-500)] outline-none" />
            </div>
            <div>
                <label className="text-[12px] font-700 uppercase tracking-widest text-[var(--muted-foreground)] block mb-1">Reason / justification</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-[var(--radius-md)] border-2 border-[var(--border)] focus:border-[var(--primary-500)] outline-none resize-none" />
            </div>
            <div>
                <label className="text-[12px] font-700 uppercase tracking-widest text-[var(--muted-foreground)] block mb-1">Retention</label>
                <select value={retention} onChange={(e) => setRetention(e.target.value)} className="w-full px-4 py-3 rounded-[var(--radius-md)] border-2 border-[var(--border)] focus:border-[var(--primary-500)] outline-none">
                    {RETENTION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
            <div className="mt-auto flex flex-col gap-2">
                <LoKeyButton variant="primary" size="xl" className="w-full" onClick={handleSend} rightIcon={<Send className="w-4 h-4" />}>
                    Send request
                </LoKeyButton>
                <button type="button" onClick={onSent} className="text-[13px] font-700 text-[var(--primary-500)] hover:underline flex items-center gap-2 justify-center">
                    <List className="w-4 h-4" /> View sent requests
                </button>
            </div>
        </div>
    );
};

// --- Bank audit log screen ---
const BankAuditLogScreen = () => {
    const [logs, setLogs] = useState<Array<{ id: string; action: string; details: string; time: string; status: string }>>([]);
    useEffect(() => {
        setLogs(getBankAuditLogs());
        const handler = () => setLogs(getBankAuditLogs());
        window.addEventListener("kavach_bank_audit_log_added", handler);
        return () => window.removeEventListener("kavach_bank_audit_log_added", handler);
    }, []);
    return (
        <div className="p-6">
            <PageHeader title="Bank audit log" breadcrumbs={[{ label: "Bank Portal" }, { label: "Audit log" }]} />
            <main className="max-w-4xl mx-auto mt-6">
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden">
                    {logs.length === 0 ? (
                        <div className="p-12 text-center text-[var(--muted-foreground)] text-[14px]">No bank audit entries yet.</div>
                    ) : (
                        <ul className="divide-y divide-[var(--border)]">
                            {logs.map((log) => (
                                <li key={log.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-700 text-[var(--neutral-900)]">{log.action}</p>
                                        <p className="text-[12px] text-[var(--muted-foreground)] truncate">{log.details}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[11px] text-[var(--muted-foreground)]">{log.time}</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[11px] font-700",
                                            log.status === "Success" && "bg-[var(--color-success-700)]/10 text-[var(--color-success-700)]",
                                            log.status === "Warning" && "bg-[var(--color-warning-600)]/10 text-[var(--color-warning-600)]",
                                            log.status === "Error" && "bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]",
                                            log.status === "Info" && "bg-[var(--color-info-600)]/10 text-[var(--color-info-600)]"
                                        )}>
                                            {log.status}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
};

const BANK_NAV_ITEMS = [
    { key: "portal", label: "Portal home", icon: Home },
    { key: "sent", label: "Security", icon: History },
    { key: "audit", label: "Audit log", icon: Clock },
].map(({ key, label, icon }) => ({ key, label, icon }));

// --- KYC Seeker: Sent requests list ---
const SeekerSentList = ({
    bankName,
    onBack,
    onRunChecks,
    onNavClick,
    onLogout,
}: {
    bankName: string;
    onBack: () => void;
    onRunChecks: (req: KYCRequest) => void;
    onNavClick: (key: string) => void;
    onLogout: () => void;
}) => {
    const [requests, setRequests] = useState<KYCRequest[]>([]);

    const refreshRequests = () => {
        const stored = localStorage.getItem("kavach_kyc_requests");
        const ids: string[] = JSON.parse(localStorage.getItem(BANK_STORAGE_KEYS.sentRequestIds) || "[]");
        if (!stored || !ids.length) {
            setRequests([]);
            return;
        }
        const all: KYCRequest[] = JSON.parse(stored);
        setRequests(all.filter((r) => ids.includes(r.id) && r.org === bankName));
    };

    useEffect(() => {
        refreshRequests();
    }, [bankName]);

    useEffect(() => {
        const interval = setInterval(refreshRequests, 2500);
        return () => clearInterval(interval);
    }, [bankName]);

    return (
        <BankLayout
            currentPage="sent"
            bankName={bankName}
            navItems={BANK_NAV_ITEMS}
            onNavClick={onNavClick}
            onLogout={onLogout}
        >
            <PageHeader
                title="Sent KYC requests"
                breadcrumbs={[{ label: "Bank Portal" }, { label: "KYC Seeker" }]}
                actions={<LoKeyButton variant="ghost" size="s" onClick={onBack} leftIcon={<ChevronLeft className="w-4 h-4" />}>Back to create request</LoKeyButton>}
            />
            <main className="p-6">
                <div className="max-w-4xl mx-auto flex flex-col gap-4">
                    {requests.length === 0 ? (
                        <div className="p-12 text-center bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)]">
                            <List className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
                            <p className="text-[15px] font-700 text-[var(--neutral-900)]">No requests sent yet</p>
                            <p className="text-[13px] text-[var(--muted-foreground)] mt-1">Create a request to ask a user for KYC attributes.</p>
                        </div>
                    ) : (
                        requests.map((req) => (
                            <div key={req.id} className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[14px] font-800 text-[var(--neutral-900)]">{req.targetKavachId || "User"}</p>
                                        <p className="text-[12px] text-[var(--muted-foreground)]">{req.purpose}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {req.fields.slice(0, 3).map((f, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-[var(--muted)] rounded text-[11px] font-600">{f}</span>
                                            ))}
                                            {req.fields.length > 3 && <span className="text-[11px] text-[var(--muted-foreground)]">+{req.fields.length - 3}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={cn(
                                            "px-2 py-1 rounded text-[12px] font-700",
                                            req.status === "granted" && "bg-[var(--color-success-700)]/10 text-[var(--color-success-700)]",
                                            req.status === "pending" && "bg-[var(--color-warning-600)]/10 text-[var(--color-warning-600)]",
                                            req.status === "denied" && "bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]"
                                        )}>
                                            {req.status}
                                        </span>
                                        {req.status === "granted" && (
                                            <LoKeyButton variant="primary" size="s" onClick={() => onRunChecks(req)}>
                                                Run verification
                                            </LoKeyButton>
                                        )}
                                    </div>
                                </div>
                                {req.status === "pending" && (
                                    <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2 text-[13px] text-[var(--muted-foreground)]">
                                        <Clock className="w-4 h-4 shrink-0 animate-pulse" />
                                        <span>Waiting for approval from the user for tokenized KYC. Once the user grants access on their Requests page, you can run verification here.</span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </main>
        </BankLayout>
    );
};

// --- Full Tokenised KYC verification flow (after Run verification) ---
const VERIFICATION_STEPS = 8; // 0..7

const VerificationStep0Collector = ({ request, onNext }: { request: KYCRequest; onNext: () => void }) => {
    const [pan, setPan] = useState("");
    const [phone, setPhone] = useState("");
    const [aadhaarMobile, setAadhaarMobile] = useState("");
    const [dob, setDob] = useState("");
    const [prefillDone, setPrefillDone] = useState(false);
    return (
        <div className="flex flex-col h-full gap-6">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
                <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-[20px] font-800 tracking-tight">Bank login for account opening</h2>
            <p className="text-[14px] text-[var(--muted-foreground)]">PAN and Phone. You may pre-fill from the user's VC.</p>
            <div className="flex flex-col gap-3">
                <div>
                    <label className="text-[12px] font-700 uppercase text-[var(--muted-foreground)] block mb-1">PAN</label>
                    <input type="text" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase().slice(0, 10))} placeholder="ABCDE1234F" className="w-full px-4 py-3 rounded-[var(--radius-md)] border-2 border-[var(--border)] focus:border-[var(--primary-500)] outline-none" />
                </div>
                <div>
                    <label className="text-[12px] font-700 uppercase text-[var(--muted-foreground)] block mb-1">Phone</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="9876543210" className="w-full px-4 py-3 rounded-[var(--radius-md)] border-2 border-[var(--border)] focus:border-[var(--primary-500)] outline-none" />
                </div>
                <div>
                    <label className="text-[12px] font-700 uppercase text-[var(--muted-foreground)] block mb-1">Aadhaar-linked mobile number</label>
                    <input type="tel" value={aadhaarMobile} onChange={(e) => setAadhaarMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Same or different" className="w-full px-4 py-3 rounded-[var(--radius-md)] border-2 border-[var(--border)] focus:border-[var(--primary-500)] outline-none" />
                </div>
                <div>
                    <label className="text-[12px] font-700 uppercase text-[var(--muted-foreground)] block mb-1">Date of Birth</label>
                    <input type="text" value={dob} onChange={(e) => setDob(e.target.value)} placeholder="DD/MM/YYYY" className="w-full px-4 py-3 rounded-[var(--radius-md)] border-2 border-[var(--border)] focus:border-[var(--primary-500)] outline-none" />
                </div>
            </div>
            <button type="button" onClick={() => { setPan("ABCDE1234F"); setPhone("9876543210"); setAadhaarMobile("9876543210"); setDob("15/08/1990"); setPrefillDone(true); }} className="text-[13px] font-700 text-[var(--primary-500)] hover:underline flex items-center gap-2">
                <Zap className="w-4 h-4" /> Pre-fill from user's VC {prefillDone && "✓"}
            </button>
            <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" onClick={onNext} rightIcon={<ArrowRight className="w-4 h-4" />}>Continue</LoKeyButton>
        </div>
    );
};

const VerificationStep1ConsentSummary = ({ request, onNext }: { request: KYCRequest; onNext: () => void }) => (
    <div className="flex flex-col h-full gap-6">
        <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
            <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-[20px] font-800 tracking-tight">Kavach Tok KYC flow</h2>
        <p className="text-[14px] text-[var(--muted-foreground)]">Bank requested attributes. User gave consent on their Requests page.</p>
        <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)]/30">
            <p className="text-[13px] font-700 text-[var(--neutral-900)]">Requested: {request.fields.join(", ")}</p>
            <p className="text-[12px] text-[var(--muted-foreground)] mt-1">Purpose: {request.purpose}. Status: Granted.</p>
        </div>
        <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" onClick={onNext} rightIcon={<ArrowRight className="w-4 h-4" />}>Continue</LoKeyButton>
    </div>
);

type VerificationOutcome = "success" | "rekyc_ttl" | "rekyc_freshness" | "manual_kyc" | null;

const SeekerRunChecks = ({
    request,
    onSuccess,
    onRekyc,
    onManualKyc,
}: {
    request: KYCRequest;
    onSuccess: () => void;
    onRekyc: (reason: string) => void;
    onManualKyc: () => void;
}) => {
    const [step, setStep] = useState(0);
    const [outcome, setOutcome] = useState<VerificationOutcome>(null);
    const [subPhase, setSubPhase] = useState<"running" | "done">("running");

    useEffect(() => {
        if (step === 0 || step === 1) return;
        if (step === 2) {
            const t = setTimeout(() => { setSubPhase("done"); setOutcome(null); }, 1500);
            return () => clearTimeout(t);
        }
        if (step === 3) {
            const t = setTimeout(() => { setSubPhase("done"); setOutcome(null); }, 1500);
            return () => clearTimeout(t);
        }
        if (step === 4) {
            const t = setTimeout(() => { setSubPhase("done"); setOutcome(null); }, 1500);
            return () => clearTimeout(t);
        }
        if (step === 5) {
            const t = setTimeout(() => setSubPhase("done"), 2000);
            return () => clearTimeout(t);
        }
        if (step === 6) {
            const t = setTimeout(() => setStep(7), 1800);
            return () => clearTimeout(t);
        }
    }, [step]);

    if (step === 0) {
        return (
            <OnboardingLayout step={1} totalSteps={VERIFICATION_STEPS} showAudioToggle={false}>
                <VerificationStep0Collector request={request} onNext={() => setStep(1)} />
            </OnboardingLayout>
        );
    }
    if (step === 1) {
        return (
            <OnboardingLayout step={2} totalSteps={VERIFICATION_STEPS} showAudioToggle={false}>
                <VerificationStep1ConsentSummary request={request} onNext={() => setStep(2)} />
            </OnboardingLayout>
        );
    }

    const handleStep2Result = () => {
        const fail = Math.random() < 0.2;
        if (fail) { setOutcome("rekyc_ttl"); return; }
        setStep(3);
        setSubPhase("running");
    };
    const handleStep3Result = () => {
        const fail = Math.random() < 0.2;
        if (fail) { setOutcome("rekyc_freshness"); return; }
        setStep(4);
        setSubPhase("running");
    };
    const handleStep4Result = () => {
        const fail = Math.random() < 0.15;
        if (fail) { setOutcome("manual_kyc"); return; }
        setStep(5);
        setSubPhase("running");
    };

    if (step === 2) {
        return (
            <OnboardingLayout step={3} totalSteps={VERIFICATION_STEPS} showAudioToggle={false}>
                <div className="flex flex-col h-full gap-6">
                    <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]"><Clock className="w-6 h-6" /></div>
                    <h2 className="text-[20px] font-800 tracking-tight">TTL check</h2>
                    <p className="text-[14px] text-[var(--muted-foreground)]">Credential validity (backend process).</p>
                    {subPhase === "running" && <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border)]"><Clock className="w-5 h-5 animate-pulse" /><span className="text-[14px] font-600">Checking…</span></div>}
                    {outcome === "rekyc_ttl" && (
                        <div className="flex flex-col gap-4 mt-auto">
                            <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-warning-600)]/10 border border-[var(--color-warning-600)]/30">
                                <p className="text-[14px] font-700 text-[var(--color-warning-600)]">TTL expired. Re-KYC required. User and bank have been notified of the reason.</p>
                            </div>
                            <LoKeyButton variant="primary" size="xl" onClick={() => onRekyc("TTL expired")}>Initiate Re-KYC</LoKeyButton>
                        </div>
                    )}
                    {subPhase === "done" && !outcome && (
                        <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" onClick={handleStep2Result} rightIcon={<ArrowRight className="w-4 h-4" />}>Next</LoKeyButton>
                    )}
                </div>
            </OnboardingLayout>
        );
    }
    if (step === 3) {
        return (
            <OnboardingLayout step={4} totalSteps={VERIFICATION_STEPS} showAudioToggle={false}>
                <div className="flex flex-col h-full gap-6">
                    <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]"><FileText className="w-6 h-6" /></div>
                    <h2 className="text-[20px] font-800 tracking-tight">Document Freshness (Pull Document API)</h2>
                    <p className="text-[14px] text-[var(--muted-foreground)]">If new pull and VC hash doesn't match, Re-KYC is required. User and bank are alerted.</p>
                    {subPhase === "running" && <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border)]"><Clock className="w-5 h-5 animate-pulse" /><span className="text-[14px] font-600">Checking…</span></div>}
                    {outcome === "rekyc_freshness" && (
                        <div className="flex flex-col gap-4 mt-auto">
                            <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-warning-600)]/10 border border-[var(--color-warning-600)]/30">
                                <p className="text-[14px] font-700 text-[var(--color-warning-600)]">VC hash doesn't match after fresh pull. Re-KYC required. User and bank have been notified.</p>
                            </div>
                            <LoKeyButton variant="primary" size="xl" onClick={() => onRekyc("Document freshness: VC hash mismatch")}>Initiate Re-KYC</LoKeyButton>
                        </div>
                    )}
                    {subPhase === "done" && !outcome && (
                        <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" onClick={handleStep3Result} rightIcon={<ArrowRight className="w-4 h-4" />}>Next</LoKeyButton>
                    )}
                </div>
            </OnboardingLayout>
        );
    }
    if (step === 4) {
        return (
            <OnboardingLayout step={5} totalSteps={VERIFICATION_STEPS} showAudioToggle={false}>
                <div className="flex flex-col h-full gap-6">
                    <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]"><Hash className="w-6 h-6" /></div>
                    <h2 className="text-[20px] font-800 tracking-tight">Attribute hashes vs chain</h2>
                    <p className="text-[14px] text-[var(--muted-foreground)]">User's attribute hashes are matched with the hashes in chain (backend). Doesn't match → alert bank, send to manual KYC.</p>
                    {subPhase === "running" && <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border)]"><Clock className="w-5 h-5 animate-pulse" /><span className="text-[14px] font-600">Verifying…</span></div>}
                    {outcome === "manual_kyc" && (
                        <div className="flex flex-col gap-4 mt-auto">
                            <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-destructive)]/10 border border-[var(--color-destructive)]/30">
                                <p className="text-[14px] font-700 text-[var(--color-destructive)]">Hash doesn't match chain. Bank has been alerted. Case sent to manual KYC.</p>
                            </div>
                            <LoKeyButton variant="tertiary" size="xl" onClick={onManualKyc}>Back to sent requests</LoKeyButton>
                        </div>
                    )}
                    {subPhase === "done" && !outcome && (
                        <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" onClick={handleStep4Result} rightIcon={<ArrowRight className="w-4 h-4" />}>Next</LoKeyButton>
                    )}
                </div>
            </OnboardingLayout>
        );
    }
    if (step === 5) {
        return (
            <OnboardingLayout step={6} totalSteps={VERIFICATION_STEPS} showAudioToggle={false}>
                <div className="flex flex-col h-full gap-6">
                    <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]"><Camera className="w-6 h-6" /></div>
                    <h2 className="text-[20px] font-800 tracking-tight">Face match (Face URI mandatory)</h2>
                    <p className="text-[14px] text-[var(--muted-foreground)]">VKYC / Face verification required before VP is shared.</p>
                    {subPhase === "running" && <div className="flex flex-col items-center gap-4 py-8"><div className="w-16 h-16 rounded-full border-4 border-[var(--primary-500)] border-t-transparent animate-spin" /><p className="text-[14px] text-[var(--muted-foreground)]">Verifying face…</p></div>}
                    {subPhase === "done" && (
                        <div className="flex flex-col gap-4 mt-auto">
                            <div className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] bg-[var(--color-success-700)]/10 border border-[var(--color-success-700)]/30">
                                <CheckCircle2 className="w-6 h-6 text-[var(--color-success-700)] shrink-0" />
                                <span className="text-[14px] font-700 text-[var(--color-success-700)]">Face match successful</span>
                            </div>
                            <LoKeyButton variant="primary" size="xl" className="w-full" onClick={() => { setStep(6); setSubPhase("running"); }} rightIcon={<ArrowRight className="w-4 h-4" />}>Continue</LoKeyButton>
                        </div>
                    )}
                </div>
            </OnboardingLayout>
        );
    }
    if (step === 6) {
        return (
            <OnboardingLayout step={7} totalSteps={VERIFICATION_STEPS} showAudioToggle={false}>
                <div className="flex flex-col h-full gap-6">
                    <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]"><Lock className="w-6 h-6" /></div>
                    <h2 className="text-[20px] font-800 tracking-tight">VC to VP</h2>
                    <p className="text-[14px] text-[var(--muted-foreground)]">Generating Verifiable Presentation (backend process, not a user story).</p>
                    <div className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] border border-[var(--border)]">
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--primary-500)] border-t-transparent animate-spin" />
                        <span className="text-[14px] font-600">Generating VP…</span>
                    </div>
                </div>
            </OnboardingLayout>
        );
    }
    if (step === 7) {
        return (
            <OnboardingLayout step={8} totalSteps={VERIFICATION_STEPS} showAudioToggle={false}>
                <SeekerSuccess onBack={() => onSuccess()} />
            </OnboardingLayout>
        );
    }
    return null;
};

const SeekerSuccess = ({ onBack }: { onBack: () => void }) => (
    <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
        <div className="w-20 h-20 rounded-full bg-[var(--color-success-700)] flex items-center justify-center text-white">
            <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-[22px] font-800 tracking-tight text-center">VP shared to Bank</h2>
        <p className="text-[14px] text-[var(--muted-foreground)] text-center max-w-sm">Verifiable Presentation has been shared. You may proceed with account opening.</p>
        <LoKeyButton variant="primary" size="xl" onClick={onBack} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Back to sent requests
        </LoKeyButton>
    </div>
);

const SeekerRekycScreen = ({ reason, onBack }: { reason: string; onBack: () => void }) => (
    <div className="flex flex-col h-full gap-6">
        <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-warning-600)]/10 flex items-center justify-center text-[var(--color-warning-600)]">
            <RefreshCw className="w-6 h-6" />
        </div>
        <h2 className="text-[22px] font-800 tracking-tight">Re-KYC required</h2>
        <p className="text-[14px] text-[var(--muted-foreground)]">Reason: {reason}. User and bank have been alerted. User must re-verify; you can send a new request from the Sent requests list.</p>
        <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" onClick={onBack}>
            Back to sent requests
        </LoKeyButton>
    </div>
);

// --- Manual KYC outcome (hash doesn't match chain) ---
const SeekerManualKycScreen = ({ onBack }: { onBack: () => void }) => (
    <div className="flex flex-col h-full gap-6">
        <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-destructive)]/10 flex items-center justify-center text-[var(--color-destructive)]">
            <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-[22px] font-800 tracking-tight">Sent to manual KYC</h2>
        <p className="text-[14px] text-[var(--muted-foreground)]">Attribute hash did not match the chain. Bank has been alerted. This case has been sent for manual KYC.</p>
        <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" onClick={onBack}>
            Back to sent requests
        </LoKeyButton>
    </div>
);

// --- Main Bank portal content ---
function BankContent() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [bankName, setBankName] = useState("");
    const [view, setView] = useState<"portal" | "provider" | "seeker">("portal");
    const [providerStep, setProviderStep] = useState(1);
    const [providerCustomerId, setProviderCustomerId] = useState("");
    const [seekerView, setSeekerView] = useState<"create" | "sent" | "audit" | "checks" | "success" | "rekyc" | "manual_kyc">("create");
    const [checksRequest, setChecksRequest] = useState<KYCRequest | null>(null);
    const [rekycReason, setRekycReason] = useState("");

    useEffect(() => {
        const isLoggedIn = localStorage.getItem(BANK_STORAGE_KEYS.loggedIn) === "true";
        const org = localStorage.getItem(BANK_STORAGE_KEYS.org) || "";
        setLoggedIn(isLoggedIn);
        setBankName(org);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem(BANK_STORAGE_KEYS.loggedIn);
        localStorage.removeItem(BANK_STORAGE_KEYS.org);
        setLoggedIn(false);
        setView("portal");
        setProviderStep(1);
        setSeekerView("create");
    };

    const handleBankNav = (key: string) => {
        if (key === "portal") setView("portal");
        else if (key === "sent") setSeekerView("sent");
        else if (key === "audit") setSeekerView("audit");
    };

    if (!loggedIn) {
        return <BankLoginScreen onLogin={(name) => { setBankName(name); setLoggedIn(true); }} />;
    }

    if (view === "portal") {
        return (
            <PortalHome
                bankName={bankName}
                onLogout={handleLogout}
                onProvider={() => { setView("provider"); setProviderStep(1); setProviderCustomerId(""); }}
                onSeeker={() => { setView("seeker"); setSeekerView("create"); }}
            />
        );
    }

    if (view === "provider") {
        const totalSteps = 8;
        return (
            <OnboardingLayout step={providerStep} totalSteps={totalSteps} showAudioToggle={false}>
                {providerStep === 1 && <ProviderStep1 onNext={(id) => { setProviderCustomerId(id); setProviderStep(2); }} />}
                {providerStep === 2 && <ProviderStep2 onNext={() => setProviderStep(3)} />}
                {providerStep === 3 && <ProviderStep3 onNext={() => setProviderStep(4)} />}
                {providerStep === 4 && <ProviderStep4 onNext={() => setProviderStep(5)} />}
                {providerStep === 5 && <ProviderStep5 onNext={() => setProviderStep(6)} />}
                {providerStep === 6 && <ProviderStep6IssueVC customerId={providerCustomerId} onNext={() => { setProviderStep(7); addBankAuditLog("KYC Provider", "VC issued for customer"); }} />}
                {providerStep === 7 && <ProviderStep7PublishLedger onNext={() => { setProviderStep(8); addBankAuditLog("KYC Provider", "VC published to ledger"); }} />}
                {providerStep === 8 && <ProviderStep8Success onBackToPortal={() => { setView("portal"); setProviderStep(1); }} />}
            </OnboardingLayout>
        );
    }

    if (view === "seeker") {
        if (seekerView === "audit") {
            return (
                <BankLayout
                    currentPage="audit"
                    bankName={bankName}
                    navItems={BANK_NAV_ITEMS}
                    onNavClick={handleBankNav}
                    onLogout={handleLogout}
                >
                    <BankAuditLogScreen />
                </BankLayout>
            );
        }
        if (seekerView === "sent") {
            return (
                <SeekerSentList
                    bankName={bankName}
                    onBack={() => setSeekerView("create")}
                    onRunChecks={(req) => {
                    setChecksRequest(req);
                    setSeekerView("checks");
                    addBankAuditLog("KYC Seeker", "Run verification started for granted request");
                }}
                    onNavClick={handleBankNav}
                    onLogout={handleLogout}
                />
            );
        }
        if (seekerView === "checks" && checksRequest) {
            return (
                <SeekerRunChecks
                    request={checksRequest}
                    onSuccess={() => {
                        addBankAuditLog("KYC Seeker", "VP shared to bank. Account opening can proceed.");
                        setSeekerView("sent");
                    }}
                    onRekyc={(reason) => {
                        addBankAuditLog("KYC Seeker", `Re-KYC required: ${reason}. User and bank alerted.`, "Warning");
                        setRekycReason(reason);
                        setSeekerView("rekyc");
                    }}
                    onManualKyc={() => {
                        addBankAuditLog("KYC Seeker", "Hash mismatch with chain. Case sent to manual KYC.", "Error");
                        setSeekerView("manual_kyc");
                    }}
                />
            );
        }
        if (seekerView === "manual_kyc") {
            return (
                <OnboardingLayout step={1} totalSteps={1} showAudioToggle={false}>
                    <SeekerManualKycScreen onBack={() => setSeekerView("sent")} />
                </OnboardingLayout>
            );
        }
        if (seekerView === "success") {
            return (
                <OnboardingLayout step={1} totalSteps={1} showAudioToggle={false}>
                    <SeekerSuccess onBack={() => setSeekerView("sent")} />
                </OnboardingLayout>
            );
        }
        if (seekerView === "rekyc") {
            return (
                <OnboardingLayout step={1} totalSteps={1} showAudioToggle={false}>
                    <SeekerRekycScreen reason={rekycReason} onBack={() => setSeekerView("sent")} />
                </OnboardingLayout>
            );
        }
        return (
            <OnboardingLayout step={1} totalSteps={3} showAudioToggle={false}>
                <SeekerCreateRequest
                    bankName={bankName}
                    onBack={() => setView("portal")}
                    onSent={() => setSeekerView("sent")}
                />
            </OnboardingLayout>
        );
    }

    return null;
}

export default function BankPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--background)]">Loading…</div>}>
            <BankContent />
        </Suspense>
    );
}
