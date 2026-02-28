import { ReactNode } from "react";
import { Outlet } from "react-router";
import { A11yControls } from "./components/A11yControls";
import { AccessibilityProvider } from "./context/AccessibilityContext";

export function RootLayout() {
  return (
    <AccessibilityProvider>
      <div className="min-h-screen flex flex-col font-sans selection:bg-black selection:text-white dark:selection:bg-yellow-400 dark:selection:text-black">
        <A11yControls />
        
        {/* Main Content Area - Skip Link Target */}
        <main
          id="main-content"
          className="flex-grow flex flex-col max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 outline-none"
          tabIndex={-1}
        >
          <Outlet />
        </main>
        
        {/* Simple Footer for Wireframe context */}
        <footer className="w-full p-4 text-center border-t-2 border-[var(--wf-border)] font-bold opacity-70 mt-auto">
          <p>Mockup built for Cold Start Onboarding Stories (Section 1)</p>
        </footer>
      </div>
    </AccessibilityProvider>
  );
}
