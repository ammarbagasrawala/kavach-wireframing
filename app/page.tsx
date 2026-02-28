"use client";

import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import PageHeader from "./components/PageHeader";
import StatCard from "./components/StatCard";
import LoKeyButton from "./components/LoKeyButton";
import StatusChip from "./components/StatusChip";
import { cn } from "./components/LoKeyButton";
import {
  Users,
  ShieldCheck,
  Clock,
  Plus,
  Filter,
  ShieldAlert,
  ArrowRight,
  Lock as LockIcon,
  FileText
} from "lucide-react";

export default function Home() {
  const [pendingKyc, setPendingKyc] = useState(false);
  const [verified, setVerified] = useState(false);
  const [fetchedDocs, setFetchedDocs] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    const isPending = localStorage.getItem("kavach_pending_kyc") === "true";
    const isVerified = localStorage.getItem("kavach_identity_verified") === "true";
    setPendingKyc(isPending);
    setVerified(isVerified);

    const docs = localStorage.getItem("kavach_fetched_docs");
    if (docs) setFetchedDocs(JSON.parse(docs));

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
          <>
            <LoKeyButton variant="tertiary" size="s" leftIcon={<Filter className="w-4 h-4" />}>
              Filter
            </LoKeyButton>
            <LoKeyButton
              variant="primary"
              size="s"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => window.location.href = verified ? "/add-documents" : "/create-vc"}
            >
              {verified ? "Add Documents" : "Verify Identity"}
            </LoKeyButton>
          </>
        }
      />

      <main className="flex-1 overflow-y-auto p-6 bg-[var(--background)]">
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
          <div className="mb-6 p-4 md:p-6 rounded-[var(--radius-xl)] bg-[var(--amber-500)]/10 border border-[var(--amber-600)] flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[var(--amber-500)] flex items-center justify-center text-white shrink-0">
              <LockIcon className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-[16px] md:text-[18px] font-700 text-[var(--neutral-900)]">Credentials Locked</h2>
              <p className="text-[13px] md:text-[14px] text-[var(--muted-foreground)]">Complete Video KYC to unlock your generated credentials.</p>
            </div>
            <LoKeyButton variant="primary" size="l" className="w-full md:w-auto bg-[var(--amber-600)]" onClick={() => window.location.href = "/create-vc"}>
              Add Documents
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
            <LoKeyButton variant="tertiary" size="l" className="w-full md:w-auto" leftIcon={<Plus className="w-4 h-4" />} onClick={() => window.location.href = "/add-documents"}>
              Add More
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
            <h2 className="text-[18px] font-800 mb-4 px-1">My Verifiable Credentials</h2>
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
                  "bg-[var(--card)] border border-[var(--border)] p-5 rounded-[var(--radius-lg)] flex items-center justify-between group transition-all",
                  !verified && "opacity-60"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center", verified ? "bg-[var(--primary-500)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]")}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-700">{vc.name}</span>
                      <span className="text-[12px] text-[var(--muted-foreground)]">Issued by {vc.provider}</span>
                    </div>
                  </div>
                  {verified ? (
                    <LoKeyButton variant="ghost" size="xs" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => window.location.href = "/credentials"}>
                      View Securely
                    </LoKeyButton>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-[var(--muted)] rounded-full text-[10px] font-700 text-[var(--muted-foreground)] uppercase">
                      <LockIcon className="w-3 h-3" /> Locked
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
                <div className="min-w-[600px] lg:min-w-0 divide-y divide-[var(--border)]">
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
                  <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--amber-500)] bg-[var(--amber-500)]/5 flex flex-col gap-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--amber-500)] flex items-center justify-center text-white mx-auto">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-700">Video KYC Pending</span>
                      <p className="text-[12px] text-[var(--muted-foreground)]">Complete VKYC to unlock credentials.</p>
                    </div>
                    <LoKeyButton variant="primary" size="s" className="bg-[var(--amber-600)] border-none w-full" onClick={() => window.location.href = "/create-vc"}>
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
    </Layout>
  );
}
