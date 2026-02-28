import { useNavigate } from "react-router";
import { WfButton, WfCard } from "../components/WireframeUI";
import { useAccessibility } from "../context/AccessibilityContext";
import { Fingerprint, Lock, KeyRound, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

export function BiometricSetup() {
  const navigate = useNavigate();
  const { speak } = useAccessibility();
  const [bound, setBound] = useState(false);

  useEffect(() => {
    speak(
      "Authentication successful. Step 2: Secure your device. Bind this phone with your fingerprint or face ID to protect your data."
    );
  }, []);

  const handleBind = () => {
    speak("Device bound successfully.");
    setBound(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  };

  if (bound) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in duration-300">
        <CheckCircle2 className="w-32 h-32" />
        <h1 className="text-4xl font-black uppercase">Device Secured!</h1>
        <p className="text-xl font-bold">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full animate-in slide-in-from-bottom-8 duration-300">
      <div className="text-center space-y-2 mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--wf-highlight)] border-4 border-[var(--wf-border)] rounded-full mb-2">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tight">
          Secure This Device
        </h1>
        <p className="text-xl font-medium">
          Create a secure key-pass so nobody else can access your Kavach on this
          phone.
        </p>
      </div>

      <WfCard className="border-4 bg-[var(--wf-highlight)] flex flex-col items-center text-center p-8 space-y-6">
        <Fingerprint className="w-24 h-24 animate-pulse" />
        <div>
          <h2 className="text-2xl font-bold mb-2">Enable Biometrics</h2>
          <p className="font-medium text-lg">
            Use your device's built-in Fingerprint or Face ID for fast, secure
            login next time.
          </p>
        </div>

        <WfButton size="xl" onClick={handleBind} className="w-full sm:w-auto">
          Bind Device Now
        </WfButton>
      </WfCard>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-dashed border-[var(--wf-border)]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[var(--wf-bg)] font-bold uppercase">
            OR FALLBACK OPTION
          </span>
        </div>
      </div>

      <WfCard className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-dashed">
        <div className="flex items-center gap-4">
          <KeyRound className="w-8 h-8" />
          <div>
            <h3 className="text-lg font-bold">I cannot use Biometrics</h3>
            <p className="font-medium text-sm">Setup a 6-digit secure PIN instead.</p>
          </div>
        </div>
        <WfButton variant="outline" onClick={() => speak("PIN setup mock")}>
          Setup PIN
        </WfButton>
      </WfCard>
    </div>
  );
}
