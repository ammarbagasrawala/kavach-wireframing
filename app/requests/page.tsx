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
    ChevronRight,
    Calendar,
    FileText
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
    status: "pending" | "granted" | "denied";
}

export default function RequestsPage() {
    const [requests, setRequests] = useState<KYCRequest[]>([]);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("kavach_kyc_requests");
        if (stored) {
            setRequests(JSON.parse(stored));
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
                }
            ];
            setRequests(initialRequests);
            localStorage.setItem("kavach_kyc_requests", JSON.stringify(initialRequests));
        }
    }, []);

    const handleAction = (id: string, action: "granted" | "denied") => {
        setLoadingAction(id + "_" + action);

        setTimeout(() => {
            const updatedRequests = requests.map(req =>
                req.id === id ? { ...req, status: action } : req
            );
            setRequests(updatedRequests);
            localStorage.setItem("kavach_kyc_requests", JSON.stringify(updatedRequests));

            // Logic for audit logging
            const targetReq = requests.find(r => r.id === id);
            addAuditLog(
                action === "granted" ? "KYC Data Shared" : "KYC Request Rejected",
                `${action === "granted" ? "Tokenized KYC package" : "Data request"} for ${targetReq?.purpose} shared with ${targetReq?.org}`,
                action === "granted" ? "Success" : "Warning"
            );

            setLoadingAction(null);
        }, 1500);
    };

    const pendingRequests = requests.filter(r => r.status === "pending");
    const historyRequests = requests.filter(r => r.status !== "pending");

    return (
        <Layout currentPage="Requests">
            <PageHeader
                title="KYC Requests"
                breadcrumbs={[{ label: "Kavach" }, { label: "Security" }, { label: "Requests" }]}
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

                    {/* Pending Section */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-[16px] font-700 flex items-center gap-2">
                            Inbound Requests
                            <span className="px-2 py-0.5 bg-[var(--primary-500)] text-white text-[10px] rounded-full">{pendingRequests.length}</span>
                        </h2>

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
                            <div className="p-12 text-center flex flex-col items-center gap-3 bg-[var(--card)] border border-dashed border-[var(--border)] rounded-[var(--radius-xl)] opacity-60">
                                <Check className="w-10 h-10 text-[var(--color-success-700)]" />
                                <p className="text-[14px] font-600">All caught up! No pending KYC requests.</p>
                            </div>
                        )}
                    </div>

                    {/* History Section */}
                    {historyRequests.length > 0 && (
                        <div className="flex flex-col gap-4 pt-4 border-t border-[var(--border)]">
                            <h2 className="text-[16px] font-700 text-[var(--muted-foreground)]">Recent Actions</h2>
                            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden">
                                <div className="overflow-x-auto md:overflow-visible">
                                    <div className="min-w-0 md:min-w-[700px]">
                                        <table className="w-full text-left border-collapse flex flex-col md:table">
                                            <thead className="bg-[var(--background)] border-b border-[var(--border)] text-[10px] md:text-[11px] font-700 text-[var(--muted-foreground)] uppercase hidden md:table-header-group">
                                                <tr>
                                                    <th className="px-6 py-4">Requester</th>
                                                    <th className="px-6 py-4">Purpose</th>
                                                    <th className="px-6 py-4">Action</th>
                                                    <th className="px-6 py-4 text-right">Timestamp</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border)]">
                                                {historyRequests.map((req) => (
                                                    <tr key={req.id} className="text-[13px] hover:bg-[var(--muted)]/20 transition-colors flex flex-col md:table-row py-4 md:py-0 px-6 md:px-0">
                                                        <td className="md:px-6 md:py-4 font-700 border-none md:border-b">
                                                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                                                <span className="text-[14px] md:text-[13px]">{req.org}</span>
                                                                <span className="text-[11px] text-[var(--muted-foreground)] md:hidden">Recently</span>
                                                            </div>
                                                        </td>
                                                        <td className="md:px-6 md:py-4 text-[var(--muted-foreground)] border-none md:border-b mb-2 md:mb-0">{req.purpose}</td>
                                                        <td className="md:px-6 md:py-4 border-none md:border-b mb-2 md:mb-0">
                                                            <div className={cn(
                                                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-800 uppercase",
                                                                req.status === "granted" ? "bg-[var(--color-success-700)]/10 text-[var(--color-success-700)]" : "bg-[var(--color-error-600)]/10 text-[var(--color-error-600)]"
                                                            )}>
                                                                {req.status === "granted" ? "Granted" : "Denied"}
                                                            </div>
                                                        </td>
                                                        <td className="md:px-6 md:py-4 md:text-right text-[var(--muted-foreground)] border-none md:border-b hidden md:table-cell">Recently</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
