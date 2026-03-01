"use client";

import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import LoKeyButton from "../components/LoKeyButton";
import StatusChip from "../components/StatusChip";
import { cn } from "../components/LoKeyButton";
import {
    UserPlus,
    Download,
    ShieldCheck,
    Trash2,
    Fingerprint,
    ArrowRight,
    ChevronRight,
    ChevronLeft,
    X,
    Smartphone,
    CheckCircle2,
    Info,
    FileText,
    Layers,
    User,
    Calendar,
    Heart,
    Lock,
    Clock
} from "lucide-react";
import { addAuditLog } from "../components/AuditLogger";

interface Nominee {
    id: string;
    name: string;
    relationship: string;
    dob: string;
    mobile: string;
    email?: string;
    idType: string;
    idNumber: string;
    status: "verified" | "pending_consent";
    source: "digilocker" | "manual";
}

export default function NomineesPage() {
    const [nominees, setNominees] = useState<Nominee[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [addMode, setAddMode] = useState<"choice" | "import" | "manual">("choice");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isVerifyingDelete, setIsVerifyingDelete] = useState(false);
    const [deleteVerifyMode, setDeleteVerifyMode] = useState<"choice" | "biometric" | "pin">("choice");
    const [deletePin, setDeletePin] = useState(["", "", "", "", "", ""]);

    // Form State
    const [formData, setFormData] = useState<Partial<Nominee>>({
        relationship: "Spouse",
        status: "pending_consent",
        idType: "Aadhaar"
    });

    // DigiLocker Import State
    const [importedNominees, setImportedNominees] = useState<Nominee[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("kavach_nominees");
        if (stored) {
            setNominees(JSON.parse(stored));
        } else {
            // Initial mock data
            const initial: Nominee[] = [
                {
                    id: "nom-1",
                    name: "Sara Bagasrawala",
                    relationship: "Spouse",
                    dob: "12/03/1996",
                    mobile: "9876543210",
                    idType: "Aadhaar",
                    idNumber: "XXXX XXXX 1234",
                    status: "verified",
                    source: "manual"
                }
            ];
            setNominees(initial);
            localStorage.setItem("kavach_nominees", JSON.stringify(initial));
        }
    }, []);

    const saveNominees = (updated: Nominee[]) => {
        setNominees(updated);
        localStorage.setItem("kavach_nominees", JSON.stringify(updated));
    };

    const handleDeleteClick = (id: string) => {
        setDeletingId(id);
        setIsVerifyingDelete(true);
        setDeleteVerifyMode("choice");
        setDeletePin(["", "", "", "", "", ""]);
    };

    const confirmDelete = () => {
        if (!deletingId) return;

        const nomineeName = nominees.find(n => n.id === deletingId)?.name;
        const updated = nominees.filter(n => n.id !== deletingId);
        saveNominees(updated);
        addAuditLog("Nominee Removed", `Nominee ${nomineeName} record was securely deleted after biometric verification`, "Warning");
        setIsVerifyingDelete(false);
        setDeletingId(null);
    };

    const handleImportFromDigiLocker = () => {
        setLoading("import");
        setTimeout(() => {
            const fetched: Nominee[] = [
                {
                    id: "dl-1",
                    name: "Ahmed Bagasrawala",
                    relationship: "Son",
                    dob: "05/11/2021",
                    mobile: "9876543210",
                    idType: "Aadhaar",
                    idNumber: "XXXX XXXX 9988",
                    status: "verified",
                    source: "digilocker",
                    email: "ahmed@example.com"
                }
            ];
            setImportedNominees(fetched);
            setLoading(null);
            setStep(2);
        }, 2000);
    };

    const handleAddManual = () => {
        setLoading("manual");
        setTimeout(() => {
            setLoading(null);
            setStep(1);
            setAddMode("manual");
        }, 800);
    };

    const handleFinalSubmit = () => {
        const newNominee: Nominee = {
            ...formData,
            id: `nom-${Date.now()}`,
            status: "verified",
            source: "manual"
        } as Nominee;

        const updated = [...nominees, newNominee];
        saveNominees(updated);
        addAuditLog("Nominee Added", `New nominee ${newNominee.name} added and verified via DID signature`);
        setIsAdding(false);
        setStep(1);
        setAddMode("choice");
        setFormData({ relationship: "Spouse", idType: "Aadhaar" });
    };


    return (
        <Layout currentPage="Nominees">
            <PageHeader
                title="Nominee Management"
                breadcrumbs={[{ label: "Kavach" }, { label: "Nominees" }]}
                actions={
                    !isAdding && (
                        <LoKeyButton
                            variant="primary"
                            size="m"
                            leftIcon={<UserPlus className="w-4 h-4" />}
                            onClick={() => setIsAdding(true)}
                        >
                            Add Nominee
                        </LoKeyButton>
                    )
                }
            />

            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[var(--background)] pb-24 lg:pb-6">
                <div className="max-w-4xl mx-auto flex flex-col gap-6">

                    {isAdding ? (
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-elevation-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Adding Flow Header */}
                            <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]/30 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
                                        <UserPlus className="w-4 h-4" />
                                    </div>
                                    <span className="text-[13px] font-800 uppercase tracking-widest text-[var(--neutral-900)]">
                                        {addMode === "choice" ? "Select Method" : addMode === "import" ? "DigiLocker Import" : "Manual Entry"}
                                    </span>
                                </div>
                                <button onClick={() => { setIsAdding(false); setAddMode("choice"); setStep(1); }} className="p-2 hover:bg-[var(--muted)] rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 md:p-8">
                                {addMode === "choice" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setAddMode("import")}
                                            className="group p-6 border-2 border-[var(--border)] rounded-[var(--radius-xl)] hover:border-[var(--primary-500)] hover:bg-[var(--primary-500)]/5 transition-all text-left flex flex-col gap-4"
                                        >
                                            <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] group-hover:bg-[var(--primary-500)] group-hover:text-white transition-all">
                                                <Download className="w-6 h-6" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[18px] font-800 tracking-tight">Import from DigiLocker</span>
                                                <p className="text-[13px] text-[var(--muted-foreground)] leading-relaxed">
                                                    Fastest path. Automatically pull your existing nominee records from DigiLocker.
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 text-[11px] font-800 text-[var(--primary-500)] uppercase tracking-wider">
                                                Zero Manual Entry <ArrowRight className="w-3.5 h-3.5" />
                                            </div>
                                        </button>

                                        <button
                                            onClick={handleAddManual}
                                            className="group p-6 border-2 border-[var(--border)] rounded-[var(--radius-xl)] hover:border-[var(--primary-500)] hover:bg-[var(--primary-500)]/5 transition-all text-left flex flex-col gap-4"
                                        >
                                            <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] group-hover:bg-[var(--primary-500)] group-hover:text-white transition-all">
                                                <UserPlus className="w-6 h-6" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[18px] font-800 tracking-tight">Add New Nominee</span>
                                                <p className="text-[13px] text-[var(--muted-foreground)] leading-relaxed">
                                                    Full control. Add a new nominee directly in Kavach with a secure consent flow.
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 text-[11px] font-800 text-[var(--muted-foreground)] uppercase tracking-wider">
                                                Manual Control <ArrowRight className="w-3.5 h-3.5" />
                                            </div>
                                        </button>
                                    </div>
                                ) : addMode === "import" ? (
                                    <DigiLockerImportFlow
                                        step={step}
                                        setStep={setStep}
                                        loading={loading}
                                        onStartImport={handleImportFromDigiLocker}
                                        importedNominees={importedNominees}
                                        onAddToKavach={(selected: Nominee[]) => {
                                            const updated = [...nominees, ...selected];
                                            saveNominees(updated);
                                            addAuditLog("Nominees Imported", `${selected.length} nominee(s) imported from DigiLocker`);
                                            setIsAdding(false);
                                            setAddMode("choice");
                                            setStep(1);
                                        }}
                                    />
                                ) : (
                                    <ManualAddFlow
                                        step={step}
                                        setStep={setStep}
                                        formData={formData}
                                        setFormData={setFormData}
                                        onComplete={handleFinalSubmit}
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-white border border-[var(--border)] rounded-[var(--radius-xl)] shadow-elevation-sm flex flex-col gap-1">
                                    <span className="text-[11px] font-800 uppercase tracking-widest text-[var(--muted-foreground)]">Total Nominees</span>
                                    <span className="text-[24px] font-900 text-[var(--neutral-900)] tracking-tight">{nominees.length}</span>
                                </div>
                                <div className="p-4 bg-white border border-[var(--border)] rounded-[var(--radius-xl)] shadow-elevation-sm flex flex-col gap-1">
                                    <span className="text-[11px] font-800 uppercase tracking-widest text-[var(--muted-foreground)]">Verification Status</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <ShieldCheck className="w-5 h-5 text-[var(--color-success-700)]" />
                                        <span className="text-[14px] font-700 text-[var(--neutral-900)]">Records Signed</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-white border border-[var(--border)] rounded-[var(--radius-xl)] shadow-elevation-sm flex flex-col gap-1">
                                    <span className="text-[11px] font-800 uppercase tracking-widest text-[var(--muted-foreground)]">Portable Vault</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Layers className="w-5 h-5 text-[var(--primary-500)]" />
                                        <span className="text-[14px] font-700 text-[var(--neutral-900)]">Pre-fill Ready</span>
                                    </div>
                                </div>
                            </div>

                            {/* Nominee List */}
                            <div className="flex flex-col gap-4">
                                <h2 className="text-[14px] font-800 uppercase tracking-widest text-[var(--muted-foreground)] px-1">Registered Nominees</h2>

                                {nominees.length === 0 ? (
                                    <div className="p-12 border-2 border-dashed border-[var(--border)] rounded-[var(--radius-2xl)] flex flex-col items-center gap-4 text-center bg-[var(--card)]/50">
                                        <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]/30">
                                            <UserPlus className="w-8 h-8" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[15px] font-700 text-[var(--neutral-900)]">No nominees added yet</p>
                                            <p className="text-[13px] text-[var(--muted-foreground)]">Add your family members as nominees to pre-fill future banking and insurance applications.</p>
                                        </div>
                                        <LoKeyButton variant="tertiary" size="m" onClick={() => setIsAdding(true)}>
                                            Add Your First Nominee
                                        </LoKeyButton>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {nominees.map((nominee) => (
                                            <NomineeCard key={nominee.id} nominee={nominee} onDelete={() => handleDeleteClick(nominee.id)} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Info Banner */}
                            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--primary-500)]/5 border border-[var(--primary-500)]/20 flex gap-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                <div className="w-10 h-10 rounded-full bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] shrink-0">
                                    <Info className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[14px] font-800 text-[var(--primary-600)] tracking-tight">Universal Nomination Portability</span>
                                    <p className="text-[12px] text-[var(--muted-foreground)] leading-relaxed font-500">
                                        Nominees added in Kavach are cryptographically signed. When you open a new bank account or buy insurance, these details will be shared automatically via secure tokens, eliminating physical forms.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Deletion Verification Modal */}
            {isVerifyingDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !loading && setIsVerifyingDelete(false)} />
                    <div className="bg-white rounded-[var(--radius-2xl)] w-full max-w-md overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 flex flex-col items-center text-center gap-6">

                            {deleteVerifyMode === "choice" ? (
                                <>
                                    <div className="w-20 h-20 rounded-full bg-[var(--color-error-600)]/10 flex items-center justify-center text-[var(--color-error-600)] relative">
                                        <Trash2 className="w-10 h-10" />
                                        <div className="absolute inset-0 border-2 border-[var(--color-error-600)] rounded-full animate-ping opacity-20"></div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-[22px] font-900 text-[var(--neutral-900)] tracking-tight">Confirm Secure Deletion</h3>
                                        <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed text-center px-4">
                                            Permanent removal of **{nominees.find(n => n.id === deletingId)?.name}** requires identity verification.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-4 w-full">
                                        <button
                                            onClick={() => setDeleteVerifyMode("biometric")}
                                            className="w-full flex items-center gap-4 p-5 bg-[var(--muted)]/40 hover:bg-[var(--primary-500)]/5 border border-[var(--border)] rounded-[var(--radius-xl)] transition-all text-left"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
                                                <Fingerprint className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <span className="text-[15px] font-800 tracking-tight">Biometric Verification</span>
                                                <span className="text-[11px] text-[var(--muted-foreground)] font-600">Scan Fingerprint or Face ID</span>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
                                        </button>

                                        <button
                                            onClick={() => setDeleteVerifyMode("pin")}
                                            className="w-full flex items-center gap-4 p-5 bg-[var(--muted)]/40 hover:bg-[var(--primary-500)]/5 border border-[var(--border)] rounded-[var(--radius-xl)] transition-all text-left"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-[var(--neutral-900)]/10 flex items-center justify-center text-[var(--neutral-900)]">
                                                <Lock className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <span className="text-[15px] font-800 tracking-tight">Kavach PIN</span>
                                                <span className="text-[11px] text-[var(--muted-foreground)] font-600">Enter your 6-digit secure PIN</span>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setIsVerifyingDelete(false)}
                                        className="text-[13px] font-800 text-[var(--muted-foreground)] hover:text-[var(--neutral-900)] transition-colors h-10 mt-2"
                                    >
                                        Cancel Request
                                    </button>
                                </>
                            ) : deleteVerifyMode === "biometric" ? (
                                <div className="py-4 flex flex-col items-center gap-8 w-full animate-in fade-in slide-in-from-right-4">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full bg-[var(--primary-500)]/5 flex items-center justify-center text-[var(--primary-500)] relative overflow-hidden border-2 border-[var(--primary-500)]/20">
                                            <Fingerprint className="w-16 h-16" />
                                            {loading === "deleting" && (
                                                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary-500)] shadow-[0_0_15px_var(--primary-500)] animate-scan-y"></div>
                                            )}
                                        </div>
                                        <div className="absolute -inset-4 border border-[var(--primary-500)]/10 rounded-full animate-ping opacity-30"></div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-[20px] font-900 tracking-tight">Biometric Authentication</h3>
                                        <p className="text-[14px] text-[var(--muted-foreground)]">Scan your fingerprint to authorize deletion.</p>
                                    </div>

                                    <div className="w-full flex flex-col gap-3">
                                        <LoKeyButton
                                            variant="primary"
                                            size="xl"
                                            className="w-full h-14"
                                            onClick={() => {
                                                setLoading("deleting");
                                                setTimeout(() => {
                                                    setLoading(null);
                                                    confirmDelete();
                                                }, 2000);
                                            }}
                                            disabled={!!loading}
                                        >
                                            {loading ? "Authenticating..." : "Scan Now"}
                                        </LoKeyButton>
                                        <button
                                            onClick={() => setDeleteVerifyMode("choice")}
                                            className="text-[13px] font-800 text-[var(--muted-foreground)] h-10 hover:text-[var(--neutral-900)]"
                                            disabled={!!loading}
                                        >
                                            Use Another Method
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4 flex flex-col items-center gap-8 w-full animate-in fade-in slide-in-from-right-4">
                                    <div className="w-20 h-20 rounded-2xl bg-[var(--neutral-900)]/5 flex items-center justify-center text-[var(--neutral-900)]">
                                        <Lock className="w-10 h-10" />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-[20px] font-900 tracking-tight">Enter Secure PIN</h3>
                                        <p className="text-[14px] text-[var(--muted-foreground)]">Required to authorize deletion of record.</p>
                                    </div>

                                    <div className="grid grid-cols-6 gap-2 w-full">
                                        {deletePin.map((d, i) => (
                                            <input
                                                key={i}
                                                type="password"
                                                maxLength={1}
                                                className="w-full aspect-square text-center text-[24px] font-800 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] focus:border-[var(--primary-500)] outline-none"
                                                value={d}
                                                onChange={(e) => {
                                                    const newVal = e.target.value.replace(/\D/g, "");
                                                    const newPin = [...deletePin];
                                                    newPin[i] = newVal;
                                                    setDeletePin(newPin);

                                                    // Auto-focus next
                                                    if (newVal && i < 5) {
                                                        const next = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                                                        next?.focus();
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <div className="w-full flex flex-col gap-3">
                                        <LoKeyButton
                                            variant="primary"
                                            size="xl"
                                            className="w-full h-14"
                                            disabled={deletePin.some(d => !d) || !!loading}
                                            onClick={() => {
                                                setLoading("deleting");
                                                setTimeout(() => {
                                                    setLoading(null);
                                                    confirmDelete();
                                                }, 1500);
                                            }}
                                        >
                                            {loading ? "Verifying..." : "Authorize Deletion"}
                                        </LoKeyButton>
                                        <button
                                            onClick={() => setDeleteVerifyMode("choice")}
                                            className="text-[13px] font-800 text-[var(--muted-foreground)] h-10 hover:text-[var(--neutral-900)]"
                                            disabled={!!loading}
                                        >
                                            Use Another Method
                                        </button>
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

function NomineeCard({ nominee, onDelete }: { nominee: Nominee, onDelete: () => void }) {
    return (
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] shadow-elevation-sm overflow-hidden hover:shadow-elevation-md transition-all group relative">
            <div className="h-1 w-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)]"></div>
            <div className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--primary-500)] shrink-0 font-900 border border-[var(--border)]">
                            {nominee.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[15px] font-800 text-[var(--neutral-900)] leading-tight">{nominee.name}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] font-700 text-[var(--muted-foreground)] uppercase tracking-wider">{nominee.relationship}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onDelete}
                        className="p-2 text-[var(--muted-foreground)] hover:text-[var(--color-error-600)] hover:bg-[var(--color-error-600)]/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-4 border-t border-[var(--border)]">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-800 uppercase tracking-widest text-[var(--muted-foreground)]">ID Proof ({nominee.idType})</span>
                        <span className="text-[12px] font-700 text-[var(--neutral-900)]">{nominee.idNumber}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-800 uppercase tracking-widest text-[var(--muted-foreground)]">Mobile</span>
                        <span className="text-[12px] font-700 text-[var(--neutral-900)]">{nominee.mobile}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1.5">
                        {nominee.status === "verified" ? (
                            <div className="flex items-center gap-1 text-[10px] font-800 text-[var(--color-success-700)] uppercase">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified claiming
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-[10px] font-800 text-[var(--color-warning-600)] uppercase">
                                <Clock className="w-3.5 h-3.5" /> Awaiting Consent
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-700 text-[var(--muted-foreground)] italic">
                        {nominee.source === "digilocker" ? "Source: DigiLocker" : "Source: Manual Entry"}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DigiLockerImportFlow({ step, setStep, loading, onStartImport, importedNominees, onAddToKavach }: any) {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    if (step === 1) {
        return (
            <div className="flex flex-col items-center gap-8 py-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center p-4 border border-[var(--border)]">
                        <img src="/logo.png" alt="Kavach" className="w-full h-auto" />
                    </div>
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-[var(--border)] animate-pulse"></div>
                        <div className="w-1 h-1 rounded-full bg-[var(--border)] animate-pulse delay-75"></div>
                        <div className="w-1 h-1 rounded-full bg-[var(--border)] animate-pulse delay-150"></div>
                    </div>
                    <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-16 h-16 rounded-3xl bg-[var(--primary-500)] shadow-lg shadow-[var(--primary-500)]/20 flex items-center justify-center">
                        <Layers className="w-8 h-8 text-white" />
                    </div>
                </div>

                <div className="flex flex-col gap-2 text-center max-w-sm">
                    <h3 className="text-[20px] font-800 tracking-tight">Sync Nominee Records</h3>
                    <p className="text-[14px] text-[var(--muted-foreground)]">
                        Authorize Kavach to securely fetch your existing nominee data stored in your DigiLocker central registry.
                    </p>
                </div>

                <div className="p-4 bg-[var(--muted)]/50 rounded-[var(--radius-lg)] border border-[var(--border)] w-full flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-[var(--color-success-700)]" />
                        <span className="text-[13px] font-600">Secure Direct Registry Auth</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-[var(--color-success-700)]" />
                        <span className="text-[13px] font-600">Automated Data Verification</span>
                    </div>
                </div>

                <LoKeyButton
                    variant="primary"
                    size="xl"
                    className="w-full"
                    onClick={onStartImport}
                    disabled={!!loading}
                    leftIcon={loading ? null : <ShieldCheck className="w-5 h-5" />}
                >
                    {loading ? "Querring DigiLocker..." : "Authorize Fetch"}
                </LoKeyButton>
            </div>
        );
    }

    if (step === 2) {
        return (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <StatusChip status="completed" />
                        <span className="text-[12px] font-800 text-[var(--muted-foreground)] uppercase">2 Records Located</span>
                    </div>
                    <h3 className="text-[20px] font-800 tracking-tight">Review Imported Data</h3>
                    <p className="text-[14px] text-[var(--muted-foreground)]">We found the following nominee(s) in your registry. Select to add them to your Kavach vault.</p>
                </div>

                <div className="flex flex-col gap-3">
                    {importedNominees.map((n: Nominee, i: number) => (
                        <label
                            key={i}
                            className={cn(
                                "flex items-center gap-4 p-4 border rounded-[var(--radius-xl)] cursor-pointer transition-all",
                                selectedIndices.includes(i) ? "border-[var(--primary-500)] bg-[var(--primary-500)]/5" : "border-[var(--border)] hover:border-[var(--muted-foreground)]/30"
                            )}
                        >
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded accent-[var(--primary-500)]"
                                checked={selectedIndices.includes(i)}
                                onChange={() => {
                                    if (selectedIndices.includes(i)) {
                                        setSelectedIndices(selectedIndices.filter(idx => idx !== i));
                                    } else {
                                        setSelectedIndices([...selectedIndices, i]);
                                    }
                                }}
                            />
                            <div className="flex-1 flex flex-col">
                                <span className="text-[15px] font-800">{n.name}</span>
                                <div className="flex items-center gap-2 text-[11px] font-700 text-[var(--muted-foreground)]">
                                    <span>{n.relationship}</span>
                                    <span className="w-1 h-1 rounded-full bg-[var(--border)]"></span>
                                    <span>{n.idType}: {n.idNumber}</span>
                                </div>
                            </div>
                        </label>
                    ))}
                </div>

                <LoKeyButton
                    variant="primary"
                    size="xl"
                    className="w-full mt-4"
                    disabled={selectedIndices.length === 0}
                    onClick={() => onAddToKavach(importedNominees.filter((_: any, i: number) => selectedIndices.includes(i)))}
                >
                    Add {selectedIndices.length} Nominee(s) to Kavach
                </LoKeyButton>
            </div>
        );
    }

    return null;
}

function ManualAddFlow({ step, setStep, formData, setFormData, onComplete }: any) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [signing, setSigning] = useState(false);

    const updateForm = (key: string, value: any) => {
        setFormData({ ...formData, [key]: value });
    };

    if (step === 1) {
        return (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col gap-2">
                    <h3 className="text-[20px] font-800 tracking-tight">Nominee Basic Details</h3>
                    <p className="text-[14px] text-[var(--muted-foreground)]">Enter the legally verified details of your nominee.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-800 uppercase text-[var(--muted-foreground)] px-1">Full Name (Legal)</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                            <input
                                type="text"
                                placeholder="As per Aadhaar/PAN"
                                className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-lg)] text-[14px] focus:border-[var(--primary-500)] outline-none"
                                value={formData.name || ""}
                                onChange={(e) => updateForm("name", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-800 uppercase text-[var(--muted-foreground)] px-1">Relationship</label>
                        <div className="relative">
                            <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                            <select
                                className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-lg)] text-[14px] focus:border-[var(--primary-500)] outline-none appearance-none"
                                value={formData.relationship}
                                onChange={(e) => updateForm("relationship", e.target.value)}
                            >
                                <option>Spouse</option>
                                <option>Son</option>
                                <option>Daughter</option>
                                <option>Father</option>
                                <option>Mother</option>
                                <option>Brother</option>
                                <option>Sister</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-800 uppercase text-[var(--muted-foreground)] px-1">Date of Birth</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                            <input
                                type="date"
                                className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-lg)] text-[14px] focus:border-[var(--primary-500)] outline-none"
                                value={formData.dob || ""}
                                onChange={(e) => updateForm("dob", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-800 uppercase text-[var(--muted-foreground)] px-1">Mobile Number</label>
                        <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                            <input
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="10-digit Mobile Number"
                                className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-lg)] text-[14px] focus:border-[var(--primary-500)] outline-none"
                                value={formData.mobile || ""}
                                onChange={(e) => updateForm("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                    <LoKeyButton
                        variant="primary"
                        size="xl"
                        className="w-full"
                        rightIcon={<ChevronRight className="w-5 h-5" />}
                        disabled={!formData.name || !formData.mobile}
                        onClick={() => setStep(2)}
                    >
                        Verification Details
                    </LoKeyButton>
                </div>
            </div>
        );
    }

    if (step === 2) {
        return (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col gap-2">
                    <button onClick={() => setStep(1)} className="flex items-center gap-1 text-[11px] font-800 text-[var(--muted-foreground)] uppercase tracking-wider hover:text-[var(--primary-500)] transition-colors mb-2">
                        <ChevronLeft className="w-3.5 h-3.5" /> Back to Profile
                    </button>
                    <h3 className="text-[20px] font-800 tracking-tight">Identity & Allocation</h3>
                    <p className="text-[14px] text-[var(--muted-foreground)]">Required for institutional portability and secure account claiming.</p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-800 uppercase text-[var(--muted-foreground)] px-1">ID Document Provided</label>
                        <div className="flex gap-2">
                            {["Aadhaar", "PAN"].map(type => (
                                <button
                                    key={type}
                                    onClick={() => updateForm("idType", type)}
                                    className={cn(
                                        "flex-1 py-3 px-4 border rounded-[var(--radius-lg)] text-[13px] font-800 transition-all",
                                        formData.idType === type ? "bg-[var(--primary-500)] border-[var(--primary-500)] text-white" : "bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--muted-foreground)]/40"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-800 uppercase text-[var(--muted-foreground)] px-1">{formData.idType} Number</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                            <input
                                type="text"
                                inputMode={formData.idType === "Aadhaar" ? "numeric" : "text"}
                                placeholder={formData.idType === "Aadhaar" ? "12 Digit Aadhaar" : "ABCDE1234F"}
                                className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-lg)] text-[14px] focus:border-[var(--primary-500)] outline-none"
                                value={formData.idNumber || ""}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (formData.idType === "Aadhaar") {
                                        updateForm("idNumber", val.replace(/\D/g, "").slice(0, 12));
                                    } else {
                                        updateForm("idNumber", val.toUpperCase());
                                    }
                                }}
                            />
                        </div>
                    </div>

                </div>

                <div className="bg-[var(--color-info-600)]/5 p-4 rounded-[var(--radius-lg)] border border-[var(--color-info-600)]/10 flex gap-3">
                    <Info className="w-5 h-5 text-[var(--color-info-600)] shrink-0 mt-0.5" />
                    <p className="text-[12px] text-[var(--color-info-600)] font-600 leading-snug">
                        Providing the nominee's Aadhaar or PAN ensures 100% success rate in future claim settlements without additional proof.
                    </p>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                    <LoKeyButton
                        variant="primary"
                        size="xl"
                        className="w-full"
                        rightIcon={<ShieldCheck className="w-5 h-5" />}
                        disabled={!formData.idNumber}
                        onClick={() => setStep(3)}
                    >
                        Initiate Nominee Consent
                    </LoKeyButton>
                </div>
            </div>
        );
    }

    if (step === 3) {
        return (
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500 py-4 items-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--primary-500)]/10 border border-[var(--primary-500)]/20 flex items-center justify-center text-[var(--primary-500)] relative">
                        <Smartphone className="w-8 h-8" />
                        <div className="absolute inset-0 border-2 border-[var(--primary-500)] rounded-full animate-ping opacity-20"></div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <h3 className="text-[22px] font-800 tracking-tight">Nominee Verification</h3>
                        <p className="text-[14px] text-[var(--muted-foreground)] max-w-xs">
                            Kavach has sent a secure link to your nominee's mobile **{formData.mobile?.slice(-4)}**. Please ask them to enter the OTP they received to confirm the nomination.
                        </p>
                    </div>
                </div>

                <div className="w-full flex flex-col gap-4">
                    <div className="grid grid-cols-6 gap-2">
                        {otp.map((d, i) => (
                            <input
                                key={i}
                                type="text"
                                maxLength={1}
                                className="w-full aspect-square text-center text-[18px] font-800 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] focus:border-[var(--primary-500)] outline-none"
                                value={d}
                                onChange={(e) => {
                                    const newOtp = [...otp];
                                    newOtp[i] = e.target.value.replace(/\D/g, "");
                                    setOtp(newOtp);
                                }}
                            />
                        ))}
                    </div>
                    <div className="flex items-center justify-between px-1">
                        <button className="text-[12px] font-800 text-[var(--primary-500)]">Resend Link</button>
                        <span className="text-[11px] text-[var(--muted-foreground)] font-600 italic">Expected to take ~30s</span>
                    </div>
                </div>

                <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-success-700)]/5 border border-[var(--color-success-700)]/20 flex gap-3 text-left">
                    <ShieldCheck className="w-5 h-5 text-[var(--color-success-700)] shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                        <span className="text-[13px] font-800 text-[var(--color-success-700)]">Auditable Trail</span>
                        <p className="text-[11px] text-[var(--muted-foreground)] leading-tight">
                            By confirming, the nominee creates a cryptographically signed acknowledgment stored within your identity record.
                        </p>
                    </div>
                </div>

                <LoKeyButton
                    variant="primary"
                    size="xl"
                    className="w-full mt-2"
                    disabled={otp.some(d => !d)}
                    onClick={() => setStep(4)}
                >
                    Verify & Continue
                </LoKeyButton>
            </div>
        );
    }

    if (step === 4) {
        return (
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-500 py-4 items-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-20 h-20 rounded-full bg-[var(--primary-500)] flex items-center justify-center text-white relative shadow-xl shadow-[var(--primary-500)]/20">
                        {signing ? (
                            <Fingerprint className="w-10 h-10 animate-pulse" />
                        ) : (
                            <Lock className="w-10 h-10" />
                        )}
                        {signing && <div className="absolute inset-[-8px] border-2 border-[var(--primary-500)] rounded-full animate-ping"></div>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <h3 className="text-[24px] font-900 tracking-tighter">Sign with Identity</h3>
                        <p className="text-[14px] text-[var(--muted-foreground)] max-w-xs px-2 leading-relaxed">
                            To finalize the nomination, authorize the creation of a new **Verifiable Claim** in your vault.
                        </p>
                    </div>
                </div>

                <div className="w-full bg-[var(--muted)]/50 rounded-[var(--radius-xl)] border border-[var(--border)] p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center text-[12px] font-800 uppercase text-[var(--muted-foreground)] tracking-widest px-1">
                        <span>Signing Payload</span>
                        <span>SHA-256</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] text-[var(--muted-foreground)]">Entity Name</span>
                            <span className="text-[13px] font-700 text-[var(--neutral-900)]">{formData.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] text-[var(--muted-foreground)]">Relationship</span>
                            <span className="text-[13px] font-700 text-[var(--neutral-900)]">{formData.relationship}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] text-[var(--muted-foreground)] disabled">ID Type</span>
                            <span className="text-[13px] font-700 text-[var(--neutral-900)]">{formData.idType}</span>
                        </div>
                        <div className="mt-2 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-mono text-[var(--muted-foreground)] break-all">
                            0x4a2b9c7d8e1f0a2b3c4d5e6f7a8b9c...
                        </div>
                    </div>
                </div>

                <LoKeyButton
                    variant="primary"
                    size="xxl"
                    className="w-full mt-4 h-16 text-[18px]"
                    leftIcon={<Fingerprint className="w-6 h-6" />}
                    onClick={() => {
                        setSigning(true);
                        setTimeout(() => {
                            setSigning(false);
                            onComplete();
                        }, 2000);
                    }}
                    disabled={signing}
                >
                    {signing ? "Signing Claim..." : "Confirm & Sign"}
                </LoKeyButton>
                <p className="text-[11px] text-[var(--muted-foreground)] font-600 text-center uppercase tracking-widest">
                    Authorized via Secure Enclave Biometrics
                </p>
            </div>
        );
    }

    return null;
}
