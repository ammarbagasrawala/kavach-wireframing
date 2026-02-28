"use client";

import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import LoKeyButton from "../components/LoKeyButton";
import StatusChip from "../components/StatusChip";
import { cn } from "../components/LoKeyButton";
import {
    GraduationCap,
    Briefcase,
    Search,
    RefreshCw,
    Hash,
    Link as LinkIcon,
    ChevronDown,
    ChevronUp,
    Zap,
    Fingerprint,
    Lock as LockIcon,
    ShieldCheck,
    ShieldAlert,
    Trash2,
    FileText,
    EyeOff,
    Eye,
    Copy,
    Clock,
    X
} from "lucide-react";
import { EnrichmentHub } from "../components/EnrichmentHub";
import { addAuditLog } from "../components/AuditLogger";

export default function CredentialsPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [showPlain, setShowPlain] = useState<string | null>(null);
    const [fetchedDocs, setFetchedDocs] = useState<string[]>([]);
    const [issuedDocs, setIssuedDocs] = useState<string[]>(["aadhaar", "pan", "ckycr"]); // Default
    const [verified, setVerified] = useState(false);
    const [kavachId, setKavachId] = useState<string>("ammar@kavach");

    useEffect(() => {
        const id = localStorage.getItem("kavach_user_id");
        if (id) setKavachId(id);
        const isVerified = localStorage.getItem("kavach_identity_verified") === "true";
        setVerified(isVerified);

        const docs = localStorage.getItem("kavach_fetched_docs");
        if (docs) setFetchedDocs(JSON.parse(docs));

        const issued = localStorage.getItem("kavach_issued_docs");
        if (issued) setIssuedDocs(JSON.parse(issued));
    }, []);

    const handleDelete = (id: string, isIssued: boolean) => {
        if (isIssued) {
            const newIssued = issuedDocs.filter(d => d !== id);
            setIssuedDocs(newIssued);
            localStorage.setItem("kavach_issued_docs", JSON.stringify(newIssued));
        } else {
            const newFetched = fetchedDocs.filter(d => d !== id);
            setFetchedDocs(newFetched);
            localStorage.setItem("kavach_fetched_docs", JSON.stringify(newFetched));
        }
        addAuditLog("Credential Deleted", `Secure removal of ${id === 'pan' ? 'PAN' : id.toUpperCase()} authorized and completed`, "Warning");
    };

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
        "ssc": {
            name: "Class X Marksheet",
            issuer: "CBSE",
            icon: <GraduationCap />,
            data: { "Roll No": "204392", "Grade": "A1", "Passing Year": "2018", "School": "Delhi Public School" },
            ttl: "Permanent",
            theme: "blue"
        },
        "hsc": {
            name: "Class XII Marksheet",
            issuer: "CBSE",
            icon: <GraduationCap />,
            data: { "Roll No": "893201", "Grade": "A", "Passing Year": "2020", "Stream": "Science" },
            ttl: "Permanent",
            theme: "blue"
        },
        "degree": {
            name: "Degree Certificate",
            issuer: "Mumbai University",
            icon: <GraduationCap />,
            data: { "Student ID": "MU-9920", "GPA": "8.8", "Major": "Computer Science", "Awarded": "May 2024" },
            ttl: "Permanent",
            theme: "indigo"
        },
        "passport": {
            name: "Passport",
            issuer: "Min. of External Affairs",
            icon: <Search />,
            data: { "Passport No": "Z902834", "Nationality": "Indian", "Place of Issue": "Mumbai", "Birth Date": "15/08/2000" },
            ttl: "Valid until: 2032",
            theme: "navy"
        },
        "exp": {
            name: "Experience Letter",
            issuer: "Previous Employer",
            icon: <Briefcase />,
            data: { "Employee ID": "EMP-4421", "Role": "Jr. Developer", "Duration": "2 Years", "Verified": "HR Dept" },
            ttl: "Permanent",
            theme: "emerald"
        },
    };

    if (!isAuthenticated) {
        return (
            <Layout currentPage="Manage Credentials">
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
        <Layout currentPage="Manage Credentials">
            <PageHeader
                title="Manage Credentials"
                breadcrumbs={[{ label: "Kavach" }, { label: "Manage Credentials" }]}
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[var(--background)]">
                <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                    {/* Kavach Identity Header Card */}
                    <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5 md:p-6 shadow-elevation-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)]"></div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 border border-[var(--primary-500)]/20 flex items-center justify-center text-[var(--primary-500)] shrink-0">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[14px] font-800 uppercase text-[var(--muted-foreground)] tracking-widest leading-none">Discovery ID</span>
                                        <StatusChip status="completed" className="!px-1.5 !py-0 !h-4 !text-[9px]" />
                                    </div>
                                    <span className="text-[20px] md:text-[22px] font-900 text-[var(--neutral-900)] tracking-tight truncate">{kavachId}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-[var(--muted)]/50 p-3 rounded-[var(--radius-lg)] border border-[var(--border)]">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[var(--muted-foreground)] shadow-sm">
                                    <Fingerprint className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-800 uppercase text-[var(--muted-foreground)] tracking-tighter">Vault Status</span>
                                    <span className="text-[12px] font-700 text-[var(--neutral-900)]">Biometric Secured</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Core Identity Tokens */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h2 className="text-[14px] md:text-[16px] font-800 uppercase tracking-widest text-[var(--muted-foreground)] px-1">Core Identity Tokens</h2>
                            <div className="px-3 py-1 bg-[var(--color-success-700)]/10 text-[var(--color-success-700)] rounded-full text-[10px] md:text-[11px] font-800 flex items-center gap-1.5 w-fit">
                                <ShieldCheck className="w-3.5 h-3.5" /> Encrypted & Verified
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {issuedDocs.includes("aadhaar") && (
                                <CredentialCard
                                    name="Digital Aadhaar"
                                    issuer="UIDAI"
                                    type="Identity"
                                    theme="aadhaar"
                                    icon={<ShieldCheck />}
                                    data={{
                                        "UID Number": "XXXX-XXXX-9021",
                                        "Full Name": "Ammar B.",
                                        "DOB": "12-05-1995",
                                        "Address": "Mumbai, Maharashtra, 400001"
                                    }}
                                    isExpanded={showPlain === "aadhaar"}
                                    onToggle={() => setShowPlain(showPlain === "aadhaar" ? null : "aadhaar")}
                                    onDelete={() => handleDelete("aadhaar", true)}
                                    ttl="Valid until: 2034"
                                    txId="0x4a2b...f912"
                                    hash="sha256:e3b0c442...8b1a"
                                />
                            )}
                            {issuedDocs.includes("pan") && (
                                <CredentialCard
                                    name="Permanent Account Number"
                                    issuer="Income Tax Dept"
                                    type="Tax"
                                    theme="pan"
                                    icon={<FileText />}
                                    data={{
                                        "PAN Number": "ABCDE1234F",
                                        "Cardholder": "AMMAR BAGASRAWALA",
                                        "Category": "Individual",
                                        "Issued": "Jan 2018"
                                    }}
                                    isExpanded={showPlain === "pan"}
                                    onToggle={() => setShowPlain(showPlain === "pan" ? null : "pan")}
                                    onDelete={() => handleDelete("pan", true)}
                                    ttl="Permanent"
                                    txId="0x89c1...d045"
                                    hash="sha256:7f83b1...32c9"
                                />
                            )}
                            {issuedDocs.includes("passport") && (
                                <CredentialCard
                                    name="Passport Token"
                                    issuer="Min. of External Affairs"
                                    type="Identity"
                                    theme="navy"
                                    icon={<Search />}
                                    data={{
                                        "Passport No": "Z902834",
                                        "Nationality": "Indian",
                                        "Place of Issue": "Mumbai",
                                        "Birth Date": "15/08/2000"
                                    }}
                                    isExpanded={showPlain === "passport"}
                                    onToggle={() => setShowPlain(showPlain === "passport" ? null : "passport")}
                                    onDelete={() => handleDelete("passport", true)}
                                    ttl="Valid until: 2032"
                                    txId="0x2f91...e832"
                                    hash="sha256:8b2a...c011"
                                />
                            )}
                            {issuedDocs.includes("voter") && (
                                <CredentialCard
                                    name="Voter Identity"
                                    issuer="Election Commission"
                                    type="Identity"
                                    theme="indigo"
                                    icon={<Fingerprint />}
                                    data={{
                                        "EPIC Number": "ABC1234567",
                                        "Constituency": "Mumbai South",
                                        "Section No": "124",
                                        "Polling Stn": "St. Xavier's High"
                                    }}
                                    isExpanded={showPlain === "voter"}
                                    onToggle={() => setShowPlain(showPlain === "voter" ? null : "voter")}
                                    onDelete={() => handleDelete("voter", true)}
                                    ttl="Valid until: 2039"
                                    txId="0x5c7a...d901"
                                    hash="sha256:ef32...b998"
                                />
                            )}
                            {issuedDocs.includes("ckycr") && (
                                <CredentialCard
                                    name="CKYCR Record"
                                    issuer="Central Registry"
                                    type="KYC"
                                    theme="blue"
                                    icon={<ShieldCheck />}
                                    data={{
                                        "CKYC Number": "40023910022",
                                        "KYC Date": "10/02/2024",
                                        "Auth Source": "Bank of Baroda",
                                        "Status": "Verified"
                                    }}
                                    isExpanded={showPlain === "ckycr"}
                                    onToggle={() => setShowPlain(showPlain === "ckycr" ? null : "ckycr")}
                                    onDelete={() => handleDelete("ckycr", true)}
                                    ttl="Permanent"
                                    txId="0x9a2c...b112"
                                    hash="sha256:d1e2...f3g4"
                                />
                            )}
                        </div>
                    </div>

                    {/* Enriched Documents Section */}
                    {fetchedDocs.length > 0 && (
                        <div className="flex flex-col gap-4 pt-4 border-t border-[var(--border)]">
                            <h2 className="text-[14px] md:text-[16px] font-800 uppercase tracking-widest text-[var(--muted-foreground)] px-1">Linked Documents</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {fetchedDocs.map((docId) => {
                                    const doc = docLibrary[docId];
                                    if (!doc) return null;
                                    return (
                                        <CredentialCard
                                            key={docId}
                                            name={doc.name}
                                            issuer={doc.issuer}
                                            type="Education"
                                            theme={doc.theme || "blue"}
                                            icon={doc.icon}
                                            data={doc.data}
                                            isExpanded={showPlain === docId}
                                            onToggle={() => setShowPlain(showPlain === docId ? null : docId)}
                                            onDelete={() => handleDelete(docId, false)}
                                            ttl={doc.ttl || "Permanent"}
                                            txId={`0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`}
                                            hash={`sha256:${Math.random().toString(36).slice(2, 15)}...`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Merge Section: Add More Documents */}
                    <div className="mt-8 pt-8 border-t-2 border-dashed border-[var(--border)]">
                        <div className="max-w-3xl mx-auto bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 md:p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-[var(--primary-500)] text-white flex items-center justify-center">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-[18px] font-800 tracking-tight">Add More Documents</h3>
                                    <p className="text-[12px] text-[var(--muted-foreground)]">Enrich your identity profile with utility and educational records.</p>
                                </div>
                            </div>
                            <EnrichmentHub standalone onNext={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
                        </div>
                    </div>

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

function CredentialCard({
    name,
    issuer,
    type,
    icon,
    data,
    isExpanded,
    onToggle,
    onDelete,
    ttl,
    txId,
    hash,
    theme = "blue"
}: any) {
    const [showProof, setShowProof] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAuthPending, setIsAuthPending] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [lastSynced, setLastSynced] = useState("Just Now");

    const themes: Record<string, string> = {
        aadhaar: "from-[var(--primary-500)] to-[var(--primary-600)]",
        pan: "from-[var(--neutral-800)] to-[var(--neutral-900)]",
        navy: "from-[var(--neutral-900)] to-[var(--neutral-950)]",
        blue: "from-[var(--primary-500)] to-[var(--primary-600)]",
        indigo: "from-[var(--primary-600)] to-[var(--neutral-900)]",
        emerald: "from-[var(--color-success-700)] to-[color-mix(in_srgb,var(--color-success-700),black_15%)]",
        sky: "from-[var(--color-info-600)] to-[var(--primary-500)]",
        rose: "from-[var(--primary-500)] to-[var(--primary-600)]",
    };

    const handleRefresh = () => {
        setIsVerifying(true);
        setOtp(["", "", "", "", "", ""]);
    };

    const handleVerifyOtp = () => {
        if (otp.some(d => !d)) return;
        setIsVerifying(false);
        setIsRefreshing(true);
        addAuditLog("Registry Sync Authorized", `OTP verified for ${name}. Starting data fetch...`);
        setTimeout(() => {
            setIsRefreshing(false);
            setLastSynced("Just Now");
            addAuditLog("Registry Sync Complete", `Updated data for ${name} from ${issuer}`, "Success");
        }, 2000);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) document.getElementById(`refresh-otp-${index + 1}-${name}`)?.focus();
    };

    const onToggleExpand = () => {
        if (!isExpanded) {
            addAuditLog("Credential View", `Sensitive data decrypted and viewed for ${name}`, "Info");
        }
        onToggle();
    };

    return (
        <div className={cn(
            "group bg-white border border-[var(--border)] rounded-[var(--radius-xl)] transition-all overflow-hidden relative shadow-elevation-sm hover:shadow-elevation-md",
            isExpanded && "ring-2 ring-[var(--primary-500)]/20 border-[var(--primary-500)]/30"
        )}>
            {/* Header / Top Ribbon */}
            <div className={cn("h-1.5 w-full bg-gradient-to-r", themes[theme] || themes.blue)}></div>

            <div className="p-5 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                        <div className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 rounded-[var(--radius-lg)] bg-gradient-to-br flex items-center justify-center text-white shrink-0",
                            themes[theme] || themes.blue
                        )}>
                            {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" } as any)}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[15px] sm:text-[16px] font-800 tracking-tight text-[var(--neutral-900)] leading-tight truncate">{name}</span>
                            <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
                                <span className="text-[10px] sm:text-[11px] font-700 uppercase tracking-wider text-[var(--muted-foreground)] truncate max-w-[100px] sm:max-w-none">{issuer}</span>
                                <span className="h-0.5 w-0.5 rounded-full bg-[var(--border)] shrink-0"></span>
                                <StatusChip status="completed" className="!px-1 !py-0 !h-3.5 !text-[8.5px] sm:!text-[9px]" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between w-full sm:w-auto gap-1.5 sm:gap-1.5 mt-1 sm:mt-0">
                        <span className="text-[9px] sm:text-[10px] font-800 text-[var(--primary-500)] bg-[var(--primary-500)]/5 px-2 py-0.5 rounded-full border border-[var(--primary-500)]/10 uppercase tracking-tighter w-fit">
                            {ttl}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleRefresh}
                                className={cn(
                                    "p-1.5 sm:p-2 rounded-full hover:bg-[var(--muted)] transition-all text-[var(--primary-500)] relative",
                                    isRefreshing && "animate-spin"
                                )}
                                title="Sync from Registry"
                            >
                                <RefreshCw className="w-3.5 h-3.5 sm:w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsDeleting(true)}
                                className="p-1.5 sm:p-2 rounded-full hover:bg-[var(--color-destructive-600)]/10 transition-colors text-[var(--muted-foreground)] hover:text-[var(--color-destructive-600)]"
                                title="Delete Credential"
                            >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 h-4" />
                            </button>
                            <button
                                onClick={onToggleExpand}
                                className="p-1.5 sm:p-2 rounded-full hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]"
                            >
                                {isExpanded ? <EyeOff className="w-4 h-4 sm:w-5 h-5 text-[var(--neutral-900)]" /> : <Eye className="w-4 h-4 sm:w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Compact Info Preview (Only when not expanded) */}
                {!isExpanded && (
                    <div className="flex items-center justify-between text-[11px] px-1">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-[var(--muted-foreground)] font-600">
                                <Clock className="w-3.5 h-3.5" />
                                {lastSynced}
                            </div>
                            <div className="flex items-center gap-1.5 text-[var(--color-success-700)] font-700">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Verified
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-[var(--muted-foreground)] italic font-500">
                            Click to reveal all data
                        </div>
                    </div>
                )}
            </div>

            {isVerifying && (
                <div className="absolute inset-x-0 bottom-0 top-1.5 bg-white/98 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <button onClick={() => {
                        setIsVerifying(false);
                        addAuditLog("Sync Cancelled", `Registry authentication for ${name} aborted by user`, "Warning");
                    }} className="absolute top-4 right-4 p-2 text-[var(--muted-foreground)] hover:text-black">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col items-center gap-5 text-center max-w-[320px]">
                        <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-r", themes[theme])}>
                            <LockIcon className="w-7 h-7" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <h4 className="text-[18px] font-900 tracking-tight">registry authentication</h4>
                            <p className="text-[12px] text-[var(--muted-foreground)] font-500 leading-relaxed px-4">
                                Confirm OTP sent by <strong>{issuer}</strong> to authorize a fresh data synchronization.
                            </p>
                        </div>
                        <div className="grid grid-cols-6 gap-1.5 md:gap-2 w-full mt-2">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    id={`refresh-otp-${i}-${name}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                                    className="w-full aspect-square text-center text-[16px] md:text-[18px] font-900 rounded-[var(--radius-md)] border-2 border-[var(--border)] bg-white focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-500)]/10 outline-none transition-all px-0"
                                    autoFocus={i === 0}
                                />
                            ))}
                        </div>
                        <LoKeyButton
                            variant="primary"
                            size="l"
                            className="w-full mt-4 h-14"
                            disabled={otp.some(d => !d)}
                            onClick={handleVerifyOtp}
                        >
                            Authorize & Sync
                        </LoKeyButton>
                    </div>
                </div>
            )}

            {isExpanded && (
                <div className="px-5 pb-5 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col gap-4 bg-[var(--muted)]/20 rounded-[var(--radius-xl)] border border-[var(--border)] p-4">
                        {/* Structured Data View */}
                        <div className="flex flex-col divide-y divide-[var(--border)]/50">
                            {Object.entries(data).map(([key, value]: [string, any]) => (
                                <div key={key} className="py-3 flex flex-col xs:flex-row xs:items-center justify-between gap-2 group/row">
                                    <div className="flex flex-col gap-0.5 overflow-hidden">
                                        <span className="text-[9px] sm:text-[10px] font-800 uppercase tracking-widest text-[var(--muted-foreground)]">{key}</span>
                                        <span className="text-[13px] sm:text-[14px] font-700 text-[var(--neutral-900)] font-mono tracking-tight break-all">{isRefreshing ? "••••••••" : value}</span>
                                    </div>
                                    <div className="flex items-center justify-between xs:justify-end gap-2 shrink-0">
                                        <div className="h-5 px-1.5 rounded bg-[var(--color-success-700)]/5 border border-[var(--color-success-700)]/10 flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3 text-[var(--color-success-700)]" />
                                            <span className="text-[8px] sm:text-[9px] font-800 text-[var(--color-success-700)] uppercase">Registry Verified</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(value);
                                                addAuditLog("Data Extraction", `Authorized copy of ${key} from ${name} to clipboard`, "Info");
                                                alert(`${key} copied to clipboard`);
                                            }}
                                            className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary-500)] opacity-100 xs:opacity-0 xs:group-hover/row:opacity-100 transition-opacity"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Prominent Refresh Status */}
                        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/50">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded bg-[var(--primary-500)]/10 text-[var(--primary-500)]">
                                    <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-800 uppercase tracking-tighter text-[var(--muted-foreground)] leading-none mb-0.5">Last Full Sync</span>
                                    <span className="text-[12px] font-700 text-[var(--neutral-900)] leading-none">{isRefreshing ? "In Progress..." : lastSynced}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleRefresh}
                                className="text-[11px] font-800 text-[var(--primary-500)] hover:underline px-2 py-1"
                            >
                                Refresh Now
                            </button>
                        </div>
                    </div>

                    {/* Blockchain Proof Section */}
                    <div className="mt-4 border border-[var(--border)] rounded-[var(--radius-xl)] bg-white overflow-hidden shadow-sm">
                        <button
                            onClick={() => {
                                if (!showProof) {
                                    addAuditLog("Proof Verification", `Integrity check performed for ${name} against blockchain fingerprints`, "Info");
                                }
                                setShowProof(!showProof);
                            }}
                            className="w-full px-4 py-3 flex items-center justify-between bg-[var(--muted)]/5 hover:bg-[var(--muted)]/10 transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <LinkIcon className="w-4 h-4 text-[var(--primary-500)]" />
                                <span className="text-[12px] font-900 uppercase tracking-widest">Trust & Blockchain Fingerprint</span>
                            </div>
                            {showProof ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {showProof && (
                            <div className="p-4 flex flex-col gap-4 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2 text-[10px] font-800 text-[var(--muted-foreground)] uppercase tracking-wider">
                                            <Hash className="w-3.5 h-3.5" /> Transaction ID
                                        </div>
                                        <code className="text-[11px] font-700 bg-[var(--muted)]/50 p-2.5 rounded-[var(--radius-md)] border border-[var(--border)] break-all text-[var(--neutral-800)] font-mono">
                                            {txId}
                                        </code>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2 text-[10px] font-800 text-[var(--muted-foreground)] uppercase tracking-wider">
                                            <ShieldCheck className="w-3.5 h-3.5" /> Content Hash
                                        </div>
                                        <code className="text-[11px] font-700 bg-[var(--muted)]/50 p-2.5 rounded-[var(--radius-md)] border border-[var(--border)] break-all text-[var(--neutral-800)] font-mono">
                                            {hash}
                                        </code>
                                    </div>
                                </div>
                                <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-success-700)]/5 border border-[var(--color-success-700)]/10 flex gap-3">
                                    <ShieldCheck className="w-5 h-5 text-[var(--color-success-700)] shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-[var(--color-success-700)] font-600 leading-tight">
                                        This credential's integrity is cryptographically verified against the Kavach Blockchain Network. The content hash ensures zero-tampering since issuance.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isDeleting && (
                <div className="absolute inset-x-0 bottom-0 top-1.5 bg-white/98 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {!isAuthPending ? (
                        <div className="flex flex-col items-center gap-5 text-center max-w-[320px]">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center text-[var(--color-destructive-600)] bg-[var(--color-destructive-600)]/10 border border-[var(--color-destructive-600)]/20 shadow-sm shadow-[var(--color-destructive-600)]/10">
                                <ShieldAlert className="w-7 h-7" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <h4 className="text-[18px] font-900 tracking-tight text-[var(--neutral-900)]">confirm removal</h4>
                                <p className="text-[12px] text-[var(--muted-foreground)] font-500 leading-relaxed px-4">
                                    You are about to securely remove <strong>{name}</strong> from your Kavach vault.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 w-full mt-2">
                                <LoKeyButton
                                    variant="primary"
                                    size="l"
                                    className="w-full h-12 bg-[var(--color-destructive-600)] hover:bg-[var(--color-destructive-700)] border-none shadow-md shadow-[var(--color-destructive-600)]/20"
                                    onClick={() => setIsAuthPending(true)}
                                >
                                    Proceed to Delete
                                </LoKeyButton>
                                <button
                                    onClick={() => setIsDeleting(false)}
                                    className="text-[12px] font-700 text-[var(--muted-foreground)] hover:text-[var(--neutral-900)] transition-colors h-10"
                                >
                                    Cancel & Return
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-6 text-center max-w-[320px] animate-in zoom-in duration-300">
                            <div className="w-16 h-16 rounded-full bg-[var(--primary-500)]/5 flex items-center justify-center text-[var(--primary-500)] relative">
                                <Fingerprint className="w-8 h-8" />
                                <div className="absolute inset-[-4px] border border-[var(--primary-500)]/30 rounded-full animate-ping opacity-20"></div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <h4 className="text-[17px] font-900 tracking-tight">Biometric Authorization</h4>
                                <p className="text-[12px] text-[var(--muted-foreground)] font-500 leading-relaxed">
                                    Scanning fingerprint to authorize the permanent deletion of this credential record.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 w-full">
                                <LoKeyButton
                                    variant="primary"
                                    size="l"
                                    className="w-full h-12"
                                    onClick={() => {
                                        setTimeout(() => {
                                            onDelete();
                                        }, 1000);
                                    }}
                                >
                                    Simulate Match
                                </LoKeyButton>
                                <button
                                    onClick={() => setIsAuthPending(false)}
                                    className="text-[12px] font-700 text-[var(--muted-foreground)]"
                                >
                                    Switch to PIN
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
