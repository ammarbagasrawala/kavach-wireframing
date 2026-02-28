import { useNavigate } from "react-router";
import { WfButton, WfCard } from "../components/WireframeUI";
import { useAccessibility } from "../context/AccessibilityContext";
import { PlayCircle, Globe, Accessibility, ChevronRight } from "lucide-react";
import { useEffect } from "react";

export function Splash() {
  const navigate = useNavigate();
  const { speak } = useAccessibility();

  useEffect(() => {
    speak("Welcome to Kavach. Please select your preferences to continue.");
  }, []);

  return (
    <div className="flex-grow flex flex-col items-center justify-center max-w-2xl mx-auto w-full gap-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-4">
        <div
          className="w-24 h-24 border-4 mx-auto flex items-center justify-center text-5xl font-black mb-6"
          style={{
            borderColor: "var(--wf-border)",
            backgroundColor: "var(--wf-border)",
            color: "var(--wf-bg)",
          }}
          aria-hidden="true"
        >
          K
        </div>
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight">
          Welcome to Kavach
        </h1>
        <p className="text-xl opacity-90 font-medium">
          Your secure digital identity, accessible to everyone.
        </p>
      </div>

      <WfCard className="w-full flex flex-col gap-6">
        <h2 className="text-2xl font-bold border-b-2 border-[var(--wf-border)] pb-2 mb-2">
          Initial Setup
        </h2>

        <div className="space-y-4">
          <WfButton
            variant="secondary"
            size="lg"
            className="w-full justify-between"
            icon={<Globe className="w-6 h-6" />}
          >
            <span>Choose Language (English)</span>
            <ChevronRight className="w-6 h-6" />
          </WfButton>

          <WfButton
            variant="secondary"
            size="lg"
            className="w-full justify-between"
            icon={<PlayCircle className="w-6 h-6" />}
          >
            <span>Watch a Quick Guide (Sign Language available)</span>
            <ChevronRight className="w-6 h-6" />
          </WfButton>
        </div>

        <div className="pt-4 mt-2">
          <WfButton
            variant="primary"
            size="xl"
            onClick={() => navigate("/login")}
            className="w-full group"
          >
            <span>Start Onboarding</span>
            <ChevronRight className="w-8 h-8 ml-2 group-hover:translate-x-1 transition-transform" />
          </WfButton>
        </div>
      </WfCard>
    </div>
  );
}
