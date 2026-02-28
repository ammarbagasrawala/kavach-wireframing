import {
  Type,
  SunMoon,
  Volume2,
  VolumeX,
  Globe,
  Settings,
} from "lucide-react";
import { useAccessibility } from "../context/AccessibilityContext";

export function A11yControls() {
  const {
    theme,
    setTheme,
    textSize,
    setTextSize,
    voiceEnabled,
    setVoiceEnabled,
  } = useAccessibility();

  const isHC = theme === "high-contrast";

  const cycleTextSize = () => {
    if (textSize === "normal") setTextSize("large");
    else if (textSize === "large") setTextSize("extra-large");
    else setTextSize("normal");
  };

  const toggleTheme = () => {
    setTheme(isHC ? "light" : "high-contrast");
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b-4 px-4 py-3 flex flex-wrap items-center justify-between gap-4 transition-colors duration-300 ${
        isHC
          ? "bg-black border-yellow-400"
          : "bg-white border-gray-900"
      }`}
      aria-label="Accessibility Settings"
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center justify-center w-10 h-10 border-2 font-bold ${
            isHC ? "border-yellow-400 bg-yellow-400 text-black" : "border-gray-900 bg-gray-900 text-white"
          }`}
          aria-hidden="true"
        >
          K
        </div>
        <span className="font-bold tracking-tight uppercase" aria-hidden="true">
          Kavach
        </span>
      </div>

      <nav
        className="flex items-center gap-2 overflow-x-auto"
        aria-label="Accessibility Toolbar"
      >
        <button
          onClick={cycleTextSize}
          className={`p-3 border-2 focus:outline-none focus:ring-4 transition-all ${
            isHC
              ? "border-yellow-400 hover:bg-gray-800 focus:ring-yellow-400"
              : "border-gray-900 bg-white hover:bg-gray-100 focus:ring-gray-900"
          }`}
          aria-label={`Current text size is ${textSize}. Click to change.`}
          title="Change Text Size"
        >
          <div className="flex items-end gap-1">
            <Type className="w-4 h-4" aria-hidden="true" />
            <Type className="w-6 h-6" aria-hidden="true" />
          </div>
        </button>

        <button
          onClick={toggleTheme}
          className={`p-3 border-2 focus:outline-none focus:ring-4 transition-all ${
            isHC
              ? "border-yellow-400 bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-yellow-400"
              : "border-gray-900 bg-white hover:bg-gray-100 focus:ring-gray-900"
          }`}
          aria-label={
            isHC
              ? "Disable high contrast mode"
              : "Enable high contrast mode"
          }
          title="Toggle High Contrast"
        >
          <SunMoon className="w-6 h-6" aria-hidden="true" />
        </button>

        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`p-3 border-2 focus:outline-none focus:ring-4 transition-all ${
            voiceEnabled
              ? isHC
                ? "border-yellow-400 bg-yellow-400 text-black focus:ring-yellow-400"
                : "border-gray-900 bg-gray-900 text-white focus:ring-gray-900"
              : isHC
              ? "border-yellow-400 hover:bg-gray-800 focus:ring-yellow-400"
              : "border-gray-900 bg-white hover:bg-gray-100 focus:ring-gray-900"
          }`}
          aria-pressed={voiceEnabled}
          aria-label="Toggle voice guidance"
          title="Toggle Voice Guidance"
        >
          {voiceEnabled ? (
            <Volume2 className="w-6 h-6" aria-hidden="true" />
          ) : (
            <VolumeX className="w-6 h-6" aria-hidden="true" />
          )}
        </button>

        <button
          className={`p-3 border-2 flex items-center gap-2 focus:outline-none focus:ring-4 transition-all ${
            isHC
              ? "border-yellow-400 hover:bg-gray-800 focus:ring-yellow-400"
              : "border-gray-900 bg-white hover:bg-gray-100 focus:ring-gray-900"
          }`}
          aria-label="Change language"
          title="Change Language"
        >
          <Globe className="w-6 h-6" aria-hidden="true" />
          <span className="font-bold hidden sm:inline" aria-hidden="true">
            EN
          </span>
        </button>
      </nav>
    </header>
  );
}
