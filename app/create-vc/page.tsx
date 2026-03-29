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
    UserRoundCheck,
    MapPin,
    Calendar,
    Clock,
    Video,
    Hash,
    Search,
    GraduationCap,
    Briefcase,
    Plus,
    Globe,
    Zap
} from "lucide-react";
import { addAuditLog } from "../components/AuditLogger";

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

            <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" disabled={!accepted} onClick={() => {
                addAuditLog("Privacy Consent", "User agreed to identity data collection and privacy promise");
                onNext();
            }}>
                Agree & Continue
            </LoKeyButton>
        </div>
    );
};

// --- CKYCR Verification (replaces old multi-doc OTP flow) ---
// Aadhaar & PAN are fetched via DigiLocker — only CKYCR needs mock-lookup here.
const CKYCRVerification = ({ onNext, selectedDocs = ["aadhaar", "pan", "ckycr"] }: any) => {
    const [phase, setPhase] = useState<"idle" | "searching" | "found" | "done">("idle");
    const [ckycData, setCkycData] = useState<any>(null);

    // If CKYCR not selected, auto-skip
    useEffect(() => {
        if (!selectedDocs.includes("ckycr")) {
            addAuditLog("CKYCR", "CKYCR not selected — skipping verification step");
            onNext();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const runCkycSearch = async () => {
        setPhase("searching");

        const adharRaw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("kavach_idfy_adhar_data") : null;
        const adharData = adharRaw ? JSON.parse(adharRaw) : null;
        const panRaw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("kavach_idfy_pan_data") : null;
        const panData = panRaw ? JSON.parse(panRaw) : null;
        const panNo = panData?.parsed_details?.pan_no || "ABCPA1234F"; // seeded demo PAN

        try {
            const res = await fetch("http://localhost:8001/api/demo/verify-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fi_code: "IN0106", id_type: "C", id_no: panNo })
            });
            const data = await res.json();

            const extract = (xml: string, tag: string) => {
                const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i"));
                return m ? m[1].trim() : null;
            };

            const pid = data.decrypted_pid_xml || "";
            const record = {
                name: extract(pid, "name") || adharData?.parsed_details?.name || "—",
                pan: panNo,
                dob: extract(pid, "dob") || adharData?.parsed_details?.dob || "—",
                ckyc_no: extract(pid, "ckyc_no") || `CKYC${Date.now().toString().slice(-8)}`,
                kyc_date: extract(pid, "kyc_date") || new Date().toISOString().split("T")[0],
                request_id: data.request_id_used,
                note: data.http_status !== 200 ? `Demo record (CKYCR returned ${data.http_status})` : null
            };
            setCkycData(record);
            sessionStorage.setItem("kavach_ckycr_data", JSON.stringify(record));
            addAuditLog("CKYCR Verified", `Record found for PAN ${panNo} — CKYC# ${record.ckyc_no}`);
        } catch {
            // CKYCR mock server offline — use demo data so flow is never blocked
            const fallback = {
                name: adharData?.parsed_details?.name || "—",
                pan: panNo,
                dob: adharData?.parsed_details?.dob || "—",
                ckyc_no: `CKYC${Date.now().toString().slice(-8)}`,
                kyc_date: new Date().toISOString().split("T")[0],
                note: "Demo record (CKYCR server offline — start on port 8001)"
            };
            setCkycData(fallback);
            sessionStorage.setItem("kavach_ckycr_data", JSON.stringify(fallback));
            addAuditLog("CKYCR Demo", "CKYCR mock offline — using demo record to continue");
        }

        setPhase("found");
    };

    return (
        <div className="flex flex-col h-full gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[var(--primary-500)] font-800 text-[12px] uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    CKYCR Record (Central Registry)
                </div>
                <h2 className="text-[20px] font-800 tracking-tight">
                    {phase === "searching" ? "Querying Central Registry..." : phase === "found" ? "Record Found" : "Central KYC Lookup"}
                </h2>
                <p className="text-[13px] text-[var(--muted-foreground)] leading-snug">
                    {phase === "idle" && "Kavach will query CKYCR to retrieve your existing KYC record linked to your PAN."}
                    {phase === "searching" && "Searching Central KYC Registry for your PAN-linked record..."}
                    {phase === "found" && "Your CKYCR record has been securely retrieved and verified."}
                </p>
            </div>

            {phase === "idle" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
                    <div className="w-20 h-20 rounded-full bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div className="text-center flex flex-col gap-1">
                        <p className="text-[14px] font-700">PAN-linked CKYCR Search</p>
                        <p className="text-[12px] text-[var(--muted-foreground)]">Securely queries RBI's Central KYC Registry using your PAN number.</p>
                    </div>
                    <LoKeyButton variant="primary" size="xl" className="w-full" onClick={runCkycSearch} rightIcon={<ArrowRight className="w-4 h-4" />}>
                        Query CKYCR Now
                    </LoKeyButton>
                </div>
            )}

            {phase === "searching" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-[var(--primary-500)]/20 border-t-[var(--primary-500)] animate-spin" />
                    <p className="text-[12px] font-700 text-[var(--primary-500)] animate-pulse uppercase tracking-widest">Active Search...</p>
                </div>
            )}

            {phase === "found" && ckycData && (
                <div className="flex flex-col gap-4 flex-1">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-[var(--radius-lg)] flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="text-[13px] font-800 text-green-800">CKYCR Record Verified ✓</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[12px]">
                            {ckycData.name && <div><span className="text-gray-500">Name: </span><span className="font-700">{ckycData.name}</span></div>}
                            {ckycData.pan && <div><span className="text-gray-500">PAN: </span><span className="font-700">{ckycData.pan}</span></div>}
                            {ckycData.dob && <div><span className="text-gray-500">DOB: </span><span className="font-700">{ckycData.dob}</span></div>}
                            {ckycData.ckyc_no && <div><span className="text-gray-500">CKYC#: </span><span className="font-700">{ckycData.ckyc_no}</span></div>}
                            {ckycData.kyc_date && <div><span className="text-gray-500">KYC Date: </span><span className="font-700">{ckycData.kyc_date}</span></div>}
                            {ckycData.note && <div className="col-span-2 mt-1"><span className="text-orange-600 text-[11px]">{ckycData.note}</span></div>}
                        </div>
                    </div>
                    <LoKeyButton variant="primary" size="xl" className="w-full mt-auto" onClick={() => { setPhase("done"); onNext(); }} rightIcon={<ArrowRight className="w-4 h-4" />}>
                        Confirm & Continue
                    </LoKeyButton>
                </div>
            )}
        </div>
    );
};



const FaceCapture = ({ onNext }: any) => {
    const [status, setStatus] = useState("idle"); // idle, scanning, success

    const startScan = () => {
        setStatus("scanning");
        addAuditLog("Face Capture Started", "Initiated live biometric liveness check");
        setTimeout(() => {
            setStatus("success");
            addAuditLog("Face Match Success", "Live face confirmed against device hardware");
        }, 3000);
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

const FieldSelection = ({ onComplete, backendAlive }: any) => {
    const [expanded, setExpanded] = useState<string | null>("aadhaar");
    const [selectedDocs, setSelectedDocs] = useState<string[]>(["aadhaar", "pan", "ckycr"]);
    const [refreshTick, setRefreshTick] = useState(0); // bump to re-read sessionStorage
    const [showOptionalPicker, setShowOptionalPicker] = useState(false);

    // Pan Prompt State
    const [showPanPrompt, setShowPanPrompt] = useState(false);
    const [panDetails, setPanDetails] = useState({ panno: "", fullName: "" });

    const allDocs = [
        {
            id: "aadhaar",
            title: "Aadhaar Card",
            icon: FileText,
            mandatory: true,
            source: "DigiLocker",
            reason: "Standard identity proof, securely fetched from your DigiLocker account.",
            fields: [
                { label: "Aadhaar Number", required: true, mvf: true, desc: "Primary identity record" },
                { label: "Full Name", required: true, mvf: true, desc: "Legal proof of name" },
                { label: "Date of Birth", required: true, mvf: true },
                { label: "Gender", required: false },
                { label: "Address", required: false, desc: "Proof of residence" },
                { label: "Photo", required: false, desc: "Biometric matching" },
                { label: "Phone Hash", required: false },
            ]
        },
        {
            id: "pan",
            title: "PAN Card",
            icon: Hash,
            mandatory: true,
            source: "DigiLocker",
            reason: "Financial identity proof, securely fetched from your DigiLocker account.",
            fields: [
                { label: "PAN Number", required: true, mvf: true, desc: "Tax identifier" },
                { label: "Name on Card", required: true, mvf: true },
                { label: "Date of Birth", required: false },
                { label: "Father's Name", required: false },
            ]
        },
        {
            id: "passport",
            title: "Passport",
            icon: Globe,
            mandatory: false,
            source: "DigiLocker",
            reason: "International identity proof, securely fetched from your DigiLocker account.",
            fields: [
                { label: "Passport Number", required: true, mvf: true },
                { label: "Expiry Date", required: true, mvf: true },
                { label: "Full Name", required: true, mvf: true },
                { label: "Date of Birth", required: false },
                { label: "Citizenship", required: false },
            ]
        },
        {
            id: "voter",
            title: "Voter ID",
            icon: UserRoundCheck,
            mandatory: false,
            source: "DigiLocker",
            reason: "Electoral identity proof, securely fetched from your DigiLocker account.",
            fields: [
                { label: "EPIC Number", required: true, mvf: true },
                { label: "Full Name", required: true, mvf: true },
                { label: "AC Name", required: false },
                { label: "Part Number", required: false },
            ]
        },
        {
            id: "ckycr",
            title: "CKYCR Record",
            icon: ShieldCheck,
            mandatory: true,
            source: "Central Registry",
            reason: "Directly queried from Central KYC Registry for institutional cross-verification.",
            fields: [
                { label: "CKYC Identifier", required: true, mvf: true },
                { label: "Record Type", required: true, mvf: true },
                { label: "Last Updated", required: false },
            ]
        }
    ];

    const mandatoryDocs = allDocs.filter(d => d.mandatory);
    const selectedOptionalDocs = allDocs.filter(d => !d.mandatory && selectedDocs.includes(d.id));
    const availableOptionalDocs = allDocs.filter(d => !d.mandatory && !selectedDocs.includes(d.id));

    const toggleDoc = (id: string, mandatory: boolean) => {
        if (mandatory) return;
        if (selectedDocs.includes(id)) {
            setSelectedDocs(selectedDocs.filter(d => d !== id));
            if (expanded === id) setExpanded(null);
        } else {
            setSelectedDocs([...selectedDocs, id]);
            setExpanded(id);
            setShowOptionalPicker(false);
        }
    };

    // Track IDfy fetch status from sessionStorage (refreshTick forces re-read)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const adharFetched = typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem("kavach_idfy_adhar_data");
    const panFetched = typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem("kavach_idfy_pan_data");
    void refreshTick; // consumed to trigger re-render

    const handleAgreeAndFetch = () => {
        // If PAN needs details and they are missing, prompt first
        if (selectedDocs.includes("pan") && !panFetched && (!panDetails.panno || !panDetails.fullName)) {
            setShowPanPrompt(true);
        } else {
            onComplete(selectedDocs, panDetails);
        }
    };

    // Determine what the next IDfy action is
    const needsAadhaarFetch = selectedDocs.includes("aadhaar") && !adharFetched;
    const needsPanFetch = selectedDocs.includes("pan") && !panFetched;
    const allIdfyDone = !needsAadhaarFetch && !needsPanFetch;

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-[22px] font-800 leading-tight tracking-tight">Select Fields</h2>
                <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">
                    Review and authorize the specific data points to be fetched into your VC.
                </p>
            </div>

            {/* Backend Offline Warning */}
            {backendAlive === false && (
                <div className="p-3 rounded-[var(--radius-lg)] bg-orange-50 border border-orange-200 flex items-center gap-3 animate-in fade-in">
                    <span className="text-orange-600 text-[16px]">⚠</span>
                    <p className="text-[12px] text-orange-800 font-600 leading-snug">
                        <strong>Python API Offline.</strong> DigiLocker fetch via IDfy will be skipped. Start with: <code>uvicorn main:app --reload</code>
                    </p>
                </div>
            )}

            {/* DigiLocker Awareness Banner */}
            <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--primary-500)]/10 border border-[var(--primary-500)]/20 flex gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-500)] flex items-center justify-center text-white shrink-0 shadow-md">
                    <Zap className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-800 text-[var(--primary-600)] tracking-tight">Records Found in DigiLocker</span>
                    <p className="text-[12px] text-[var(--muted-foreground)] leading-relaxed font-500">
                        Based on your profile, we've located **Aadhaar, PAN, and Passport** in your linked DigiLocker. Would you like to include these in your VC for maximum utility?
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar -mr-2">
                <div className="flex flex-col gap-5 pb-6">
                    {/* Mandatory Section */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[12px] font-900 uppercase tracking-widest text-[var(--muted-foreground)]">Mandatory Proofs</h3>
                            <span className="text-[10px] bg-[var(--primary-500)]/10 text-[var(--primary-500)] px-2 py-0.5 rounded-full font-800 uppercase tracking-tighter">Required</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            {mandatoryDocs.map((doc) => (
                                <DocCard
                                    key={doc.id}
                                    doc={doc}
                                    expanded={expanded === doc.id}
                                    isSelected={true}
                                    onToggleExpand={() => setExpanded(expanded === doc.id ? null : doc.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Optional Section */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[12px] font-900 uppercase tracking-widest text-[var(--muted-foreground)]">Additional Proofs</h3>
                            <span className="text-[10px] bg-[var(--muted)] text-[var(--muted-foreground)] px-2 py-0.5 rounded-full font-800 uppercase tracking-tighter">Optional</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            {selectedOptionalDocs.map((doc) => (
                                <DocCard
                                    key={doc.id}
                                    doc={doc}
                                    expanded={expanded === doc.id}
                                    isSelected={true}
                                    onToggleExpand={() => setExpanded(expanded === doc.id ? null : doc.id)}
                                    onRemove={() => toggleDoc(doc.id, false)}
                                />
                            ))}

                            {availableOptionalDocs.length > 0 && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowOptionalPicker(!showOptionalPicker)}
                                        className="w-full p-4 border-2 border-dashed border-[var(--border)] rounded-[var(--radius-xl)] flex items-center justify-center gap-2 text-[var(--muted-foreground)] hover:border-[var(--primary-500)] hover:text-[var(--primary-500)] hover:bg-[var(--primary-500)]/5 transition-all group"
                                    >
                                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                        <span className="text-[14px] font-700">Add Another ID for Higher Assurance</span>
                                    </button>

                                    {showOptionalPicker && (
                                        <div className="absolute bottom-full left-0 w-full mb-2 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-xl z-50 overflow-hidden animate-in slide-in-from-bottom-2">
                                            <div className="p-3 border-b border-[var(--border)] bg-[var(--muted)]/30">
                                                <span className="text-[11px] font-800 uppercase tracking-widest text-[var(--muted-foreground)]">Select Identity Document</span>
                                            </div>
                                            <div className="flex flex-col">
                                                {availableOptionalDocs.map((doc) => (
                                                    <button
                                                        key={doc.id}
                                                        onClick={() => toggleDoc(doc.id, false)}
                                                        className="flex items-center gap-4 p-4 hover:bg-[var(--primary-500)]/5 transition-colors text-left group"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--primary-500)] group-hover:bg-[var(--primary-500)] group-hover:text-white transition-colors">
                                                            <doc.icon className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[14px] font-800">{doc.title}</span>
                                                            <span className="text-[11px] text-[var(--muted-foreground)]">Raise assurance level</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-3">

                {/* Sequential DigiLocker fetch status + buttons */}
                {(selectedDocs.includes("aadhaar") || selectedDocs.includes("pan")) && (
                    <div className="flex flex-col gap-2">
                        <p className="text-[11px] font-800 uppercase tracking-widest text-[var(--muted-foreground)]">DigiLocker Fetch Progress</p>
                        <div className="flex flex-col gap-2">
                            {selectedDocs.includes("aadhaar") && (
                                <div className={`flex items-center gap-3 p-3 rounded-[var(--radius-lg)] border ${adharFetched ? "bg-green-50 border-green-200" : "bg-[var(--muted)]/40 border-[var(--border)]"
                                    }`}>
                                    {adharFetched
                                        ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                        : <div className="w-4 h-4 rounded-full border-2 border-[var(--border)] shrink-0" />}
                                    <span className={`text-[13px] font-700 flex-1 ${adharFetched ? "text-green-800" : "text-[var(--muted-foreground)]"
                                        }`}>
                                        {adharFetched ? "Aadhaar — Fetched from DigiLocker ✓" : "Aadhaar — Pending fetch"}
                                    </span>
                                    {adharFetched && (
                                        <button
                                            onClick={() => { sessionStorage.removeItem("kavach_idfy_adhar_data"); setRefreshTick(t => t + 1); }}
                                            className="text-[11px] text-green-700 underline underline-offset-2 hover:text-red-600 transition-colors shrink-0"
                                            title="Clear and re-fetch Aadhaar"
                                        >Re-fetch</button>
                                    )}
                                </div>
                            )}
                            {selectedDocs.includes("pan") && (
                                <div className={`flex items-center gap-3 p-3 rounded-[var(--radius-lg)] border ${panFetched ? "bg-green-50 border-green-200" : "bg-[var(--muted)]/40 border-[var(--border)]"
                                    }`}>
                                    {panFetched
                                        ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                        : <div className="w-4 h-4 rounded-full border-2 border-[var(--border)] shrink-0" />}
                                    <span className={`text-[13px] font-700 flex-1 ${panFetched ? "text-green-800" : "text-[var(--muted-foreground)]"
                                        }`}>
                                        {panFetched ? "PAN — Fetched from DigiLocker ✓" : adharFetched ? "PAN — Ready to fetch" : "PAN — Fetch after Aadhaar"}
                                    </span>
                                    {panFetched && (
                                        <button
                                            onClick={() => { sessionStorage.removeItem("kavach_idfy_pan_data"); setRefreshTick(t => t + 1); }}
                                            className="text-[11px] text-green-700 underline underline-offset-2 hover:text-red-600 transition-colors shrink-0"
                                            title="Clear and re-fetch PAN"
                                        >Re-fetch</button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action button — changes based on what's needed next */}
                {needsAadhaarFetch ? (
                    <LoKeyButton
                        id="agree-fetch-btn"
                        variant="primary"
                        className="w-full shadow-elevation-md"
                        size="xxl"
                        onClick={() => onComplete(selectedDocs, panDetails)}
                        rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                        Fetch Aadhaar from DigiLocker
                    </LoKeyButton>
                ) : needsPanFetch ? (
                    <LoKeyButton
                        id="agree-fetch-btn"
                        variant="primary"
                        className="w-full shadow-elevation-md"
                        size="xxl"
                        onClick={() => {
                            if (!panDetails.panno || !panDetails.fullName) {
                                setShowPanPrompt(true);
                            } else {
                                onComplete(selectedDocs, panDetails);
                            }
                        }}
                        rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                        Fetch PAN from DigiLocker
                    </LoKeyButton>
                ) : (
                    <LoKeyButton
                        id="agree-fetch-btn"
                        variant="primary"
                        className="w-full shadow-elevation-md"
                        size="xxl"
                        onClick={handleAgreeAndFetch}
                        rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                        {(selectedDocs.includes("aadhaar") || selectedDocs.includes("pan")) ? "Continue to Verification" : "Agree & Fetch Identity"}
                    </LoKeyButton>
                )}

                <p className="text-[12px] text-center text-[var(--muted-foreground)] px-4 leading-snug">
                    By continuing, you authorize fetching of cryptographically signed records from the respective registries.
                </p>
            </div>

            {showPanPrompt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-[var(--card)] w-full max-w-md rounded-[var(--radius-xl)] shadow-2xl p-6 flex flex-col gap-5 animate-in slide-in-from-bottom-4">
                        <div className="flex flex-col gap-2">
                            <div className="w-12 h-12 rounded-full bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] mb-2">
                                <Hash className="w-6 h-6" />
                            </div>
                            <h3 className="text-[20px] font-800 tracking-tight">Enter PAN Details</h3>
                            <p className="text-[13px] text-[var(--muted-foreground)] leading-relaxed">
                                DigiLocker requires your exact PAN Number and Name to securely fetch the signed tax record.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-700 text-[var(--neutral-900)]">PAN Number</label>
                                <input
                                    type="text"
                                    value={panDetails.panno}
                                    onChange={e => setPanDetails({ ...panDetails, panno: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border)] focus:border-[var(--primary-500)] outline-none uppercase font-mono text-[14px] bg-[var(--background)]"
                                    placeholder="ABCDE1234F"
                                    maxLength={10}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-700 text-[var(--neutral-900)]">Name (as per PAN)</label>
                                <input
                                    type="text"
                                    value={panDetails.fullName}
                                    onChange={e => setPanDetails({ ...panDetails, fullName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border)] focus:border-[var(--primary-500)] outline-none text-[14px] bg-[var(--background)]"
                                    placeholder="JOHN DOE"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-2">
                            <LoKeyButton variant="secondary" className="flex-1" onClick={() => setShowPanPrompt(false)}>
                                Back
                            </LoKeyButton>
                            <LoKeyButton
                                variant="primary"
                                className="flex-1"
                                disabled={!panDetails.panno || !panDetails.fullName}
                                onClick={() => {
                                    setShowPanPrompt(false);
                                    onComplete(selectedDocs, panDetails);
                                }}
                            >
                                Continue to DigiLocker
                            </LoKeyButton>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--border);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--muted-foreground);
                }
            `}</style>
        </div>
    );
};

// Helper Component for Documentation Cards
const DocCard = ({ doc, expanded, isSelected, onToggleExpand, onRemove }: any) => {
    return (
        <div className={cn(
            "border-2 rounded-[var(--radius-xl)] bg-[var(--card)] transition-all duration-300 overflow-hidden",
            expanded ? "border-[var(--primary-500)] shadow-lg" : "border-[var(--border)] shadow-sm hover:border-[var(--primary-500)]/30"
        )}>
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={onToggleExpand}>
                    <div className={cn(
                        "w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center transition-all duration-300",
                        expanded ? "bg-[var(--primary-500)] text-white scale-105" : "bg-[var(--muted)] text-[var(--primary-500)]"
                    )}>
                        <doc.icon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-[16px] font-800 tracking-tight">{doc.title}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-[var(--muted-foreground)] font-600">
                                {doc.fields.length} Attributes
                            </span>
                            <span className="w-1 h-1 rounded-full bg-[var(--border)]"></span>
                            <span className={cn(
                                "text-[10px] font-900 uppercase tracking-tighter text-[var(--primary-500)]"
                            )}>
                                {doc.source}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {onRemove && (
                        <button onClick={onRemove} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--color-destructive-600)] transition-colors">
                            <AlertCircle className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={onToggleExpand}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-800 uppercase tracking-wider transition-all",
                            expanded ? "bg-[var(--primary-500)]/10 text-[var(--primary-500)]" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--primary-500)]/5 hover:text-[var(--primary-500)]"
                        )}
                    >
                        {expanded ? "Collapse" : "Edit Fields"}
                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", expanded && "rotate-180")} />
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-[var(--border)] animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-[var(--muted)]/10 p-4">
                        {doc.reason && (
                            <div className="p-3 mb-4 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/5 border border-[var(--primary-500)]/10 flex gap-3 shadow-inner">
                                <Info className="w-4 h-4 text-[var(--primary-500)] shrink-0 mt-0.5" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-[11px] font-900 text-[var(--primary-500)] uppercase tracking-widest">Purpose of Fetch</span>
                                    <p className="text-[12px] text-[var(--muted-foreground)] leading-relaxed font-500">
                                        {doc.reason}
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <span className="text-[11px] font-900 text-[var(--muted-foreground)] uppercase tracking-widest mb-1">Standardized Identity Attributes</span>
                            <div className="flex flex-col divide-y divide-[var(--border)] max-h-[160px] overflow-y-auto pr-2 custom-scrollbar border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--card)] shadow-inner">
                                {doc.fields.map((field: any, i: number) => (
                                    <div key={i} className="px-4 py-3 flex items-start justify-between group/field hover:bg-[var(--muted)]/20 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full mt-2 transition-transform",
                                                field.mvf ? "bg-[var(--primary-500)] scale-125" : "bg-[var(--muted-foreground)]/30"
                                            )}></div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className={cn(
                                                    "text-[13px] font-700",
                                                    field.mvf ? "text-[var(--neutral-900)]" : "text-[var(--muted-foreground)]"
                                                )}>
                                                    {field.label}
                                                </span>
                                                {field.desc && <p className="text-[11px] text-[var(--muted-foreground)] font-500 leading-tight">{field.desc}</p>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {field.mvf ? (
                                                <span className="text-[9px] font-900 text-[var(--primary-500)] uppercase tracking-wider bg-[var(--primary-500)]/10 px-1.5 py-0.5 rounded">Core MVF</span>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[9px] font-700 text-[var(--muted-foreground)] uppercase tracking-wider">Elective</span>
                                                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[var(--border)] accent-[var(--primary-500)]" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
            <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-warning-600)]/10 border border-[var(--color-warning-600)]/30 flex gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--color-warning-600)] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-800 text-[var(--color-warning-600)] uppercase tracking-tight">Account Not Yet Live</span>
                    <p className="text-[12px] font-600 text-[color-mix(in_srgb,var(--color-warning-600),black_15%)] leading-snug">
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
            { p: 60, s: "Signing with Biometric Binding...", h: generateHash() },
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
                addAuditLog("Identity Anchored", "Secure fingerprints registered on Kavach Blockchain");
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

const SuccessLocked = ({ issuedDocs }: { issuedDocs: string[] }) => {
    useEffect(() => {
        localStorage.setItem("kavach_pending_kyc", "false");
        localStorage.setItem("kavach_identity_verified", "true");
        localStorage.setItem("kavach_kyc_complete", "true"); // Clears the dashboard KYC gate
        localStorage.setItem("kavach_issued_docs", JSON.stringify(issuedDocs));
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
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDocs, setSelectedDocs] = useState<string[]>(["aadhaar", "pan", "ckycr"]);
    const [idfyFetching, setIdfyFetching] = useState(false);
    const [backendAlive, setBackendAlive] = useState<boolean | null>(null); // null = checking

    // Ping the backend on mount to check if it's alive
    useEffect(() => {
        fetch("http://localhost:8000/status", { cache: "no-store" })
            .then(r => r.ok ? setBackendAlive(true) : setBackendAlive(false))
            .catch(() => setBackendAlive(false));
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const taskId = params.get("idfy_task_id");
        const docType = params.get("idfy_doc") || "ADHAR";

        if (taskId) {
            // Clean the URL immediately to prevent re-triggering on refresh
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete("idfy_task_id");
            cleanUrl.searchParams.delete("idfy_doc");
            window.history.replaceState({}, document.title, cleanUrl.toString());

            setCurrentStep(2);
            setIdfyFetching(true);

            let pollCount = 0;
            const fetchIdfyResult = async () => {
                if (pollCount > 5) { // Timeout after 10 seconds — non-blocking, continue with whatever succeeded
                    console.warn("IDfy webhook polling timed out — continuing with existing data.");
                    setIdfyFetching(false);
                    return;
                }
                pollCount++;

                try {
                    // Append timestamp to bust aggressive browser cache of the 'pending' JSON
                    const res = await fetch(`http://localhost:8000/result/${taskId}?t=${Date.now()}`);
                    if (!res.ok) throw new Error("Backend not responding");
                    const data = await res.json();

                    if (data.status === 'completed') {
                        let isSuccess = false;
                        // Known IDfy error statuses (non-success terminal states)
                        const IDFY_ERROR_STATUSES = ["INSUFFICIENT_SCOPE", "FAILED", "ERROR", "REJECTED"];
                        const idfyStatus = data.data?.status;
                        if (idfyStatus && IDFY_ERROR_STATUSES.includes(idfyStatus)) {
                            console.error("IDfy API failed:", data.data);
                            alert(`IDfy DigiLocker Fetch Failed for ${docType}.\nReason: ${idfyStatus}\n\nYou can uncheck it or try again.`);
                        } else {
                            // Either status is SUCCESS or status is absent (treat as success)
                            if (docType === "PANCR") {
                                sessionStorage.setItem("kavach_idfy_pan_data", JSON.stringify(data.data));
                            } else {
                                sessionStorage.setItem("kavach_idfy_adhar_data", JSON.stringify(data.data));
                            }
                            addAuditLog("DigiLocker Sync", `${docType} fetched successfully via IDfy.`);
                            isSuccess = true;
                        }

                        setIdfyFetching(false);

                        const url = new URL(window.location.href);
                        url.searchParams.delete("idfy_task_id");
                        url.searchParams.delete("idfy_doc");
                        window.history.replaceState({}, document.title, url.toString());

                        // Automatically trigger the next evaluation only if this one succeeded
                        if (isSuccess) {
                            sessionStorage.setItem("kavach_auto_continue", "true");
                        }
                    } else {
                        setTimeout(fetchIdfyResult, 2000); // Poll again
                    }
                } catch (e) {
                    console.error("IDfy fetch polling failed", e);
                    setTimeout(fetchIdfyResult, 3000);
                }
            };
            fetchIdfyResult();
        } else {
            // Handle resume state
            const isPending = localStorage.getItem("kavach_pending_kyc") === "true";
            if (isPending) {
                setCurrentStep(7); // Resume simulation (VKYC) directly for demo
            }
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

    // No longer auto-clicking the button — the user now manually presses the sequential fetch buttons

    if (idfyFetching) {
        return (
            <OnboardingLayout step={2} totalSteps={9}>
                <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-500">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
                            <ShieldCheck className="w-12 h-12 animate-pulse" />
                        </div>
                        <div className="absolute inset-0 border-4 border-dashed border-[var(--primary-500)]/30 rounded-full animate-[spin_4s_linear_infinite]"></div>
                    </div>
                    <h2 className="mt-8 text-[22px] font-800 tracking-tight text-center">Securing Identity Payload</h2>
                    <p className="text-[14px] text-[var(--muted-foreground)] mt-2 text-center max-w-[280px] leading-relaxed">
                        Retrieving cryptographically signed XML from DigiLocker via IDfy...
                    </p>
                </div>
            </OnboardingLayout>
        );
    }

    return (
        <OnboardingLayout
            step={currentStep}
            totalSteps={9}
            showAudioToggle={true}
        >
            {currentStep === 1 && <UnifiedConsent onNext={() => setCurrentStep(2)} />}
            {currentStep === 2 && <FieldSelection backendAlive={backendAlive} onComplete={async (docs: string[], panDetails?: any) => {
                setSelectedDocs(docs);

                const adharFetched = typeof sessionStorage !== 'undefined' && sessionStorage.getItem("kavach_idfy_adhar_data");
                const panFetched = typeof sessionStorage !== 'undefined' && sessionStorage.getItem("kavach_idfy_pan_data");

                // Check backend is alive before attempting any IDfy redirect
                if (!backendAlive && (docs.includes("aadhaar") || docs.includes("pan"))) {
                    alert("Python API server (localhost:8000) is not running. Start it with: uvicorn main:app --reload");
                    return;
                }

                // Step 1: Fetch Aadhaar via IDfy redirect
                if (docs.includes("aadhaar") && !adharFetched) {
                    setIdfyFetching(true);
                    addAuditLog("IDfy Integration", "Redirecting to IDfy/DigiLocker for Aadhaar fetch");
                    try {
                        const redirectUrl = new URL(window.location.href);
                        redirectUrl.searchParams.set("idfy_doc", "ADHAR");

                        const res = await fetch("http://localhost:8000/start-digilocker", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ doc_type: "ADHAR", redirect_url: redirectUrl.toString() })
                        });
                        const data = await res.json();
                        if (data.redirect_url) {
                            window.location.href = data.redirect_url;
                            return; // Wait for redirect callback
                        } else {
                            throw new Error("No redirect URL returned from backend");
                        }
                    } catch (e: any) {
                        setIdfyFetching(false);
                        alert("Could not reach Python API backend for Aadhaar.\nError: " + e.message);
                        return;
                    }
                }

                // Step 2: Fetch PAN via IDfy redirect (only after Aadhaar is done)
                if (docs.includes("pan") && !panFetched) {
                    setIdfyFetching(true);
                    addAuditLog("IDfy Integration", "Redirecting to IDfy/DigiLocker for PAN fetch");
                    try {
                        const redirectUrl = new URL(window.location.href);
                        redirectUrl.searchParams.set("idfy_doc", "PANCR");

                        const res = await fetch("http://localhost:8000/start-digilocker", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                doc_type: "PANCR",
                                extra_fields: { panno: panDetails?.panno || "", PANFullName: panDetails?.fullName || "" },
                                redirect_url: redirectUrl.toString()
                            })
                        });
                        const data = await res.json();
                        if (data.redirect_url) {
                            window.location.href = data.redirect_url;
                            return; // Wait for redirect callback
                        } else {
                            throw new Error("No redirect URL returned from backend");
                        }
                    } catch (e: any) {
                        setIdfyFetching(false);
                        alert("Could not reach Python API backend for PAN.\nError: " + e.message);
                        return;
                    }
                }

                // Step 3: Both done — proceed to Face Capture
                setCurrentStep(3);
            }} />}
            {currentStep === 3 && <FaceCapture onNext={() => setCurrentStep(4)} />}
            {currentStep === 4 && <CKYCRVerification selectedDocs={selectedDocs} onNext={() => setCurrentStep(5)} />}
            {currentStep === 5 && <EnrichmentHub onNext={() => setCurrentStep(6)} />}
            {currentStep === 6 && (
                <VKYCPrompt
                    onConnect={() => {
                        addAuditLog("VKYC Initiated", "Attempting secure connection with live verification agent");
                        setCurrentStep(7);
                    }}
                    onSchedule={handleScheduleVkyc}
                    onSkip={() => {
                        addAuditLog("VKYC Deferred", "Identity remains locked until Video KYC is completed", "Warning");
                        localStorage.setItem("kavach_pending_kyc", "true");
                        window.location.href = "/dashboard";
                    }}
                />
            )}
            {currentStep === 7 && <VKYCSimulation onComplete={() => setCurrentStep(8)} />}
            {currentStep === 8 && <BlockchainRegistration onComplete={() => setCurrentStep(9)} />}
            {currentStep === 9 && <SuccessLocked issuedDocs={selectedDocs} />}
        </OnboardingLayout>
    );
}
