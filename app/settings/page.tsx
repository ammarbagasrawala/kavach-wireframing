"use client";

import React from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { Settings, ShieldCheck, Headphones, Globe } from "lucide-react";

export default function SettingsPage() {
    return (
        <Layout currentPage="Settings">
            <PageHeader
                title="Settings"
                breadcrumbs={[{ label: "Kavach" }, { label: "Preferences" }, { label: "Settings" }]}
            />
            <main className="flex-1 overflow-y-auto p-6 bg-[var(--background)]">
                <div className="max-w-2xl mx-auto flex flex-col gap-6">
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
            <button className="text-[13px] font-700 text-[var(--primary-500)]">Change</button>
        </div>
    );
}
