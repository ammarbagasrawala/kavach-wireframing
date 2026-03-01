"use client";

import React from "react";
import LoKeyButton from "./components/LoKeyButton";
import { cn } from "./components/LoKeyButton";
import {
  ShieldCheck,
  ArrowRight,
  Smartphone,
  UserRoundCheck,
  History,
  ShieldAlert,
  RefreshCcw,
  FileText,
  LayoutDashboard,
  Globe,
  Fingerprint,
  Zap,
  Building2
} from "lucide-react";

const FlowCard = ({ title, description, items, icon: Icon, color }: any) => (
  <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 flex flex-col gap-6 shadow-elevation-sm hover:shadow-elevation-md transition-all group overflow-hidden relative">
    <div className={cn("absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.03] transition-transform group-hover:scale-110", color)}>
      <Icon className="w-full h-full" />
    </div>

    <div className="flex flex-col gap-2 relative">
      <div className={cn("w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center text-white shadow-lg", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="text-[20px] font-800 tracking-tight mt-2">{title}</h2>
      <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">{description}</p>
    </div>

    <div className="flex flex-col gap-2 mt-auto">
      {items.map((item: any, i: number) => (
        <button
          key={i}
          onClick={() => window.location.href = item.href}
          className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--muted)]/50 hover:bg-[var(--primary-500)] hover:text-white transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="text-[13px] font-700 tracking-tight">{item.label}</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 opacity-50" />
        </button>
      ))}
    </div>
  </div>
);

export default function NavigatorPage() {
  const resetPrototype = () => {
    if (confirm("This will clear all simulation data and take you to the first screen. Proceed?")) {
      localStorage.clear();
      window.location.href = "/onboarding";
    }
  };

  const categories = [
    {
      title: "Bootstrap & Entry",
      description: "The initial 'cold start' experience for unauthenticated users.",
      icon: Globe,
      color: "bg-[var(--primary-600)]",
      items: [
        { label: "Onboarding Splash", icon: Smartphone, href: "/onboarding" },
        { label: "Authentication Gateway", icon: Fingerprint, href: "/onboarding?login=true" },
      ]
    },
    {
      title: "Identity Issuance",
      description: "The core Verifiable Credential creation and enrichment flow.",
      icon: ShieldCheck,
      color: "bg-[var(--primary-500)]",
      items: [
        { label: "Unified Consent & OTP", icon: ShieldCheck, href: "/create-vc" },
        { label: "Enrichment Hub", icon: Zap, href: "/add-documents" },
      ]
    },
    {
      title: "Daily Management",
      description: "Viewing credentials, tracking activity, and vault security.",
      icon: LayoutDashboard,
      color: "bg-[var(--color-success-700)]",
      items: [
        { label: "Main Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { label: "Secure Vault Access", icon: FileText, href: "/credentials" },
        { label: "Activity Trail", icon: History, href: "/audit-logs" },
      ]
    },
    {
      title: "Ecosystem Utility",
      description: "Interactions with third-party organizations and verifiers.",
      icon: UserRoundCheck,
      color: "bg-[var(--color-destructive-600)]",
      items: [
        { label: "KYC Requests Hub", icon: ShieldAlert, href: "/requests" },
        { label: "Selective Disclosure", icon: UserRoundCheck, href: "/requests" },
      ]
    },
    {
      title: "Bank KYC Portal",
      description: "Bank official portal: KYC Provider (perform KYC / issue credentials) or KYC Seeker (request attributes from user, run verification).",
      icon: Building2,
      color: "bg-[var(--color-info-600)]",
      items: [
        { label: "Bank Portal (official login)", icon: Building2, href: "/bank" },
        { label: "KYC Provider flow", icon: ShieldCheck, href: "/bank" },
        { label: "KYC Seeker flow", icon: FileText, href: "/bank" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center pt-24 pb-12 px-6 relative">
      {/* Internal Review Banner */}
      <div className="fixed top-0 left-0 w-full bg-[var(--neutral-900)] text-white py-2 px-4 z-[200] flex items-center justify-center gap-3 shadow-lg">
        <ShieldAlert className="w-4 h-4 text-[var(--color-warning-600)]" />
        <span className="text-[11px] font-900 uppercase tracking-[0.2em]">Internal Review Only • Not Final Product</span>
        <div className="w-px h-3 bg-white/20 mx-2" />
        <span className="text-[10px] font-600 opacity-70">Simulation Environment v1.2.0</span>
      </div>

      {/* Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] flex items-center justify-center select-none rotate-[-15deg]">
        <span className="text-[12vw] font-900 uppercase">Prototyping Mode</span>
      </div>
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary-500)]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--primary-500)]/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-6xl w-full flex flex-col gap-12 relative">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="bg-white p-2 rounded-[var(--radius-lg)] shadow-xl mb-2">
            <img src="/logo.png" alt="Kavach Logo" className="h-12 w-auto" />
          </div>
          <h1 className="text-[32px] md:text-[48px] font-900 tracking-tighter leading-tight bg-gradient-to-br from-[var(--neutral-900)] to-[var(--neutral-600)] bg-clip-text text-transparent">
            Prototyping & Review Dashboard
          </h1>
          <p className="max-w-2xl text-[14px] md:text-[16px] text-[var(--muted-foreground)] leading-relaxed font-500">
            Internal evaluation tool for India's first user-held tokenized KYC platform.
            Use the links below to jump into specific flows or start the full simulation.
          </p>

          <div className="flex flex-col md:flex-row items-center gap-4 mt-6">
            <LoKeyButton
              variant="primary"
              size="xxl"
              className="px-12 h-16 text-[18px] shadow-2xl shadow-[var(--primary-500)]/20"
              onClick={() => window.location.href = "/onboarding"}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Enter App Simulation
            </LoKeyButton>
            <LoKeyButton
              variant="secondary"
              size="xxl"
              className="px-10 h-16 text-[16px]"
              onClick={() => window.location.href = "/bank"}
              rightIcon={<Building2 className="w-5 h-5" />}
            >
              Start Bank KYC Flow
            </LoKeyButton>
            <div className="flex items-center gap-3">
              <LoKeyButton
                variant="tertiary"
                size="xl"
                className="bg-white border border-[var(--border)]"
                leftIcon={<RefreshCcw className="w-4 h-4" />}
                onClick={resetPrototype}
              >
                Reset States
              </LoKeyButton>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${i * 100}ms` }}>
              <FlowCard {...cat} />
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-6 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-xl)] flex flex-col md:flex-row items-center justify-between gap-6 shadow-elevation-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
              <Info className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-700">Internal Simulation Tool</span>
              <span className="text-[12px] text-[var(--muted-foreground)]">Kavach Wireframe Portal • Built for RBI Concept Review</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.open('/walkthrough.md', '_blank')}
              className="text-[13px] font-700 text-[var(--primary-500)] hover:underline"
            >
              View Walkthrough
            </button>
            <div className="w-px h-4 bg-[var(--border)]"></div>
            <span className="text-[12px] font-600 text-[var(--muted-foreground)]">v1.2.0 (Responsive Build)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const Info = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
  </svg>
);
