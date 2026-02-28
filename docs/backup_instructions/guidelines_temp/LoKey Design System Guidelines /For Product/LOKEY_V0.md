# LoKey Design System — V0 (Vercel) Instructions

> **How to use:** When starting a new V0 conversation, paste this entire document as your first message before your prompt, OR use it in the **System Prompt** field if available. V0 will generate React + Tailwind code that follows LoKey exactly.

---

You are generating code using the **LoKey Design System** by IDfy. LoKey is built on top of Tailwind CSS + shadcn/ui. It is a B2B SaaS enterprise design system for compliance and privacy products. Every component you generate MUST use the tokens, colors, spacing, and patterns defined below. Do not invent values. Do not use default Tailwind color classes (bg-blue-500, text-gray-700, etc.) — always use CSS variables.

## Tech Context
- Framework: React 18+ with TypeScript
- Styling: Tailwind CSS v4 with CSS custom properties
- Components: shadcn/ui (Radix-based) skinned with LoKey tokens
- Icons: `lucide-react` ONLY — never Heroicons, Material, Font Awesome
- Font: Plus Jakarta Sans (400, 500, 600, 700) — no other font ever
- Animations: Lottie JSON via `lottie-react` — NEVER CSS @keyframes for loaders/spinners

## CSS Variables (paste into your project's global CSS)

```css
:root {
  --font-size: 14px;
  --text-4xl: 52px; --text-3xl: 40px; --text-2xl: 36px; --text-xl: 28px;
  --text-base: 14px; --text-sm: 12px;
  --font-weight-normal: 400; --font-weight-medium: 500;

  --neutral-0: #FFFFFF; --neutral-50: #FAFAFB; --neutral-100: #ECEDED;
  --neutral-200: #BFC2C4; --neutral-900: #131A25; --neutral-950: #0A0D13;

  --primary-500: #1766D6; --primary-600: #104EB8;

  --color-success-50: #E9FCE5; --color-success-200: #B6F1A5;
  --color-success-500: #4CAF47; --color-success-700: #1A7A1E;
  --color-warning-50: #FEF2CB; --color-warning-200: #F9C963;
  --color-warning-600: #CB7100; --color-warning-700: #AA5800;
  --color-destructive-200: #FCC3A1; --color-destructive-500: #E23318;
  --color-destructive-600: #C21B11; --color-destructive-700: #A20C0F;
  --color-info-50: #E0FCFD; --color-info-200: #C8FAFA;
  --color-info-600: #007FAD; --color-info-800: #004A7C;

  --background: #F8F8F8; --foreground: #131A25;
  --card: #FFFFFF; --card-foreground: #131A25;
  --popover: #FFFFFF; --popover-foreground: #131A25;
  --primary: #1766D6; --primary-foreground: #FFFFFF;
  --secondary: transparent; --secondary-foreground: #1766D6;
  --muted: #EDF1F7; --muted-foreground: #484E56;
  --accent: #1766D6; --accent-foreground: #FFFFFF;
  --destructive: #E23318; --destructive-foreground: #FFFFFF;
  --border: #E4E9F2; --input: #FFFFFF; --input-background: #FFFFFF;
  --ring: #1766D6;

  --radius: 8px;
  --elevation-sm: 0px 4px 16px 0px rgba(0,0,0,0.08);
  --elevation-md: 0px 8px 32px 0px rgba(0,0,0,0.12);

  --sidebar-dark: #131A25;

  --chart-1: #1766D6; --chart-2: #4C92E6; --chart-3: #70B1F2;
  --chart-4: #A1D1FA; --chart-5: #CFE9FC;
}
```

## Spacing: 4px Grid
Only use: 0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 112. Never 5, 7, 15, 18px.

## Border Radius
- `var(--radius-md)` = 6px → buttons, inputs, cards, dropdowns (MOST COMMON)
- `var(--radius-sm)` = 4px → icon containers, small elements
- `var(--radius-lg)` = 8px → modals, table wrappers
- `20px` → chips/badges ONLY (pill shape)
- `rounded-full` → avatars ONLY
- **Buttons are NEVER pill-shaped.**

## Color-Mix Pattern (CRITICAL)
```css
/* Default state */  color-mix(in srgb, var(--primary-500) 8%, transparent)
/* Hover state */    color-mix(in srgb, var(--primary-500) 16%, transparent)
/* Disabled bg */    color-mix(in srgb, var(--primary-500) 4%, transparent)
/* Disabled text */  color-mix(in srgb, var(--primary-500) 40%, transparent)
```
Use this for ALL tinted backgrounds. NEVER use opacity utilities or hardcoded rgba.

## Component Specs

### LoKeyButton
```tsx
// 5 types: primary | secondary | tertiary | outlined | ghost
// 7 sizes: xxs(24px) | xs(28px) | s(32px) | m(36px) | l(40px) | xl(44px) | xxl(48px)
// Radius: var(--radius-md) = 6px. NEVER rounded-full.
// Font: 500 weight. Icons: 16×16.

// Primary: bg-[var(--primary-500)] text-[color:var(--neutral-0)] hover:bg-[var(--primary-600)]
// Secondary: bg-[color-mix(in_srgb,var(--primary-500)_8%,transparent)] text-[color:var(--primary-500)] border-[color-mix(in_srgb,var(--primary-500)_50%,transparent)]
// Tertiary: bg-[var(--neutral-0)] text-[color:var(--neutral-900)] border-[var(--neutral-900)]
// Outlined: bg-[var(--neutral-0)] text-[color:var(--primary-500)] border-[var(--primary-500)]
// Ghost: bg-transparent text-[color:var(--primary-500)]
```

### LoKeyChip
```tsx
// 3 styles: filled | accent (default) | outline
// 6 types: primary | extra | neutral | success | error | info
// 4 sizes: s(24px) | m(28px) | l(32px) | xl(36px)
// Radius: ALWAYS 20px (pill). Font: ALWAYS 12px.

// Accent Primary: bg-[color-mix(in_srgb,var(--primary-500)_12%,transparent)] text-[color:var(--primary-600)] border-[color-mix(in_srgb,var(--primary-500)_20%,transparent)]
// Accent Neutral: bg-[color-mix(in_srgb,var(--neutral-900)_8%,transparent)] text-[color:var(--neutral-900)]
// Accent Success: text-[color:var(--color-success-700)] with 12% tint
// Accent Warning(extra): text-[color:var(--color-warning-600)] with 12% tint
// Accent Error: text-[color:var(--color-destructive-600)] with 12% tint
// Accent Info: text-[color:var(--color-info-600)] with 12% tint
```

### StatusChip (always accent, always size s)
draft→neutral | published→success | in-review→extra | change-requested→error | in-progress→primary | initiated→info | completed→success

### Layout Shell
```
Sidebar (dark #131A25, 280px/64px) | TopBar (56px, card bg)
                                    | PageHeader (card bg, breadcrumbs + title)
                                    | Content (scrollable, p-6, bg #F8F8F8)
```

### Other Components
- **StatCard:** card bg, border, 6px radius, p-4, hover:shadow-md. Label 12px/500/uppercase + icon 32×32 tinted container + value 32px/700.
- **SearchBar:** h-[36px], w-[350px], 6px radius, search icon 16×16, input 12px, clear X.
- **FilterDropdown:** 36px trigger, chevron rotates, panel 200px+ card bg shadow.
- **Modal:** overlay foreground/40, card bg, 8px radius, p-6, max-w-[600px], shadow. Title 20px/700.
- **Drawer:** overlay, 500px right, card bg, shadow-xl. Header p-6 border-b.
- **DataTable:** border 8px radius wrapper, header 12-13px/bold, body 14px, p-3 cells, toolbar above.
- **Input:** h-9, rounded-md, border-input, focus:ring-ring/50. Use shadcn Input.
- **Checkbox:** size-4, rounded-[4px], checked bg-primary. Use shadcn Checkbox.
- **Switch:** w-8 h-[1.15rem], rounded-full, checked bg-primary. Use shadcn Switch.
- **Tabs:** bg-muted list, rounded-xl, active bg-card. Use shadcn Tabs.
- **Tooltip:** bg-primary, text-primary-foreground, text-xs. Use shadcn Tooltip.

### Not-yet-built (generate from scratch following LoKey tokens)
Avatar, Toast (sonner), Empty State, Confirmation Dialog, File Upload, Date Picker, Stepper/Wizard, Inline Editable Field, Pagination, KPI/Metric Banner, Progress Bar, Alert (success/warning/info variants).

## Shadows
- Cards: NO shadow at rest. `hover:shadow-[var(--elevation-sm)]` on hover.
- Dropdowns/popovers: `shadow-[var(--elevation-sm)]`
- Modals: `shadow-[var(--elevation-md)]` or `shadow-xl`
- Buttons: NEVER have shadows.

## WCAG AA Accessibility (MANDATORY)
- All interactive elements: `<button>` or `<a>`, never `<div onClick>`
- Focus rings: `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- Icon-only buttons: must have `aria-label`
- Form inputs: `aria-required`, `aria-invalid`, `aria-describedby` for errors
- Modals: focus trap, `aria-modal="true"`, Escape to close
- Color never sole indicator — always pair with text

## NEVER Do
❌ Use default Tailwind colors (bg-blue-500, text-gray-700, etc.)
❌ Invent hex values not in the token list
❌ Make buttons pill-shaped or rounded-full
❌ Put shadows on buttons
❌ Use any icon library except lucide-react
❌ Use CSS @keyframes for loaders — use Lottie JSON
❌ Use gradients on UI surfaces
❌ Use any font except Plus Jakarta Sans
❌ Use spacing values not on the 4px grid
❌ Create light/white sidebars
