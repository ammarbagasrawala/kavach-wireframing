import { useNavigate } from "react-router";
import { WfButton, WfCard } from "../components/WireframeUI";
import { useAccessibility } from "../context/AccessibilityContext";
import {
  ShieldCheck,
  Smartphone,
  Users,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useEffect } from "react";

export function LoginOptions() {
  const navigate = useNavigate();
  const { speak } = useAccessibility();

  useEffect(() => {
    speak(
      "How would you like to sign in? Option 1: Sign in with DigiLocker, the fastest way. Option 2: I don't have a DigiLocker account."
    );
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full animate-in slide-in-from-right-8 duration-300">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
          Sign In to Kavach
        </h1>
        <p className="text-xl font-medium">
          Choose a method to securely access your identity.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Primary Recommended Action */}
        <WfCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-[var(--wf-text)] text-[var(--wf-bg)] px-3 py-1 font-bold text-sm">
            RECOMMENDED
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="p-4 border-2 border-[var(--wf-border)] bg-[var(--wf-highlight)]">
              <ShieldCheck className="w-12 h-12" aria-hidden="true" />
            </div>
            <div className="flex-grow">
              <h2 className="text-2xl font-bold mb-2">Sign in with DigiLocker</h2>
              <p className="font-medium opacity-90 mb-4">
                Fastest way. Uses your verified government ID. No new password needed.
              </p>
              <WfButton
                size="lg"
                onClick={() => navigate("/digilocker-redirect")}
                icon={<ArrowRight />}
              >
                Continue with DigiLocker
              </WfButton>
            </div>
          </div>
        </WfCard>

        {/* Secondary: True Cold Start */}
        <WfCard className="border-dashed border-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="p-4 border-2 border-[var(--wf-border)]">
              <AlertCircle className="w-10 h-10" aria-hidden="true" />
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-bold mb-1">
                New User? No DigiLocker?
              </h2>
              <p className="font-medium opacity-90 mb-4">
                We will guide you step-by-step to create one.
              </p>
              <WfButton
                variant="secondary"
                onClick={() => navigate("/no-digilocker")}
              >
                Help me create an account
              </WfButton>
            </div>
          </div>
        </WfCard>

        {/* Alternative Methods (Progressive Disclosure) */}
        <details className="group border-2 border-[var(--wf-border)] p-4 bg-transparent cursor-pointer">
          <summary className="text-xl font-bold flex items-center justify-between outline-none focus:ring-4 focus:ring-[var(--wf-border)] p-2">
            <span>Show Alternative Login Methods</span>
            <span className="text-2xl group-open:rotate-180 transition-transform">
              ▼
            </span>
          </summary>
          <div className="mt-6 space-y-4 pt-4 border-t-2 border-dashed border-[var(--wf-border)]">
            <WfButton
              variant="outline"
              size="lg"
              className="w-full justify-start text-left"
              icon={<Smartphone className="w-6 h-6" />}
              onClick={() => speak("Aadhaar OTP is not yet active in this mock")}
            >
              <div className="flex flex-col">
                <span>Use Aadhaar OTP (Web Fallback)</span>
                <span className="text-sm opacity-80 font-normal">
                  Requires mobile number linked to Aadhaar
                </span>
              </div>
            </WfButton>

            <WfButton
              variant="outline"
              size="lg"
              className="w-full justify-start text-left"
              icon={<Users className="w-6 h-6" />}
              onClick={() => speak("Caregiver mode is not yet active in this mock")}
            >
              <div className="flex flex-col">
                <span>Caregiver / Family Login</span>
                <span className="text-sm opacity-80 font-normal">
                  Log in on behalf of a dependent with consent
                </span>
              </div>
            </WfButton>
          </div>
        </details>
      </div>
    </div>
  );
}
