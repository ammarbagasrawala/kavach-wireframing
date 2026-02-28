# LoKey Design System — Cursor Rules

You are coding within the **LoKey Design System** by RBI KAVACH — India’s first truly user-held, tokenised KYC platform, built as a skinned layer on Tailwind CSS + shadcn/ui.

## Stack
- React 18+ / Next.js / TypeScript (strict)
- Tailwind CSS v4 with CSS custom properties
- shadcn/ui (Radix-based) — LoKey skins these, does not replace them
- Icons: `lucide-react` ONLY — never Heroicons, Material, Font Awesome, react-icons
- Font: Plus Jakarta Sans (400, 500, 600, 700) — no other font
- Animations: `lottie-react` for loaders/spinners/motion — NEVER CSS @keyframes

## Import Order
```tsx
// 1. React/Next
// 2. lucide-react icons
// 3. lottie-react + JSON animation data
// 4. LoKey components from @/app/components/
// 5. shadcn/ui from @/components/ui/
// 6. Types
```

## Core Tokens (CSS Variables)
```
--primary-500: #1766D6    --primary-600: #104EB8
--neutral-0: #FFFFFF      --neutral-900: #131A25     --neutral-950: #0A0D13
--background: #F8F8F8     --foreground: #131A25      --card: #FFFFFF
--border: #E4E9F2         --muted: #EDF1F7           --muted-foreground: #484E56
--ring: #1766D6           --destructive: #E23318
--color-success-700: #1A7A1E  --color-warning-600: #CB7100
--color-destructive-600: #C21B11  --color-info-600: #007FAD
--text-base: 14px         --text-sm: 12px
--radius-sm: 4px  --radius-md: 6px  --radius-lg: 8px  --radius-xl: 12px
--elevation-sm: 0px 4px 16px 0px rgba(0,0,0,0.08)
--elevation-md: 0px 8px 32px 0px rgba(0,0,0,0.12)
```

## Critical Rules

### Colors — ALWAYS use CSS variables
```tsx
// ✅ CORRECT
className="bg-[var(--primary-500)] text-[color:var(--neutral-0)]"
className="bg-[color-mix(in_srgb,var(--primary-500)_12%,transparent)]"

// ❌ WRONG — never do this
className="bg-blue-500 text-white"
className="bg-blue-500/10"
```

### Border Radius
- Buttons/inputs/cards/dropdowns: `rounded-[var(--radius-md)]` (6px)
- Modals/table wrappers: `rounded-[var(--radius-lg)]` (8px)
- Chips/badges: `rounded-[20px]` (pill)
- Avatars: `rounded-full`
- **Buttons are NEVER rounded-full or pill-shaped**

### Spacing — 4px grid only
Allowed: 0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 112
Never: 5, 7, 15, 18px

### Shadows
- Cards: no shadow at rest, `hover:shadow-[var(--elevation-sm)]`
- Dropdowns: `shadow-[var(--elevation-sm)]`
- Modals: `shadow-xl` or `shadow-[var(--elevation-md)]`
- Buttons: NEVER

### Typography
- Font: `'Plus Jakarta Sans', sans-serif` — always
- Default: 14px / weight 500
- Chips/labels/breadcrumbs: 12px / weight 500
- Page titles: 20px / weight 600
- Stat values: 32px / weight 700
- Modal titles: 20px / weight 700

### Color-Mix Pattern (for tinted backgrounds)
```css
/* Default */  color-mix(in srgb, var(--primary-500) 8%, transparent)
/* Hover */    color-mix(in srgb, var(--primary-500) 16%, transparent)
/* Disabled */ color-mix(in srgb, var(--primary-500) 4%, transparent) /* bg */
               color-mix(in srgb, var(--primary-500) 40%, transparent) /* text */
```

## Component Quick Reference

### LoKeyButton — `@/app/components/LoKeyButton`
- Props: type (primary|secondary|tertiary|outlined|ghost), size (xxs|xs|s|m|l|xl|xxl), disabled, leftIcon, rightIcon
- Sizes: xxs(24px) xs(28px) s(32px) m(36px) l(40px) xl(44px) xxl(48px)
- Radius: 6px. Font: 500. Icons: w-[16px] h-[16px].

### LoKeyChip — `@/app/components/LoKeyChip`
- Props: style (filled|accent|outline), type (primary|extra|neutral|success|error|info), size (s|m|l|xl)
- Radius: ALWAYS 20px. Font: ALWAYS 12px.

### StatusChip — `@/app/components/StatusChip`
- Props: status (draft|published|in-review|change-requested|in-progress|initiated|completed|etc.)
- Always accent, always size s.

### Other LoKey Components
StatCard, SearchBar, FilterDropdown, ActionButton, PageHeader, TopBar, Layout, TemplateCard — all from `@/app/components/`

### shadcn/ui Primitives — from `@/components/ui/`
Input, Checkbox, Switch, Tabs, Tooltip, Progress, Skeleton, Alert, Dialog, Sheet, Select, Accordion

### Layout Structure
```tsx
<Layout currentPage="...">
  <TopBar productName="..." />
  <PageHeader breadcrumbs={[...]} title="..." entryCount={n} />
  <main className="flex-1 overflow-y-auto p-6">
    {/* Toolbar → Content */}
  </main>
</Layout>
```

### Status Mappings
draft→neutral | published→success | in-review→extra | change-requested→error | in-progress→primary | initiated→info | completed→success

## Accessibility (WCAG AA — required)
- Use `<button>` for actions, `<a>` for navigation. Never `<div onClick>`.
- Focus: `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- Icon-only buttons: `aria-label="..."`
- Forms: `aria-required`, `aria-invalid`, `aria-describedby`
- Modals: focus trap, `aria-modal="true"`, Escape to close
- Color never sole status indicator

## Animations
- Loaders/spinners: `import Lottie from 'lottie-react'` + JSON data. NEVER CSS @keyframes.
- Skeleton pulse: ONLY exception that uses CSS animate-pulse.
- CSS transitions for hover/focus state changes: allowed.
- Always check `prefers-reduced-motion`.

## NEVER
❌ `bg-blue-500`, `text-gray-700`, or any raw Tailwind color
❌ `rounded-full` on buttons
❌ Shadows on buttons
❌ `@keyframes spin/bounce` for loaders
❌ Any font except Plus Jakarta Sans
❌ Any icon library except lucide-react
❌ Spacing off 4px grid
❌ `<div onClick>` for interactive elements
❌ Gradients on UI surfaces
❌ Light/white sidebars
