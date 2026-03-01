"use client";

import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import LoKeyButton from "../components/LoKeyButton";
import StatusChip from "../components/StatusChip";
import { cn } from "../components/LoKeyButton";
import {
    AlertCircle,
    Check,
    X,
    Info,
    Clock,
    Building2,
    ShieldCheck,
    ArrowRight,
    Lock as LockIcon,
    Calendar,
    FileText,
    Zap,
    RotateCcw,
    XCircle,
    ShieldAlert,
    Undo
} from "lucide-react";
import { addAuditLog } from "../components/AuditLogger";

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

export default function RequestsPage() {
    const [requests, setRequests] = useState<KYCRequest[]>([]);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [kavachId, setKavachId] = useState<string>("ammar@kavach");
    const [activeTab, setActiveTab] = useState<string>("pending");

    useEffect(() => {
        const id = localStorage.getItem("kavach_user_id");
        const userId = id || "ammar@kavach";
        if (id) setKavachId(userId);

        const stored = localStorage.getItem("kavach_kyc_requests");
        if (stored) {
            const all: KYCRequest[] = JSON.parse(stored);
            const filtered = all.filter(
                (req) => !req.targetKavachId || req.targetKavachId === userId
            );
            setRequests(filtered);
        } else {
            const initialRequests: KYCRequest[] = [
                {
                    id: "req_1",
                    org: "HDFC Bank",
                    purpose: "Savings Account Opening",
                    fields: ["Full Name", "Aadhaar Number", "PAN Card", "Current Address"],
                    reason: "Regulatory requirement for Digital KYC as per RBI Master Direction on KYC.",
                    retention: "Duration of the customer relationship",
                    timestamp: "2 hours ago",
                    status: "pending"
                },
                {
                    id: "req_2",
                    org: "Swiggy",
                    purpose: "Delivery Partner Onboarding",
                    fields: ["Full Name", "Driving License", "Phone Number"],
                    reason: "Mandatory background verification as per aggregator policy.",
                    retention: "1 year from termination of contract",
                    timestamp: "5 hours ago",
                    status: "pending"
                },
                {
                    id: "req_3",
                    org: "Zomato",
                    purpose: "Customer Age Verification",
                    fields: ["Full Name", "Date of Birth"],
                    reason: "Verification of age for restricted item delivery.",
                    retention: "Single session use",
                    timestamp: "Yesterday",
                    status: "denied"
                },
                {
                    id: "req_4",
                    org: "Airtel",
                    purpose: "SIM Card Activation",
                    fields: ["Full Name", "Aadhaar Number", "Current Address"],
                    reason: "Telecom regulation compliance (e-KYC).",
                    retention: "Legal requirement (2 years)",
                    timestamp: "3 days ago",
                    status: "revoked"
                }
            ];
            setRequests(initialRequests);
            localStorage.setItem("kavach_kyc_requests", JSON.stringify(initialRequests));
        }
    }, []);

    const userId = kavachId;

    const handleAction = (id: string, action: "granted" | "denied" | "revoked") => {
        setLoadingAction(id + "_" + action);

        setTimeout(() => {
            const stored = localStorage.getItem("kavach_kyc_requests");
            const fullList: KYCRequest[] = stored ? JSON.parse(stored) : [];
            const updatedFull = fullList.map(req =>
                req.id === id ? { ...req, status: action, timestamp: action === "revoked" ? "Just now" : req.timestamp } : req
            );
            localStorage.setItem("kavach_kyc_requests", JSON.stringify(updatedFull));
            const filtered = updatedFull.filter(
                (req) => !req.targetKavachId || req.targetKavachId === userId
            );
            setRequests(filtered);

            // Logic for audit logging
            const targetReq = requests.find(r => r.id === id);
            let actionText = "";
            let statusText: "Success" | "Warning" | "Error" = "Success";

            if (action === "granted") {
                actionText = "KYC Data Shared";
            } else if (action === "denied") {
                actionText = "KYC Request Rejected";
                statusText = "Warning";
            } else if (action === "revoked") {
                actionText = "KYC Access Revoked";
                statusText = "Error";
            }

            addAuditLog(
                actionText,
                `${actionText} for ${targetReq?.purpose} with ${targetReq?.org}`,
                statusText
            );

            setLoadingAction(null);
        }, 1500);
    };

    const pendingRequests = requests.filter(r => r.status === "pending");
    const activeRequests = requests.filter(r => r.status === "granted");
    const deniedRequests = requests.filter(r => r.status === "denied");
    const revokedRequests = requests.filter(r => r.status === "revoked");

    return (
        <Layout currentPage="Requests">
            <PageHeader
                title="KYC Requests"
                breadcrumbs={[{ label: "Kavach" }, { label: "Security" }, { label: "Requests" }]}
                actions={
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end px-3 py-1.5 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/5 border border-[var(--primary-500)]/20">
                            <span className="text-[9px] font-800 uppercase text-[var(--muted-foreground)] tracking-tighter leading-none mb-0.5">Anchored Identity</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[13px] font-900 text-[var(--primary-500)]">{kavachId}</span>
                                <Zap className="w-3 h-3 text-[var(--primary-500)] fill-[var(--primary-500)]" />
                            </div>
                        </div>
                    </div>
                }
            />

            <main className="flex-1 overflow-y-auto p-6 bg-[var(--background)]">
                <div className="max-w-4xl mx-auto flex flex-col gap-8">

                    {/* Header Info */}
                    <div className="p-3 md:p-4 rounded-[var(--radius-xl)] bg-[var(--primary-500)]/5 border border-[var(--primary-500)]/20 flex gap-3 md:gap-4 items-start">
                        <Info className="w-5 h-5 text-[var(--primary-500)] shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-1">
                            <p className="text-[13px] md:text-[14px] font-700 text-[var(--neutral-900)] leading-tight">Secure Tokenized Sharing</p>
                            <p className="text-[11px] md:text-[12px] text-[var(--muted-foreground)] leading-relaxed">
                                When you grant a request, Kavach generates a unique, single-use token.
                                The requester never sees your original Aadhaar/PAN unless explicitly required by law.
                            </p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-[var(--border)] overflow-x-auto no-scrollbar">
                        {[
                            { id: "pending", label: "Inbound", count: pendingRequests.length },
                            { id: "active", label: "Active Access", count: activeRequests.length },
                            { id: "rejected", label: "Rejected", count: deniedRequests.length },
                            { id: "revoked", label: "Revoked", count: revokedRequests.length }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-6 py-4 text-[13px] font-800 uppercase tracking-widest whitespace-nowrap transition-all border-b-2 relative",
                                    activeTab === tab.id
                                        ? "border-[var(--primary-500)] text-[var(--primary-500)]"
                                        : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--neutral-900)]"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span className={cn(
                                            "w-4 h-4 rounded-full text-[9px] flex items-center justify-center",
                                            activeTab === tab.id ? "bg-[var(--primary-500)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                                        )}>
                                            {tab.count}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[400px]">

                        {/* 1. Pending Section */}
                        {activeTab === "pending" && (
                            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {pendingRequests.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        {pendingRequests.map((req) => (
                                            <RequestCard
                                                key={req.id}
                                                request={req}
                                                onGrant={() => handleAction(req.id, "granted")}
                                                onDeny={() => handleAction(req.id, "denied")}
                                                isLoading={loadingAction}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-16 text-center flex flex-col items-center gap-4 bg-[var(--card)] border border-dashed border-[var(--border)] rounded-[var(--radius-xl)] opacity-60">
                                        <div className="w-16 h-16 rounded-full bg-[var(--color-success-700)]/10 flex items-center justify-center">
                                            <Check className="w-8 h-8 text-[var(--color-success-700)]" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[16px] font-800 text-[var(--neutral-900)]">All Clear!</p>
                                            <p className="text-[13px] text-[var(--muted-foreground)] max-w-xs">You have no pending KYC requests at the moment.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 2. Active Access Section */}
                        {activeTab === "active" && (
                            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {activeRequests.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {activeRequests.map((req) => (
                                            <div key={req.id} className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-5 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-success-700)]"></div>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center group-hover:bg-[var(--color-success-700)]/5 transition-colors">
                                                            <Building2 className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[15px] font-800 text-[var(--neutral-900)]">{req.org}</span>
                                                            <span className="text-[11px] text-[var(--muted-foreground)] font-600 line-clamp-1">{req.purpose}</span>
                                                        </div>
                                                    </div>
                                                    <StatusChip status="completed" className="!px-2 !py-0 !h-5 !text-[9px]" />
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {req.fields.slice(0, 3).map((f: string, i: number) => (
                                                        <span key={i} className="px-2 py-0.5 bg-[var(--muted)] text-[10px] font-800 rounded border border-[var(--border)]">{f}</span>
                                                    ))}
                                                    {req.fields.length > 3 && <span className="text-[10px] text-[var(--muted-foreground)] font-700 self-center">+{req.fields.length - 3} more</span>}
                                                </div>
                                                <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-[var(--muted-foreground)] font-800 uppercase tracking-tighter">Authorized on</span>
                                                        <span className="text-[11px] text-[var(--neutral-800)] font-700">{req.timestamp}</span>
                                                    </div>
                                                    <LoKeyButton
                                                        variant="tertiary"
                                                        size="s"
                                                        onClick={() => handleAction(req.id, "revoked")}
                                                        disabled={!!loadingAction}
                                                        className="text-[var(--color-error-600)] border-none hover:bg-[var(--color-error-600)]/5 !px-3 font-800"
                                                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                                                    >
                                                        {loadingAction?.startsWith(req.id) ? "..." : "Revoke"}
                                                    </LoKeyButton>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-16 text-center border border-dashed border-[var(--border)] rounded-[var(--radius-xl)] opacity-40 flex flex-col items-center gap-2">
                                        <ShieldCheck className="w-10 h-10 mb-2" />
                                        <p className="text-[14px] font-800">No Active Sessions</p>
                                        <p className="text-[12px] max-w-xs mx-auto">None of your identity tokens are currently being accessed by external organizations.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. Rejected Section */}
                        {activeTab === "rejected" && (
                            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {deniedRequests.length > 0 ? (
                                    <div className="flex flex-col gap-3">
                                        {deniedRequests.map(req => (
                                            <div key={req.id} className="p-4 bg-[var(--color-error-600)]/[0.02] border border-[var(--color-error-600)]/10 rounded-[var(--radius-xl)] flex justify-between items-center hover:bg-[var(--color-error-600)]/[0.04] transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-[var(--color-error-600)]/5 flex items-center justify-center">
                                                        <ShieldAlert className="w-5 h-5 text-[var(--color-error-600)]" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[14px] font-800 text-[var(--neutral-900)]">{req.org}</span>
                                                        <span className="text-[12px] text-[var(--muted-foreground)]">{req.purpose}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-1">
                                                    <span className="px-2 py-0.5 bg-[var(--color-error-600)]/10 text-[var(--color-error-600)] text-[9px] font-900 uppercase tracking-wider rounded">Subscription Denied</span>
                                                    <span className="text-[10px] text-[var(--muted-foreground)] font-600">{req.timestamp}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-16 text-center border border-dashed border-[var(--border)] rounded-[var(--radius-xl)] opacity-40">
                                        <p className="text-[14px] font-800">Clear Record</p>
                                        <p className="text-[12px]">All incoming data requests have been handled or approved.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 4. Revoked Section */}
                        {activeTab === "revoked" && (
                            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {revokedRequests.length > 0 ? (
                                    <div className="flex flex-col gap-3">
                                        {revokedRequests.map(req => (
                                            <div key={req.id} className="p-4 bg-[var(--muted)]/20 border border-[var(--border)] rounded-[var(--radius-xl)] flex justify-between items-center opacity-80 hover:opacity-100 transition-opacity">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center">
                                                        <RotateCcw className="w-5 h-5 text-[var(--muted-foreground)]" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[14px] font-800 text-[var(--neutral-900)]">{req.org}</span>
                                                        <span className="text-[12px] text-[var(--muted-foreground)]">{req.purpose}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--neutral-200)] text-[var(--neutral-700)] text-[9px] font-900 uppercase tracking-wider rounded">
                                                        <Undo className="w-2.5 h-2.5" />
                                                        Access Revoked
                                                    </div>
                                                    <span className="text-[10px] text-[var(--muted-foreground)] font-600">{req.timestamp}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-16 text-center border border-dashed border-[var(--border)] rounded-[var(--radius-xl)] opacity-40">
                                        <p className="text-[14px] font-800">No Terminated Sessions</p>
                                        <p className="text-[12px]">You haven't revoked access to any organizations yet.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </Layout>
    );
}

function RequestCard({ request, onGrant, onDeny, isLoading }: { request: KYCRequest, onGrant: () => void, onDeny: () => void, isLoading?: string | null }) {
    return (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden shadow-elevation-md animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 flex flex-col gap-6">

                {/* Badge Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] border border-[var(--border)] shrink-0">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[15px] md:text-[16px] font-800 text-[var(--neutral-900)] leading-tight">{request.org}</span>
                            <span className="text-[11px] md:text-[12px] text-[var(--muted-foreground)]">Security Level: High (Tokenized)</span>
                        </div>
                    </div>
                    <div className="px-3 py-1 bg-[var(--primary-500)]/10 text-[var(--primary-500)] rounded-full text-[10px] md:text-[11px] font-700 flex items-center gap-1.5 w-fit">
                        <Clock className="w-3.5 h-3.5" /> {request.timestamp}
                    </div>
                </div>

                {/* Purpose and Reason */}
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-[12px] text-[var(--muted-foreground)] font-600 uppercase tracking-widest">Purpose</span>
                        <p className="text-[14px] font-700 text-[var(--neutral-900)]">{request.purpose}</p>
                    </div>
                    <div className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-lg)]">
                        <span className="text-[11px] text-[var(--muted-foreground)] font-700 mb-1 block">JUSTIFICATION / REASON</span>
                        <p className="text-[13px] text-[var(--neutral-800)] leading-relaxed italic">"{request.reason}"</p>
                    </div>
                </div>

                {/* Fields Table Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] md:text-[11px] text-[var(--muted-foreground)] font-800 uppercase tracking-widest">Requested Fields</span>
                        <div className="flex flex-wrap gap-1.5">
                            {request.fields.map((field, i) => (
                                <div key={i} className="px-2 py-1 bg-[var(--muted)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[11px] md:text-[12px] font-700 flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-[var(--primary-500)]" />
                                    {field}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] md:text-[11px] text-[var(--muted-foreground)] font-800 uppercase tracking-widest">Data Retention</span>
                        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-warning-600)]/5 border border-[var(--color-warning-600)]/20 rounded-[var(--radius-lg)] w-fit sm:w-auto">
                            <Calendar className="w-4 h-4 text-[var(--color-warning-600)]" />
                            <span className="text-[12px] md:text-[13px] font-700 text-[var(--neutral-900)]">{request.retention}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--border)]">
                    <LoKeyButton
                        variant="primary"
                        size="l"
                        className="flex-1 shadow-lg shadow-[var(--primary-500)]/10 w-full"
                        leftIcon={<Check className="w-4 h-4" />}
                        onClick={onGrant}
                        disabled={!!isLoading}
                    >
                        {isLoading && isLoading.startsWith(request.id) && isLoading.includes("granted") ? "Processing..." : "Grant KYC Request"}
                    </LoKeyButton>
                    <LoKeyButton
                        variant="tertiary"
                        size="l"
                        className="px-6 border-[var(--color-error-600)]/20 hover:bg-[var(--color-error-600)]/5 text-[var(--color-error-600)] w-full sm:w-auto"
                        leftIcon={<X className="w-4 h-4" />}
                        onClick={onDeny}
                        disabled={!!isLoading}
                    >
                        {isLoading && isLoading.startsWith(request.id) && isLoading.includes("denied") ? "Rejecting..." : "Deny"}
                    </LoKeyButton>
                </div>

            </div>
        </div>
    );
}
