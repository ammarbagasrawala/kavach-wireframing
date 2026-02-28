"use client";

import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import LoKeyButton from "../components/LoKeyButton";
import StatusChip from "../components/StatusChip";
import {
    History,
    Search,
    Filter,
    Download,
    Calendar,
    ShieldCheck,
    Lock as LockIcon,
    AlertCircle,
    UserCircle
} from "lucide-react";

export default function AuditLogsPage() {
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const logs = localStorage.getItem("kavach_audit_logs");
        if (logs) {
            setAuditLogs(JSON.parse(logs));
        } else {
            const defaultLogs = [
                { id: 1, action: "Device Binding", details: "Secure Enclave activation successful", time: "2h ago", status: "Success", entity: "System" },
                { id: 2, action: "Authentication", details: "Linked via DigiLocker #9021", time: "1h ago", status: "Success", entity: "User" }
            ];
            setAuditLogs(defaultLogs);
            localStorage.setItem("kavach_audit_logs", JSON.stringify(defaultLogs));
        }
    }, []);

    const filteredLogs = auditLogs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout currentPage="Audit Logs">
            <PageHeader
                title="Audit Logs"
                breadcrumbs={[{ label: "Kavach" }, { label: "Security" }, { label: "Audit Logs" }]}
                actions={
                    <>
                        <LoKeyButton variant="tertiary" size="s" leftIcon={<Download className="w-4 h-4" />}>
                            Export CSV
                        </LoKeyButton>
                        <LoKeyButton variant="primary" size="s" leftIcon={<Calendar className="w-4 h-4" />}>
                            Select Range
                        </LoKeyButton>
                    </>
                }
            />

            <main className="flex-1 overflow-y-auto p-6 bg-[var(--background)]">
                <div className="max-w-6xl mx-auto flex flex-col gap-6">

                    {/* Activity Overview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-[var(--radius-lg)]">
                            <p className="text-[11px] text-[var(--muted-foreground)] uppercase font-700 tracking-wider mb-1">Total Events</p>
                            <h3 className="text-[20px] md:text-[24px] font-700">{auditLogs.length}</h3>
                        </div>
                        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-[var(--radius-lg)]">
                            <p className="text-[11px] text-[var(--muted-foreground)] uppercase font-700 tracking-wider mb-1">Security Alerts</p>
                            <h3 className="text-[20px] md:text-[24px] font-700 text-[var(--color-success-700)]">0</h3>
                        </div>
                        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-[var(--radius-lg)] sm:col-span-2">
                            <p className="text-[11px] text-[var(--muted-foreground)] uppercase font-700 tracking-wider mb-1">Last Secure Check</p>
                            <h3 className="text-[13px] md:text-[14px] font-600">Authenticated via Secure Enclave (Just Now)</h3>
                        </div>
                    </div>

                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-elevation-sm overflow-hidden">
                        {/* Filter Bar */}
                        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--card)]">
                            <div className="relative w-full sm:max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                                <input
                                    type="text"
                                    placeholder="Search by action or detail..."
                                    className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-[14px] focus:outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <LoKeyButton variant="tertiary" size="s" className="flex-1 sm:flex-none" leftIcon={<Filter className="w-4 h-4" />}>
                                    Filter Type
                                </LoKeyButton>
                            </div>
                        </div>

                        {/* Logs Table */}
                        <div className="overflow-x-auto md:overflow-visible">
                            <div className="min-w-0 md:min-w-[800px]">
                                <table className="w-full text-left flex flex-col md:table">
                                    <thead className="bg-[var(--background)] border-b border-[var(--border)] text-[11px] font-700 text-[var(--muted-foreground)] uppercase tracking-wider hidden md:table-header-group">
                                        <tr>
                                            <th className="px-6 py-4">Action</th>
                                            <th className="px-6 py-4">Participant</th>
                                            <th className="px-6 py-4">Timestamp</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {filteredLogs.length > 0 ? (
                                            filteredLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-[var(--muted)]/30 transition-colors group flex flex-col md:table-row py-4 md:py-0 px-6 md:px-0">
                                                    <td className="md:px-6 md:py-4 border-none md:border-b">
                                                        <div className="flex items-center gap-3 mb-2 md:mb-0">
                                                            <div className="w-8 h-8 rounded-full bg-[var(--primary-500)]/5 flex items-center justify-center text-[var(--primary-500)] group-hover:scale-110 transition-transform shrinking-0">
                                                                {log.action.includes("Vault") ? <LockIcon className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                                            </div>
                                                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                                                <span className="text-[13px] font-700 uppercase tracking-tight">{log.action}</span>
                                                                <span className="text-[11px] text-[var(--muted-foreground)] md:hidden">{log.time}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="md:px-6 md:py-4 border-none md:border-b hidden md:table-cell">
                                                        <div className="flex items-center gap-2">
                                                            <UserCircle className="w-4 h-4 text-[var(--muted-foreground)]" />
                                                            <span className="text-[12px] text-[var(--neutral-900)]">{log.entity || "Identity Holder"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="md:px-6 md:py-4 border-none md:border-b hidden md:table-cell">
                                                        <span className="text-[12px] font-600">{log.time}</span>
                                                    </td>
                                                    <td className="md:px-6 md:py-4 border-none md:border-b">
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--color-success-700)]/10 w-fit mb-2 md:mb-0">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success-700)]" />
                                                            <span className="text-[10px] font-700 text-[var(--color-success-700)] uppercase">{log.status}</span>
                                                        </div>
                                                    </td>
                                                    <td className="md:px-6 md:py-4 md:text-right border-none md:border-b">
                                                        <span className="text-[12px] text-[var(--muted-foreground)] italic md:whitespace-nowrap">{log.details}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-[var(--muted-foreground)]">
                                                    <div className="flex flex-col items-center gap-2 opacity-50">
                                                        <AlertCircle className="w-8 h-8" />
                                                        <p>No matching logs found.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </Layout>
    );
}
