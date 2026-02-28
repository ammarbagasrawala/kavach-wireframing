import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAccessibility } from "../context/AccessibilityContext";
import { ShieldCheck, Loader2 } from "lucide-react";

export function DigiLockerRedirect() {
  const navigate = useNavigate();
  const { speak } = useAccessibility();

  useEffect(() => {
    speak(
      "Connecting to DigiLocker securely. Please wait while we verify your identity."
    );

    // Simulate OAuth flow delay
    const timer = setTimeout(() => {
      navigate("/biometric-setup");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, speak]);

  return (
    <div className="flex-grow flex flex-col items-center justify-center max-w-lg mx-auto w-full text-center space-y-8 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 border-4 border-[var(--wf-border)] border-dashed rounded-full animate-spin-slow" />
        <div className="w-32 h-32 bg-[var(--wf-highlight)] rounded-full flex items-center justify-center border-4 border-[var(--wf-border)] z-10 relative">
          <ShieldCheck className="w-16 h-16 animate-pulse" />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-black uppercase tracking-tight flex items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          Connecting...
        </h1>
        <p className="text-xl font-medium p-4 border-2 border-[var(--wf-border)] bg-[var(--wf-bg)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
          Securely fetching your identity from official government records via OAuth 2.0.
        </p>
      </div>

      <div className="sr-only" aria-live="polite">
        Authenticating with DigiLocker. This page will automatically redirect
        when complete.
      </div>
    </div>
  );
}
