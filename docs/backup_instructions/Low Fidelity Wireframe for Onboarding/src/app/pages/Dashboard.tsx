import { useAccessibility } from "../context/AccessibilityContext";
import { WfCard, WfButton } from "../components/WireframeUI";
import {
  CheckCircle2,
  FileText,
  Bell,
  LogOut,
  User,
  FileWarning,
  RefreshCw,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export function Dashboard() {
  const { speak } = useAccessibility();
  const navigate = useNavigate();
  const [vcState, setVcState] = useState<"incomplete" | "generating" | "complete">(
    "incomplete"
  );

  useEffect(() => {
    if (vcState === "incomplete") {
      speak(
        "Welcome to your Kavach dashboard. Your setup is incomplete. Please generate your Identity Verifiable Credential to continue."
      );
    }
  }, [speak, vcState]);

  const handleGenerate = () => {
    setVcState("generating");
    speak(
      "Fetching documents from DigiLocker and generating your secure Verifiable Credential. Please wait."
    );

    // Simulate the VC generation and fetching process
    setTimeout(() => {
      setVcState("complete");
      speak(
        "Success. Verifiable Credential generated. Your profile is now complete."
      );
    }, 3500);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b-4 border-[var(--wf-border)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[var(--wf-border)] bg-[var(--wf-highlight)] font-bold text-sm mb-4">
            <CheckCircle2 className="w-4 h-4" />
            DigiLocker Connected
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight">
            My Kavach
          </h1>
        </div>
        <WfButton
          variant="outline"
          size="sm"
          icon={<LogOut className="w-4 h-4" />}
          onClick={() => navigate("/")}
        >
          Sign Out
        </WfButton>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <WfCard className="flex flex-col items-center text-center p-6">
            {vcState === "complete" ? (
              <>
                <div className="w-24 h-24 border-4 border-[var(--wf-border)] rounded-full flex items-center justify-center bg-[var(--wf-bg)] mb-4 overflow-hidden">
                  <User className="w-12 h-12 opacity-50" />
                </div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Verified
                </h2>
                <p className="font-medium opacity-80 mt-1">
                  DID: did:kav:9x8y...3k2
                </p>
                <div className="w-full mt-6 space-y-2 text-left text-sm font-medium">
                  <div className="flex justify-between border-b-2 border-dashed border-[var(--wf-border)] pb-1">
                    <span>Trust Level</span>
                    <span className="font-bold">High (Biometric)</span>
                  </div>
                  <div className="flex justify-between border-b-2 border-dashed border-[var(--wf-border)] pb-1">
                    <span>Device Binding</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      Active
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 border-4 border-dashed border-[var(--wf-border)] rounded-full flex items-center justify-center bg-[var(--wf-highlight)] mb-4 overflow-hidden opacity-50">
                  <User className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold opacity-60 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> Not Verified
                </h2>
                <p className="font-medium opacity-60 mt-1">DID: Pending...</p>
                <div className="w-full mt-6 space-y-2 text-left text-sm font-medium opacity-60">
                  <div className="flex justify-between border-b-2 border-dashed border-[var(--wf-border)] pb-1">
                    <span>Trust Level</span>
                    <span className="font-bold">Low</span>
                  </div>
                  <div className="flex justify-between border-b-2 border-dashed border-[var(--wf-border)] pb-1">
                    <span>Device Binding</span>
                    <span className="font-bold">Active</span>
                  </div>
                </div>
              </>
            )}
          </WfCard>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          {vcState === "incomplete" && (
            <div className="animate-in slide-in-from-right-8 duration-300">
              <h2 className="text-2xl font-black uppercase border-b-2 border-[var(--wf-border)] pb-2 mb-6">
                Action Required
              </h2>
              <WfCard className="border-4 border-dashed bg-[var(--wf-highlight)] flex flex-col items-center text-center p-8">
                <FileWarning className="w-16 h-16 mb-4" />
                <h3 className="text-2xl font-bold mb-2">
                  Identity Profile Incomplete
                </h3>
                <p className="font-medium text-lg max-w-md mb-8 opacity-90">
                  Your device is secured, but no Verifiable Credentials (VCs)
                  have been generated yet. Fetch your official details to complete
                  your digital identity.
                </p>
                <WfButton
                  size="xl"
                  onClick={handleGenerate}
                  icon={<RefreshCw className="w-6 h-6" />}
                  className="w-full sm:w-auto"
                >
                  Fetch & Generate Identity VC
                </WfButton>
              </WfCard>
            </div>
          )}

          {vcState === "generating" && (
            <div className="animate-in fade-in duration-300 h-full flex flex-col items-center justify-center py-12">
              <Loader2 className="w-16 h-16 animate-spin mb-6" />
              <h3 className="text-2xl font-bold mb-2">
                Generating your Credentials...
              </h3>
              <div className="space-y-3 mt-8 w-full max-w-md font-medium">
                <div className="flex items-center gap-3 opacity-50">
                  <CheckCircle2 className="w-5 h-5" /> Requesting Aadhaar & PAN from DigiLocker
                </div>
                <div className="flex items-center gap-3 animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin" /> Packaging as a Verifiable Credential
                </div>
                <div className="flex items-center gap-3 opacity-30">
                  <div className="w-5 h-5 border-2 border-[var(--wf-border)] rounded-full"></div> Signing with your Device Key
                </div>
              </div>
            </div>
          )}

          {vcState === "complete" && (
            <div className="animate-in slide-in-from-bottom-8 duration-500">
              <h2 className="text-2xl font-black uppercase border-b-2 border-[var(--wf-border)] pb-2 mb-6">
                Your Credentials
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <WfCard className="cursor-pointer hover:bg-[var(--wf-highlight)] transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="w-8 h-8" />
                    <span className="bg-[var(--wf-text)] text-[var(--wf-bg)] px-2 py-1 text-xs font-bold">
                      VERIFIED
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">Aadhaar Card VC</h3>
                  <p className="text-sm opacity-80 mt-1">Fetched via DigiLocker</p>
                </WfCard>

                <WfCard className="cursor-pointer hover:bg-[var(--wf-highlight)] transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="w-8 h-8" />
                    <span className="bg-[var(--wf-text)] text-[var(--wf-bg)] px-2 py-1 text-xs font-bold">
                      VERIFIED
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">PAN Record VC</h3>
                  <p className="text-sm opacity-80 mt-1">Fetched via DigiLocker</p>
                </WfCard>
              </div>

              <h2 className="text-2xl font-black uppercase border-b-2 border-[var(--wf-border)] pb-2 mt-12 mb-6">
                Pending Actions
              </h2>
              <WfCard className="border-dashed bg-[var(--wf-highlight)] flex items-center gap-4">
                <Bell className="w-8 h-8 shrink-0" />
                <div className="flex-grow">
                  <h3 className="font-bold">Complete your health profile</h3>
                  <p className="text-sm">
                    Link your ABHA ID to unlock health features.
                  </p>
                </div>
                <WfButton size="sm">Start</WfButton>
              </WfCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
