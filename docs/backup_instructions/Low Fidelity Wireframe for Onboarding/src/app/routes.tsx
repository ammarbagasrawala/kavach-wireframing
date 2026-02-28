import { createBrowserRouter } from "react-router";
import { RootLayout } from "./Layout";
import { Splash } from "./pages/Splash";
import { LoginOptions } from "./pages/LoginOptions";
import { NoDigiLocker } from "./pages/NoDigiLocker";
import { DigiLockerRedirect } from "./pages/DigiLockerRedirect";
import { BiometricSetup } from "./pages/BiometricSetup";
import { Dashboard } from "./pages/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Splash },
      { path: "login", Component: LoginOptions },
      { path: "no-digilocker", Component: NoDigiLocker },
      { path: "digilocker-redirect", Component: DigiLockerRedirect },
      { path: "biometric-setup", Component: BiometricSetup },
      { path: "dashboard", Component: Dashboard },
    ],
  },
]);
