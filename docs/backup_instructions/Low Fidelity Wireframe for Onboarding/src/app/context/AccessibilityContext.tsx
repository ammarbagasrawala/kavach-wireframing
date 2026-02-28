import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Theme = "light" | "high-contrast";
type TextSize = "normal" | "large" | "extra-large";

interface AccessibilityContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
  speak: (text: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(
  undefined
);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [textSize, setTextSize] = useState<TextSize>("normal");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [language, setLanguage] = useState("English");

  // Mock text-to-speech for the wireframe
  const speak = (text: string) => {
    if (!voiceEnabled) return;
    console.log(`[TTS Active] Speaking: "${text}"`);
    // In a real app, we'd use window.speechSynthesis
  };

  return (
    <AccessibilityContext.Provider
      value={{
        theme,
        setTheme,
        textSize,
        setTextSize,
        voiceEnabled,
        setVoiceEnabled,
        language,
        setLanguage,
        speak,
      }}
    >
      {/* 
        Apply global classes based on accessibility state to simulate the changes 
        in a wireframe environment.
      */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          theme === "high-contrast"
            ? "bg-black text-yellow-400 border-yellow-400"
            : "bg-gray-50 text-gray-900 border-gray-900"
        } ${
          textSize === "normal"
            ? "text-base"
            : textSize === "large"
            ? "text-xl"
            : "text-2xl"
        }`}
        style={{
          // Use CSS variables so nested components can easily adapt their borders/backgrounds
          // to match the high-contrast wireframe theme.
          "--wf-bg": theme === "high-contrast" ? "#000000" : "#ffffff",
          "--wf-text": theme === "high-contrast" ? "#facc15" : "#111827",
          "--wf-border": theme === "high-contrast" ? "#facc15" : "#111827",
          "--wf-highlight": theme === "high-contrast" ? "#374151" : "#e5e7eb",
        }}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return context;
}
