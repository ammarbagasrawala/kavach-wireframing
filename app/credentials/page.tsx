"use client";

import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import LoKeyButton from "../components/LoKeyButton";
import { cn } from "../components/LoKeyButton";
import {
    Fingerprint,
    Lock as LockIcon,
    ChevronRight,
    Eye,
    EyeOff,
    ShieldCheck,
    FileText,
    Copy,
    GraduationCap,
    Briefcase,
    Search
} from "lucide-react";

export default function CredentialsPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [showPlain, setShowPlain] = useState<string | null>(null);
    const [fetchedDocs, setFetchedDocs] = useState<string[]>([]);
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        const isVerified = localStorage.getItem("kavach_identity_verified") === "true";
        setVerified(isVerified);

        const docs = localStorage.getItem("kavach_fetched_docs");
        if (docs) setFetchedDocs(JSON.parse(docs));
    }, []);

    const handleAuth = () => {
        setIsAuthenticating(true);
        setTimeout(() => {
            setIsAuthenticated(true);
            setIsAuthenticating(false);

            // Audit log for access
            const logs = JSON.parse(localStorage.getItem("kavach_audit_logs") || "[]");
            logs.unshift({
                id: `auth-${Date.now()}-${Math.random()}`,
                action: "Vault Unlocked",
                details: "Secure access via Biometric Authentication",
                time: "Just Now",
                status: "Success"
            });
            localStorage.setItem("kavach_audit_logs", JSON.stringify(logs));
        }, 2000);
    };

    const docLibrary: Record<string, any> = {
        "ssc": { name: "Class X Marksheet", issuer: "CBSE", icon: <GraduationCap />, data: "Roll: 204392, Grade: A1, Year: 2018" },
        "hsc": { name: "Class XII Marksheet", issuer: "CBSE", icon: <GraduationCap />, data: "Roll: 893201, Grade: A, Year: 2020" },
        "degree": { name: "Degree Certificate", issuer: "Mumbai University", icon: <GraduationCap />, data: "ID: MU-9920, GPA: 8.8, Major: CS" },
        "passport": { name: "Passport", issuer: "Min. of External Affairs", icon: <Search />, data: "No: Z902834, Expiry: 2032" },
        "exp": { name: "Experience Letter", issuer: "Previous Employer", icon: <Briefcase />, data: "Role: Jr. Developer, Tenured: 2 Yrs" },
    };

    if (!isAuthenticated) {
        return (
            <Layout currentPage="My Credentials">
                <main className="flex-1 flex flex-col items-center justify-center bg-[var(--background)] p-4 md:p-6">
                    <div className="w-full max-w-[420px] bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 md:p-8 text-center flex flex-col gap-6 shadow-elevation-lg animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] mx-auto relative">
                            {isAuthenticating ? (
                                <div className="absolute inset-0 border-4 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Fingerprint className="w-8 h-8 md:w-10 md:h-10" />
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <h2 className="text-[18px] md:text-[20px] font-800 tracking-tight">Access Restricted</h2>
                            <p className="text-[13px] md:text-[14px] text-[var(--muted-foreground)] leading-relaxed">
                                Please authenticate using your device biometrics to view your secure credentials.
                            </p>
                        </div>
                        <LoKeyButton
                            variant="primary"
                            className="w-full"
                            size="xl"
                            onClick={handleAuth}
                            disabled={isAuthenticating}
                        >
                            {isAuthenticating ? "Authenticating..." : "Use Biometrics"}
                        </LoKeyButton>
                        <button className="text-[13px] font-600 text-[var(--primary-500)] hover:underline">
                            Use Security PIN
                        </button>
                    </div>
                </main>
            </Layout>
        );
    }

    return (
        <Layout currentPage="My Credentials">
            <PageHeader
                title="Secure Vault"
                breadcrumbs={[{ label: "Kavach" }, { label: "My Credentials" }]}
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[var(--background)]">
                <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                    {/* Basic Identity Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h2 className="text-[14px] md:text-[16px] font-800 uppercase tracking-widest text-[var(--muted-foreground)] px-1">Core Identity Tokens</h2>
                            <div className="px-3 py-1 bg-[var(--color-success-700)]/10 text-[var(--color-success-700)] rounded-full text-[10px] md:text-[11px] font-800 flex items-center gap-1.5 w-fit">
                                <ShieldCheck className="w-3.5 h-3.5" /> Encrypted & Verified
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CredentialCard
                                name="Digital Aadhaar"
                                issuer="UIDAI"
                                type="Identity"
                                icon={<ShieldCheck />}
                                data="UID: XXXX-XXXX-9021, Address: Mumbai, MH"
                                isExpanded={showPlain === "aadhaar"}
                                onToggle={() => setShowPlain(showPlain === "aadhaar" ? null : "aadhaar")}
                            />
                            <CredentialCard
                                name="Permanent Account Number"
                                issuer="Income Tax Dept"
                                type="Tax"
                                icon={<FileText />}
                                data="PAN: ABCDE1234F, Type: Individual"
                                isExpanded={showPlain === "pan"}
                                onToggle={() => setShowPlain(showPlain === "pan" ? null : "pan")}
                            />
                        </div>
                    </div>

                    {/* Enriched Documents Section */}
                    {fetchedDocs.length > 0 && (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-[14px] md:text-[16px] font-800 uppercase tracking-widest text-[var(--muted-foreground)] px-1">Linked Documents</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {fetchedDocs.map((docId) => {
                                    const doc = docLibrary[docId];
                                    if (!doc) return null;
                                    return (
                                        <CredentialCard
                                            key={docId}
                                            name={doc.name}
                                            issuer={doc.issuer}
                                            type="Education"
                                            icon={doc.icon}
                                            data={doc.data}
                                            isExpanded={showPlain === docId}
                                            onToggle={() => setShowPlain(showPlain === docId ? null : docId)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {!verified && fetchedDocs.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center gap-4 bg-[var(--card)] border border-dashed border-[var(--border)] rounded-[var(--radius-xl)]">
                            <LockIcon className="w-12 h-12 text-[var(--muted-foreground)] opacity-20" />
                            <p className="text-[14px] text-[var(--muted-foreground)]">No active credentials to display. Complete verification to unlock.</p>
                            <LoKeyButton variant="tertiary" size="s" onClick={() => window.location.href = "/create-vc"}>
                                Unlock Now
                            </LoKeyButton>
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    );
}

function CredentialCard({ name, issuer, type, icon, data, isExpanded, onToggle }: any) {
    return (
        <div className={cn(
            "bg-[var(--card)] border rounded-[var(--radius-lg)] transition-all overflow-hidden",
            isExpanded ? "border-[var(--primary-500)] ring-1 ring-[var(--primary-500)]/10" : "border-[var(--border)]"
        )}>
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] shrink-0">
                        {icon}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[14px] font-700">{name}</span>
                        <span className="text-[11px] text-[var(--muted-foreground)]">{issuer} • {type}</span>
                    </div>
                </div>
                <button
                    onClick={onToggle}
                    className="p-2 rounded-full hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]"
                >
                    {isExpanded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-[var(--border)] bg-[var(--background)] animate-in slide-in-from-top-2 duration-200">
                    <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--muted)]/50 border border-[var(--border)] flex items-center justify-between gap-4">
                        <code className="text-[12px] font-500 text-[var(--neutral-900)] break-all">{data}</code>
                        <button className="p-1.5 hover:text-[var(--primary-500)] shrink-0">
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
