import { useNavigate } from "react-router";
import { WfButton, WfCard } from "../components/WireframeUI";
import { useAccessibility } from "../context/AccessibilityContext";
import { PlayCircle, Volume2, ArrowLeft, ExternalLink } from "lucide-react";
import { useEffect } from "react";

export function NoDigiLocker() {
  const navigate = useNavigate();
  const { speak } = useAccessibility();

  useEffect(() => {
    speak(
      "Let's create your DigiLocker. Step 1: You will need your Aadhaar number. Step 2: Open DigiLocker to sign up."
    );
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full animate-in slide-in-from-right-8 duration-300">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-bold hover:underline self-start p-2 outline-none focus:ring-4 focus:ring-[var(--wf-border)]"
        aria-label="Go back to previous screen"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
          Let's create your DigiLocker
        </h1>
        <p className="text-xl font-medium">
          Kavach uses DigiLocker to keep your identity safe. You only need to do
          this once.
        </p>
      </div>

      <WfCard className="bg-[var(--wf-highlight)] border-dashed">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div
            className="w-full sm:w-1/3 aspect-video bg-[var(--wf-bg)] border-2 border-[var(--wf-border)] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 group transition-colors"
            aria-label="Play tutorial video"
            role="button"
            tabIndex={0}
          >
            <PlayCircle className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-bold">Watch Tutorial</span>
          </div>
          <div className="w-full sm:w-2/3 space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Volume2 className="w-6 h-6" /> Audio Guide Available
            </h2>
            <p className="font-medium">
              We have a short video and audio guide in Hindi, English, and 10
              other languages to help you through the process.
            </p>
            <WfButton variant="outline" size="sm">
              Change Audio Language
            </WfButton>
          </div>
        </div>
      </WfCard>

      <div className="space-y-4 relative">
        {/* Step 1 */}
        <WfCard className="flex gap-4 items-start">
          <div className="w-12 h-12 shrink-0 rounded-full border-4 border-[var(--wf-border)] flex items-center justify-center text-xl font-black bg-[var(--wf-bg)]">
            1
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Keep Aadhaar Ready</h3>
            <p className="font-medium opacity-90">
              You will need your 12-digit Aadhaar number and the mobile phone
              linked to it to receive an OTP.
            </p>
          </div>
        </WfCard>

        {/* Step 2 */}
        <WfCard className="flex gap-4 items-start">
          <div className="w-12 h-12 shrink-0 rounded-full border-4 border-[var(--wf-border)] flex items-center justify-center text-xl font-black bg-[var(--wf-bg)]">
            2
          </div>
          <div className="w-full">
            <h3 className="text-xl font-bold mb-1">Register on DigiLocker</h3>
            <p className="font-medium opacity-90 mb-4">
              We will open the official DigiLocker website for you. Once you are
              done, come back here.
            </p>
            <WfButton
              size="lg"
              className="w-full sm:w-auto"
              icon={<ExternalLink className="w-5 h-5" />}
              onClick={() => {
                speak("Opening DigiLocker in a new window.");
                // Simulate they went and came back
                setTimeout(() => navigate("/login"), 1000);
              }}
            >
              Open DigiLocker to Register
            </WfButton>
          </div>
        </WfCard>
      </div>

      <div className="text-center p-4">
        <p className="font-bold border-b-2 border-transparent inline-block">
          Having trouble? <a href="#" className="underline">Call Support</a> or <a href="#" className="underline">Ask a Caregiver</a>.
        </p>
      </div>
    </div>
  );
}
