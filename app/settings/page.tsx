"use client";

import React from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { Settings, ShieldCheck, Headphones, Globe, User, Zap, Key, Copy } from "lucide-react";
import { addAuditLog } from "../components/AuditLogger";

export default function SettingsPage() {
    const [kavachId, setKavachId] = React.useState<string>("ammar@kavach");

    React.useEffect(() => {
        const id = localStorage.getItem("kavach_user_id");
        if (id) setKavachId(id);
    }, []);

    return (
        <Layout currentPage="Settings">
            <PageHeader
                title="Settings"
                breadcrumbs={[{ label: "Kavach" }, { label: "Preferences" }, { label: "Settings" }]}
            />
            <main className="flex-1 overflow-y-auto p-6 bg-[var(--background)]">
                <div className="max-w-2xl mx-auto flex flex-col gap-6">
                    {/* Kavach Profile Section */}
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 flex flex-col gap-6 shadow-elevation-sm overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--primary-500)]"></div>
                        <div className="flex items-center justify-between">
                            <h2 className="text-[18px] font-800 tracking-tight">Kavach Profile</h2>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--primary-500)]/10 border border-[var(--primary-500)]/20 text-[10px] font-800 text-[var(--primary-500)] uppercase tracking-tight">
                                <ShieldCheck className="w-3 h-3" /> Verified Identity
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--primary-500)]/5 border border-[var(--primary-500)]/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--primary-500)] text-white flex items-center justify-center shadow-lg shadow-[var(--primary-500)]/20">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-800 uppercase text-[var(--muted-foreground)] tracking-widest">Kavach Discovery ID</span>
                                        <span className="text-[17px] font-900 text-[var(--primary-500)]">{kavachId}</span>
                                    </div>
                                </div>
                                <button className="p-2 rounded-full hover:bg-[var(--primary-500)]/10 text-[var(--primary-500)] transition-colors">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--muted)] text-[var(--muted-foreground)] flex items-center justify-center">
                                        <Key className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[11px] font-800 uppercase text-[var(--muted-foreground)] tracking-widest">Digital ID (DID)</span>
                                        <span className="text-[13px] font-700 font-mono text-[var(--muted-foreground)] truncate">did:kavach:982fd8...7a4x9</span>
                                    </div>
                                </div>
                                <button className="p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 flex flex-col gap-6 shadow-elevation-sm">
                        <h2 className="text-[18px] font-800 tracking-tight">User Preferences</h2>

                        <div className="flex flex-col divide-y divide-[var(--border)]">
                            <SettingItem
                                icon={Globe}
                                title="App Language"
                                value="English (Primary)"
                            />
                            <SettingItem
                                icon={Headphones}
                                title="Audio Guidance"
                                value="Off"
                            />
                            <SettingItem
                                icon={ShieldCheck}
                                title="Biometric Security"
                                value="Always Required"
                            />
                        </div>
                    </div>

                    <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--muted)] border border-[var(--border)] flex gap-3 text-center">
                        <p className="text-[12px] text-[var(--muted-foreground)] w-full font-600">
                            Version 1.2.0 • Build verified for Secure Enclave
                        </p>
                    </div>
                </div>
            </main>
        </Layout>
    );
}

function SettingItem({ icon: Icon, title, value }: any) {
    return (
        <div className="py-4 flex items-center justify-between group cursor-pointer hover:bg-[var(--muted)]/30 transition-colors px-2 rounded-[var(--radius-md)]">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-500)]/5 flex items-center justify-center text-[var(--primary-500)]">
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[14px] font-700">{title}</span>
                    <span className="text-[12px] text-[var(--muted-foreground)]">{value}</span>
                </div>
            </div>
            <button
                onClick={() => {
                    addAuditLog("Setting Updated", `Changed ${title} preference`, "Info");
                    alert(`${title} updated successfully`);
                }}
                className="text-[13px] font-700 text-[var(--primary-500)]"
            >
                Change
            </button>
        </div>
    );
}
