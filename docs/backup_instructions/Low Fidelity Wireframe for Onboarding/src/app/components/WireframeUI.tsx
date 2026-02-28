import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAccessibility } from "../context/AccessibilityContext";
import { ReactNode } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// A stylised wireframe button that respects the global accessibility theme
export function WfButton({
  children,
  onClick,
  className,
  variant = "primary",
  size = "md",
  icon,
  ariaLabel,
  ...props
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  icon?: ReactNode;
  ariaLabel?: string;
  [x: string]: any;
}) {
  const { theme } = useAccessibility();
  const isHC = theme === "high-contrast";

  const baseStyles =
    "inline-flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-none";
  
  const sizeStyles = {
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-4 min-h-[48px]", // Min-height for touch targets (WCAG)
    lg: "px-8 py-5 min-h-[56px] text-lg",
    xl: "px-10 py-6 min-h-[64px] text-xl w-full",
  };

  const variants = {
    primary: isHC
      ? "bg-yellow-400 text-black border-2 border-yellow-400 hover:bg-yellow-500 focus:ring-yellow-400"
      : "bg-gray-900 text-white border-2 border-gray-900 hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none focus:ring-gray-900",
    secondary: isHC
      ? "bg-transparent text-yellow-400 border-2 border-yellow-400 hover:bg-gray-800 focus:ring-yellow-400"
      : "bg-gray-200 text-gray-900 border-2 border-gray-900 hover:bg-gray-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none focus:ring-gray-900",
    outline: isHC
      ? "bg-transparent text-yellow-400 border-2 border-dashed border-yellow-400 hover:bg-gray-800 focus:ring-yellow-400"
      : "bg-white text-gray-900 border-2 border-dashed border-gray-900 hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none focus:ring-gray-900",
    ghost: isHC
      ? "bg-transparent text-yellow-400 hover:underline focus:ring-yellow-400 border-2 border-transparent"
      : "bg-transparent text-gray-900 hover:underline focus:ring-gray-900 border-2 border-transparent",
  };

  return (
    <button
      onClick={onClick}
      className={cn(baseStyles, sizeStyles[size], variants[variant], className)}
      aria-label={ariaLabel || (typeof children === "string" ? children : undefined)}
      {...props}
    >
      {icon && <span className="mr-3" aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
}

export function WfCard({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
  [x: string]: any;
}) {
  const { theme } = useAccessibility();
  const isHC = theme === "high-contrast";

  return (
    <div
      className={cn(
        "p-6 border-2",
        isHC
          ? "bg-black border-yellow-400"
          : "bg-white border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function WfInput({
  label,
  id,
  className,
  ...props
}: {
  label: string;
  id: string;
  className?: string;
  [x: string]: any;
}) {
  const { theme } = useAccessibility();
  const isHC = theme === "high-contrast";

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <input
        id={id}
        className={cn(
          "w-full px-4 py-4 border-2 min-h-[48px] focus:outline-none focus:ring-4 transition-all",
          isHC
            ? "bg-black border-yellow-400 text-yellow-400 focus:ring-yellow-400 placeholder:text-yellow-600"
            : "bg-white border-gray-900 text-gray-900 focus:ring-gray-900 placeholder:text-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-y-1 focus:translate-x-1 focus:shadow-none"
        )}
        {...props}
      />
    </div>
  );
}
