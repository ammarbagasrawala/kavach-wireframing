# LoKey Design System — AI Tool Guidelines

> **Version:** 2.0.0
> **Last Updated:** February 2026
> **Owner:** IDfy Design Systems Team
> **System Name:** LoKey
> **Built On:** Tailwind CSS + shadcn/ui (Radix primitives) — LoKey is a **skinned layer** on top of these foundations
> **Domain Context:** B2B SaaS Enterprise — Compliance, Regulations, and Privacy (DPDP Act, GDPR, RBI guidelines)
> **Purpose:** This document is the single source of truth for any AI-powered code-generation tool (Figma Make, Antigravity, V0, Cursor, Google AI Studio, or any future tool) to produce UI that is visually and structurally consistent with the LoKey Design System. **Do not invent, guess, or hallucinate any value not defined in this file.**

---

## Table of Contents

### Foundations
1. [General Principles](#1-general-principles)
2. [Enterprise B2B SaaS Design Philosophy](#2-enterprise-b2b-saas-design-philosophy)
3. [Technology Stack](#3-technology-stack)
4. [Typography](#4-typography)
5. [Color System](#5-color-system)
6. [Spacing & Sizing Scale](#6-spacing--sizing-scale)
7. [Border Radius (Radius Tokens)](#7-border-radius-radius-tokens)
8. [Elevation & Shadows](#8-elevation--shadows)
9. [Layout Grid System](#9-layout-grid-system)
10. [Iconography](#10-iconography)
11. [Z-Index System](#11-z-index-system)

### Built LoKey Components (with TSX reference implementations)
12. [LoKeyButton](#12-lokeybutton)
13. [LoKeyChip (Badge/Chip)](#13-lokeychip-badgechip)
14. [StatusChip](#14-statuschip)
15. [StatCard](#15-statcard)
16. [SearchBar](#16-searchbar)
17. [FilterDropdown](#17-filterdropdown)
18. [ActionButton](#18-actionbutton)
19. [PageHeader](#19-pageheader)
20. [TopBar](#20-topbar)
21. [Layout (Sidebar + Content)](#21-layout-sidebar--content)
22. [TemplateCard](#22-templatecard)
23. [Modal / Dialog](#23-modal--dialog)
24. [Drawer (Side Panel)](#24-drawer-side-panel)
25. [DataTable](#25-datatable)

### Skinned shadcn/ui Primitives (use with LoKey token overrides)
26. [Form Elements — Input, Textarea, Select, Checkbox, Radio, Switch](#26-form-elements)
27. [Tabs](#27-tabs)
28. [Tooltip](#28-tooltip)
29. [Progress Bar](#29-progress-bar)
30. [Skeleton / Loading Placeholder](#30-skeleton--loading-placeholder)
31. [Alert / Banner](#31-alert--banner)
32. [Accordion](#32-accordion)
33. [Pagination](#33-pagination)

### Components NOT Yet Built (Spec-only — AI tools must follow these specs)
34. [Avatar](#34-avatar)
35. [Toast / Notification](#35-toast--notification)
36. [Empty State](#36-empty-state)
37. [Confirmation Dialog](#37-confirmation-dialog)
38. [File Upload](#38-file-upload)
39. [Date Picker](#39-date-picker)
40. [Stepper / Wizard](#40-stepper--wizard)
41. [Inline Editable Field](#41-inline-editable-field)
42. [Breadcrumb (Standalone)](#42-breadcrumb-standalone)
43. [KPI / Metric Banner](#43-kpi--metric-banner)

### Guidelines & Rules
44. [Semantic Color Usage Rules](#44-semantic-color-usage-rules)
45. [Dark Mode Tokens](#45-dark-mode-tokens)
46. [Animation & Motion Guidelines (Lottie JSON Mandate)](#46-animation--motion-guidelines)
47. [WCAG Accessibility Compliance (AA)](#47-wcag-accessibility-compliance)
48. [Keyboard Navigation Patterns](#48-keyboard-navigation-patterns)
49. [Form Patterns & Validation](#49-form-patterns--validation)
50. [Loading & Error State Patterns](#50-loading--error-state-patterns)
51. [Content & Writing Guidelines (Enterprise SaaS)](#51-content--writing-guidelines)
52. [Internationalization & RTL Readiness](#52-internationalization--rtl-readiness)
53. [Anti-Patterns — Things AI Tools Must NEVER Do](#53-anti-patterns--things-ai-tools-must-never-do)
54. [CSS Variable Quick Reference](#54-css-variable-quick-reference)

---

## 1. General Principles

These rules are **non-negotiable**. Every AI tool output MUST comply:

1. **Use only tokens defined in this file.** Never invent colors, font sizes, spacings, or radii.
2. **Font family is always `'Plus Jakarta Sans', sans-serif`.** No exceptions. Never use Inter, Roboto, system-ui, or any other font.
3. **Base font size is `14px`.** All relative sizing should reference this.
4. **The design language is clean, minimal, professional SaaS.** No gradients on UI surfaces. No heavy drop shadows. No rounded-everything. Precise, intentional spacing.
5. **All interactive elements must have defined states**: default, hover, active, disabled, and focus.
6. **Color mixing pattern:** LoKey uses CSS `color-mix(in srgb, <color> <percentage>, transparent)` for tinted backgrounds instead of opacity or hardcoded colors. AI tools MUST use this pattern.
7. **CSS variables are the source of truth.** Always reference `var(--token-name)` rather than hardcoded hex values in code output.
8. **Component prefix:** Custom LoKey components use the `LoKey` prefix (e.g., `LoKeyButton`, `LoKeyChip`). Standard shadcn/ui primitives (Dialog, Sheet, Table, etc.) are used as-is but styled with LoKey tokens.
9. **Accessibility is mandatory.** Every component must meet WCAG 2.1 AA standards. This is a compliance product — accessibility is not optional.
10. **Animations must be Lottie JSON.** Never use custom CSS animations for loaders, spinners, pulse effects, or any motion graphic. Use Lottie files (`.json`) rendered via `lottie-react` or `lottie-web`. See [Section 46](#46-animation--motion-guidelines).

---

## 2. Enterprise B2B SaaS Design Philosophy

IDfy builds **compliance-first, regulation-first B2B enterprise products** (Privacy Governance, Consent Management, RoPA Management, DPIA Assessments). This context fundamentally shapes every design decision:

### 2.1 Data Density Over Visual Flair
- Enterprise users work with **large datasets** (hundreds of rows, dozens of columns). Prioritize information density and scanability.
- Tables are the primary UI pattern. Optimize for horizontal space, sticky columns, sortable headers, and multi-filter toolbars.
- Cards are secondary — used for overviews, templates, and summaries, not as the primary data display.

### 2.2 Trust & Credibility
- Compliance products demand **visual trust**. The UI must feel stable, predictable, and authoritative.
- No flashy animations, no playful colors, no casual tone. Every pixel communicates professionalism.
- Use conservative color: primarily neutrals and blues. Semantic colors (success, warning, error, info) only for status indicators and alerts.

### 2.3 Workflow-Oriented Design
- Users follow multi-step regulatory workflows (Draft → In Review → Published). The UI must make workflow state obvious at all times.
- Maker-Checker patterns are common. Role-based visibility must be clear (role badges, permission-aware CTAs).
- Version history, audit trails, and timestamps are first-class UI elements.

### 2.4 Regulatory Context Awareness
- Labels and terminology must be precise: "Data Principal", "Processing Activity", "Legitimate Use", "Cross-Border Transfer" — never simplify or rephrase legal/regulatory terms.
- Forms are often long and complex. Use sectioned layouts, collapsible groups, and clear field-level validation.
- Date formats must be consistent: `DD MMM YYYY` (e.g., `18 Feb 2026`) for display, ISO 8601 for data.

### 2.5 Multi-Tenant Enterprise Patterns
- The sidebar shows product/module navigation, not marketing pages.
- TopBar shows organization context (org name, user role).
- Everything is scoped: Business Unit → Product → RoPA → Processing Activity.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 18+ (Next.js compatible) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 with CSS custom properties |
| Component primitives | shadcn/ui (Radix-based) — **LoKey skins these, it does not replace them** |
| Icons | `lucide-react` (ONLY this library) |
| Font | Google Fonts — Plus Jakarta Sans (weights: 400, 500, 600, 700) |
| Animations | Lottie JSON files via `lottie-react` or `lottie-web` — **NEVER custom CSS** |
| Charts | Recharts (styled with LoKey chart tokens) |
| Date handling | `date-fns` (preferred) or `dayjs` |

### IDfy Full Tech Stack (cross-platform guidelines needed)

| Platform | Stack | LoKey Guideline File |
|---|---|---|
| Backend + SSR | Elixir, Phoenix, LiveView | `LOKEY_ELIXIR_PHOENIX_LIVEVIEW.md` |
| Frontend SPA | JavaScript, Node.js, React | `LOKEY_REACT_NODE.md` |
| Styling | Tailwind CSS + Bootstrap (legacy) | `LOKEY_TAILWIND_BOOTSTRAP.md` |

### Import Conventions (React)

```tsx
// Icons — always from lucide-react
import { Plus, Download, ChevronDown, Search, X, Bell } from 'lucide-react';

// LoKey custom components
import { LoKeyButton } from '@/app/components/LoKeyButton';
import { LoKeyChip } from '@/app/components/LoKeyChip';
import { StatusChip } from '@/app/components/StatusChip';
import { StatCard } from '@/app/components/StatCard';
import { SearchBar } from '@/app/components/SearchBar';
import { FilterDropdown } from '@/app/components/FilterDropdown';
import { ActionButton } from '@/app/components/ActionButton';
import { PageHeader } from '@/app/components/PageHeader';
import { TopBar } from '@/app/components/TopBar';
import { Layout } from '@/app/components/Layout';
import { TemplateCard } from '@/app/components/TemplateCard';

// shadcn/ui primitives (skinned with LoKey tokens)
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Animations — ALWAYS Lottie
import Lottie from 'lottie-react';
import loaderAnimation from '@/assets/lottie/loader.json';
```


---

## 4. Typography

### 4.1 Font Family

```css
font-family: 'Plus Jakarta Sans', sans-serif;
```

**This applies to every element:** `html`, `body`, `h1`–`h6`, `p`, `span`, `label`, `button`, `input`, `textarea`, `select`. No element should ever render in a different font.

### 4.2 Font Weights

| Token | Value | Usage |
|---|---|---|
| `--font-weight-normal` | `400` | Body text, input values, placeholder text, descriptions |
| `--font-weight-medium` | `500` | Default for most UI text — buttons, labels, navigation items, paragraphs, spans |
| `600` | (hardcoded) | Semi-bold — Page titles, card titles, dropdown section headers, user names |
| `700` | (hardcoded) | Bold — Stat values, modal titles, filter active values, role badges |

### 4.3 Type Scale — CSS Variable Tokens

| Token | Value | Usage |
|---|---|---|
| `--text-4xl` | `52px` | Display text (Desktop) — marketing hero, not common in app UI |
| `--text-3xl` | `40px` | H1 Display (Desktop) |
| `--text-2xl` | `36px` | H2 (Desktop) |
| `--text-xl` | `28px` | H3 / Large heading (Desktop) |
| `--text-base` | `14px` | **Default body text**. Buttons, table cells, form labels, paragraphs |
| `--text-sm` | `12px` | Small/supporting text. Chip text, breadcrumbs, metadata, captions |

### 4.4 Responsive Typography (from Figma specs)

| Style Name | Desktop (md+) | Mobile (xs) |
|---|---|---|
| Display | 52px / 140% / 0.4% | 38px / 132% / 0.4% |
| Heading H1 | 40px / 132% / 0.4% | 38px / 132% / 0.4% |
| Paragraph Large | 20px / 140% / 0.4% | 18px / 140% / 0.4% |
| Paragraph Medium | 18px / 140% / 0.4% | 16px / 140% / 0.4% |
| Paragraph Small | 16px / 140% / 0.4% | 14px / 140% / 0.4% |
| Paragraph XSmall | 14px / 140% / 0.4% | 12px / 140% / 0.4% |

> Format: `font-size / line-height / letter-spacing`
> All typography uses `letter-spacing: 0.4%` globally.

### 4.5 Heading Element Styles (from theme.css)

```css
h1 { font-size: var(--text-4xl); font-weight: 500; line-height: 1.2; }
h2 { font-size: var(--text-3xl); font-weight: 500; line-height: 1.3; }
h3 { font-size: var(--text-2xl); font-weight: 500; line-height: 1.4; }
h4 { font-size: var(--text-xl);  font-weight: 500; line-height: 1.4; }
p  { font-size: var(--text-base); font-weight: 500; line-height: 1.5; }
```

### 4.6 Common In-App Text Sizes

These are the actual sizes used in LoKey components. Use ONLY these:

| Size | Where Used |
|---|---|
| `32px` / font-weight `700` | StatCard metric values |
| `20px` / font-weight `600` | Page title in PageHeader, modal titles |
| `18px` / font-weight `600` | TemplateCard title |
| `16px` / font-weight `500` | TopBar product name |
| `14px` / font-weight `500` | Default body, button text (M size), table cells, nav items, form labels |
| `13px` / font-weight `500`–`600` | Sidebar sub-items, medium chip/button sizes, dropdown user name |
| `12px` / font-weight `500` | Chip text, breadcrumbs, labels, search input, metadata |
| `11px` / font-weight `600` | Dropdown section headers (uppercase, letter-spacing `0.06em`) |
| `10px` / font-weight `400` | User email in dropdowns, role sub-text, tertiary info |
| `9px`  / font-weight `700` | Inline role badge (MAKER/CHECKER), uppercase |
| `8px`  / font-weight `700` | Smallest role badge in compact dropdown, uppercase |

---

## 5. Color System

### 5.1 Neutral Palette

| Token | Hex | Usage |
|---|---|---|
| `--neutral-0` | `#FFFFFF` | White — card backgrounds, button surfaces, input backgrounds |
| `--neutral-50` | `#FAFAFB` | Subtle off-white — page background alternate |
| `--neutral-100` | `#ECEDED` | Light gray — subtle borders, dividers |
| `--neutral-200` | `#BFC2C4` | Mid gray — disabled text hint |
| `--neutral-900` | `#131A25` | Near-black — primary text, sidebar background, foreground |
| `--neutral-950` | `#0A0D13` | Deepest black — used in sidebar dark mixins |

### 5.2 Primary Palette

| Token | Hex | Usage |
|---|---|---|
| `--primary-500` | `#1766D6` | **THE primary blue.** Buttons, links, active states, focus rings, interactive elements |
| `--primary-600` | `#104EB8` | Hover state for primary buttons. Accent chip text color |

### 5.3 Full Primary Scale (from colors.pdf)

| Step | Hex |
|---|---|
| 20 | `#DBE9FA` |
| 50 | `#DBE9FA` |
| 200 | `#A8C7F4` |
| 300 | `#769EE0` |
| 400 | `#4F76C1` |
| 500 | `#1766D6` (primary) |
| 600 | `#104EB8` |
| 700 | `#10276D` |
| 800 | `#0F2046` |
| 900 | `#09132A` |

### 5.4 Success Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-success-50` | `#E9FCE5` | Light success background |
| `--color-success-200` | `#B6F1A5` | Success light / TemplateCard status border |
| `--color-success-500` | `#4CAF47` | Success icon backgrounds, avatar tint |
| `--color-success-700` | `#1A7A1E` | **Success text** — chip text, icon color for success states |
| `--color-success-900` | `#043A1A` | Deep success |

### 5.5 Warning Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-warning-50` | `#FEF2CB` | Light warning background / TemplateCard draft bg |
| `--color-warning-200` | `#F9C963` | Warning accent / TemplateCard status border |
| `--color-warning-600` | `#CB7100` | **Warning text** — chip text for "extra" / "in-review" states |
| `--color-warning-700` | `#AA5800` | Deep warning / TemplateCard draft text |

### 5.6 Destructive (Error) Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-destructive-200` | `#FCC3A1` | Light error background |
| `--color-destructive-500` | `#E23318` | Default destructive — error buttons, delete actions |
| `--color-destructive-600` | `#C21B11` | **Error chip text** — accent chip error color |
| `--color-destructive-700` | `#A20C0F` | Deep error |
| `--color-destructive-900` | `#6C0417` | Darkest error |

### 5.7 Info Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-info-50` | `#E0FCFD` | Light info background |
| `--color-info-200` | `#C8FAFA` | Info light |
| `--color-info-400` | `#5CD4E6` | Info accent |
| `--color-info-500` | `#33AFCD` | Info mid |
| `--color-info-600` | `#007FAD` | **Info chip text** — accent chip info color |
| `--color-info-800` | `#004A7C` | Deep info |

### 5.8 Semantic / Functional Tokens

| Token | Value (Light) | Usage |
|---|---|---|
| `--background` | `rgba(248, 248, 248, 1)` / `#F8F8F8` | App background |
| `--foreground` | `rgba(19, 26, 37, 1)` / `#131A25` | Default text color |
| `--card` | `rgba(255, 255, 255, 1)` / `#FFFFFF` | Card, modal, container background |
| `--card-foreground` | `rgba(19, 26, 37, 1)` | Text on cards |
| `--popover` | `rgba(255, 255, 255, 1)` | Dropdown, tooltip background |
| `--popover-foreground` | `rgba(19, 26, 37, 1)` | Text on popover |
| `--primary` | `rgba(23, 102, 214, 1)` / `#1766D6` | Primary interactive color |
| `--primary-foreground` | `rgba(255, 255, 255, 1)` | Text on primary surfaces |
| `--secondary` | `rgba(0, 0, 0, 0)` | Secondary button background (transparent) |
| `--secondary-foreground` | `rgba(23, 102, 214, 1)` | Secondary button text (primary blue) |
| `--muted` | `rgba(237, 241, 247, 1)` / `#EDF1F7` | Muted surface — hover states, disabled bg |
| `--muted-foreground` | `rgba(72, 78, 86, 1)` / `#484E56` | Secondary/muted text — descriptions, placeholders, metadata |
| `--accent` | `rgba(23, 102, 214, 1)` | Same as primary |
| `--accent-foreground` | `rgba(255, 255, 255, 1)` | Text on accent surfaces |
| `--destructive` | `rgba(226, 51, 24, 1)` | Destructive action backgrounds |
| `--destructive-foreground` | `rgba(255, 255, 255, 1)` | Text on destructive surfaces |
| `--border` | `rgba(228, 233, 242, 1)` / `#E4E9F2` | Default border color |
| `--input` | `rgba(255, 255, 255, 1)` | Input field background (filled) |
| `--input-background` | `rgba(255, 255, 255, 1)` | Input field default background |
| `--ring` | `rgba(23, 102, 214, 1)` | Focus ring color |

### 5.9 Chart Colors

| Token | Value |
|---|---|
| `--chart-1` | `rgba(23, 102, 214, 1)` — Primary blue |
| `--chart-2` | `rgba(76, 146, 230, 1)` |
| `--chart-3` | `rgba(112, 177, 242, 1)` |
| `--chart-4` | `rgba(161, 209, 250, 1)` |
| `--chart-5` | `rgba(207, 234, 252, 1)` |

### 5.10 Sidebar Dark Theme Tokens

| Token | Value | Usage |
|---|---|---|
| `--sidebar-dark` | `var(--neutral-900)` / `#131A25` | Sidebar background |
| `--sidebar-dark-border` | `color-mix(in srgb, var(--neutral-0) 12%, var(--neutral-950))` | Sidebar divider borders |
| `--sidebar-dark-text` | `var(--neutral-0)` / `#FFFFFF` | Sidebar primary text |
| `--sidebar-dark-text-muted` | `color-mix(in srgb, var(--neutral-0) 70%, transparent)` | Sidebar secondary text |
| `--sidebar-dark-hover` | `color-mix(in srgb, var(--primary-500) 12%, transparent)` | Sidebar item hover |
| `--sidebar-dark-active` | `color-mix(in srgb, var(--neutral-0) 15%, transparent)` | Sidebar item active/selected |

---

## 6. Spacing & Sizing Scale

LoKey uses a **4px base unit** spacing system. All spacing, padding, margin, and gap values must be multiples of 4.

### Allowed Spacing Values

`0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 112`

### Common Patterns

| Context | Value |
|---|---|
| Inline icon-to-text gap | `4px` (`gap-1`) or `6px` (`gap-1.5`) or `8px` (`gap-2`) |
| Button horizontal padding | `12px`–`24px` (scales with button size) |
| Card internal padding | `16px` (`p-4`) or `12px` (`p-3`) for compact cards |
| Page-level horizontal padding | `24px` (`px-6`) |
| Section vertical spacing | `8px`–`16px` |
| Modal / Drawer padding | `24px` (`p-6`) |
| Between breadcrumb items | `4px` (`gap-1`) |
| Between title and entry count | `12px` (`gap-3`) |
| Table cell padding | `12px` (`p-3`) |
| Toolbar padding | `px-4 py-3` |
| Dropdown item padding | `px-3 py-2` or `px-4 py-2.5` |

---

## 7. Border Radius (Radius Tokens)

| Token | Computed Value | Usage |
|---|---|---|
| `--radius` | `8px` | Base radius value |
| `--radius-sm` | `4px` (`--radius` − 4px) | Small elements: icon containers, stat card icons, sidebar sub-item active, icon action buttons (28×28), checkbox |
| `--radius-md` | `6px` (`--radius` − 2px) | **Most common.** Buttons, inputs, search bars, filter dropdowns, dropdown menus, cards, TemplateCards |
| `--radius-lg` | `8px` (= `--radius`) | Modals, table wrappers, larger containers, TopBar elements |
| `--radius-xl` | `12px` (`--radius` + 4px) | Large cards, hero sections, TabsList |
| `20px` (hardcoded) | `20px` | **Chips/Badges only** — fully rounded pill shape |
| `full` / `9999px` | Full circle | Avatars, switch tracks, progress bars, circular icon buttons |

### Critical Rules

- **Buttons** → `var(--radius-md)` (6px). **NEVER** fully rounded.
- **Chips/Badges** → `20px` (pill). **ALWAYS** fully rounded.
- **Inputs / Search bars** → `var(--radius-md)` (6px) or `rounded-md` (shadcn default).
- **Dropdowns / Popovers** → `var(--radius-md)` (6px).
- **Modals** → `var(--radius-lg)` (8px).
- **Avatars** → `rounded-full`.
- **Checkbox** → `4px` (rounded-[4px]).
- **Switch track** → `rounded-full`.

---

## 8. Elevation & Shadows

| Token | Value | Usage |
|---|---|---|
| `--elevation-sm` | `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` | Cards on hover, dropdown menus, popovers, tooltips |
| `--elevation-md` | `0px 8px 32px 0px rgba(0, 0, 0, 0.12)` | Modals, dialogs |
| `--elevation-sticky` | `-8px 0 16px -4px color-mix(in srgb, var(--neutral-950) 15%, transparent)` | Sticky table columns, pinned side panels |

### Rules

- Cards have **no shadow by default**; shadow appears on hover via `hover:shadow-md` or `hover:shadow-lg`.
- Dropdown menus and popovers use `shadow-[var(--elevation-sm)]`.
- Modals and drawers use `shadow-xl` (Tailwind) or `shadow-[var(--elevation-md)]`.
- **Never** use shadow tokens not defined above. No custom shadows.

---

## 9. Layout Grid System

### 9.1 Breakpoints

| Name | Range | Columns | Margin | Gutter |
|---|---|---|---|---|
| Small (Mobile) | 320px–599px | 4 columns (Auto) | 24px | 24px |
| Medium (Tablet) | 600px–1279px | 8 columns (Auto) | 24px | 24px |
| Large (Desktop) | 1280px+ | 12 columns (Auto) | 24px | 24px |

### 9.2 With Side Navigation (Desktop — 1440×900)

| State | Columns | Column Width | Margin | Gutter | Side Nav Width |
|---|---|---|---|---|---|
| Collapsed | 12 | 84px | 44px | 24px | 80px |
| Expanded | 12 | 68px | 32px | 24px | 296px |

### 9.3 Navigation Dimensions

| Element | Height/Width |
|---|---|
| Top Navigation Bar (TopBar) | `56px` height |
| Side Navigation — Expanded | `280px` wide |
| Side Navigation — Collapsed | `64px` wide |
| Logo area | `56px` height |

### 9.4 App Shell Structure

```
┌──────────────────────────────────────────┐
│ Sidebar (dark)  │  TopBar (56px)         │
│ 280px / 64px    │────────────────────────│
│                 │  PageHeader            │
│                 │────────────────────────│
│                 │  Main Content          │
│                 │  (scrollable)          │
└──────────────────────────────────────────┘
```

---

## 10. Iconography

### Library

**ONLY `lucide-react`**. Never use Heroicons, Feather, Material Icons, Font Awesome, or any other icon library.

### Standard Sizes

| Context | Size | Tailwind |
|---|---|---|
| Inside buttons / chips | 16×16 | `w-[16px] h-[16px]` |
| Sidebar nav items | 18×18 | `w-[18px] h-[18px]` |
| TopBar notification bell | 18×18 | `w-[18px] h-[18px]` |
| Breadcrumb chevrons | 14×14 | `w-[14px] h-[14px]` |
| Dropdown chevrons | 14–16 | `w-[14px] h-[14px]` or `w-[16px] h-[16px]` |
| Stat card icon containers | 32×32 bg | Icon 16×16 inside |
| Icon-only action buttons (TemplateCard footer) | 28×28 bg | Icon 14×14 inside |
| Small utility icons (lock, info) | 12×12 | `w-[12px] h-[12px]` |
| Clear/dismiss (X) | 12×12 | `w-[12px] h-[12px]` |
| Checkbox indicator | 14×14 | `size-3.5` |

### Rules

- Icons inherit text color from parent via `currentColor` unless explicitly colored.
- Never apply `stroke-width` overrides. Use lucide defaults.
- Always use `flex-shrink-0` on icons inside flex containers.
- Icon-only buttons MUST have `aria-label` or `title` attribute.

---

## 11. Z-Index System

| Layer | Z-Index | Usage |
|---|---|---|
| Base content | `0` (auto) | Normal page flow |
| Sticky table headers/columns | `10` | Table sticky elements |
| Sidebar expanded overlay (mobile) | `40` | Mobile sidebar |
| Dropdown menus / Popovers | `50` | All floating UI |
| Modal backdrop | `50` | Modal overlay |
| Modal content | `50` | Modal container |
| Drawer | `50` | Side panel |
| Tooltip | `50` | Tooltip content |
| Sidebar collapsed tooltips | `100` | Tooltip on collapsed nav items |
| Toast notifications | `[9999]` | Sonner toasts (always on top) |

---

## 12. LoKeyButton

The primary button component for all interactive actions.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `'primary' \| 'secondary' \| 'tertiary' \| 'outlined' \| 'ghost'` | `'primary'` | Visual variant |
| `size` | `'xxs' \| 'xs' \| 's' \| 'm' \| 'l' \| 'xl' \| 'xxl'` | `'m'` | Height and text size |
| `disabled` | `boolean` | `false` | Disabled state |
| `leftIcon` | `React.ReactNode` | — | Icon before text |
| `rightIcon` | `React.ReactNode` | — | Icon after text |
| `children` | `React.ReactNode` | — | Button label |
| `onClick` | `() => void` | — | Click handler |

### Size Specifications

| Size | Height | Horiz. Padding | Font Size | Gap |
|---|---|---|---|---|
| `xxs` | 24px | 12px | 12px (`--text-sm`) | 4px |
| `xs` | 28px | 12px | 13px | 6px |
| `s` | 32px | 16px | 13px | 6px |
| `m` | 36px | 16px | 14px (`--text-base`) | 8px |
| `l` | 40px | 20px | 14px | 8px |
| `xl` | 44px | 20px | 15px | 8px |
| `xxl` | 48px | 24px | 15px | 8px |

### Type Variants — All States

#### Primary

| State | Background | Text | Border |
|---|---|---|---|
| Default | `var(--primary-500)` | `var(--neutral-0)` | none |
| Hover | `var(--primary-600)` | white | none |
| Active | `var(--primary-500)` opacity 90% | white | none |
| Disabled | `color-mix(in srgb, var(--primary-500) 32%, transparent)` | `color-mix(in srgb, var(--neutral-0) 60%, transparent)` | none |

#### Secondary

| State | Background | Text | Border |
|---|---|---|---|
| Default | `color-mix(… var(--primary-500) 8%…)` | `var(--primary-500)` | `color-mix(… var(--primary-500) 50%…)` |
| Hover | `color-mix(… 20%…)` | `var(--primary-500)` | `color-mix(… 60%…)` |
| Active | `color-mix(… 12%…)` | `var(--primary-500)` | same as default |
| Disabled | `color-mix(… 4%…)` | `color-mix(… 40%…)` | `color-mix(… 20%…)` |

#### Tertiary

| State | Background | Text | Border |
|---|---|---|---|
| Default | `var(--neutral-0)` | `var(--neutral-900)` | `var(--neutral-900)` |
| Hover | `color-mix(… var(--neutral-900) 4%…)` | `#131A25` | `#131A25` |
| Active | `color-mix(… 8%…)` | `#131A25` | `#131A25` |
| Disabled | transparent | `color-mix(… 40%…)` | `color-mix(… 20%…)` |

#### Outlined

| State | Background | Text | Border |
|---|---|---|---|
| Default | `var(--neutral-0)` | `var(--primary-500)` | `var(--primary-500)` |
| Hover | `color-mix(… var(--primary-500) 4%…)` | same | same |
| Active | `color-mix(… 8%…)` | same | same |
| Disabled | transparent | `color-mix(… 40%…)` | `color-mix(… 20%…)` |

#### Ghost

| State | Background | Text | Border |
|---|---|---|---|
| Default | transparent | `var(--primary-500)` | none |
| Hover | `color-mix(… var(--primary-500) 4%…)` | same | none |
| Active | `color-mix(… 8%…)` | same | none |
| Disabled | transparent | `color-mix(… 40%…)` | none |

### Structural Rules

- Border radius: `var(--radius-md)` (6px). **Never** pill-shaped.
- Font weight: `var(--font-weight-medium)` (500).
- Layout: `inline-flex items-center justify-center`.
- Text: `whitespace-nowrap`.
- Transition: `transition-all`.
- Disabled: `cursor-not-allowed`.

---

## 13. LoKeyChip (Badge/Chip)

Used for status indicators, tags, categories. Always pill-shaped.

### Props

| Prop | Type | Default |
|---|---|---|
| `style` | `'filled' \| 'accent' \| 'outline'` | `'accent'` |
| `type` | `'primary' \| 'extra' \| 'neutral' \| 'success' \| 'error' \| 'info'` | `'primary'` |
| `size` | `'s' \| 'm' \| 'l' \| 'xl'` | `'m'` |
| `disabled` | `boolean` | `false` |
| `leftIcon` / `rightIcon` | `React.ReactNode` | — |

### Size Specifications

| Size | Height | Horiz. Padding | Font Size | Gap |
|---|---|---|---|---|
| `s` | 24px | 10px (`px-2.5`) | 12px (`--text-sm`) | 4px |
| `m` | 28px | 12px (`px-3`) | 12px (`--text-sm`) | 6px |
| `l` | 32px | 12px (`px-3`) | 13px | 6px |
| `xl` | 36px | 16px (`px-4`) | 13px | 8px |

### Structural Rules

- Border radius: **`20px`** (pill). Hardcoded, never changes.
- Font weight: `var(--font-weight-medium)` (500).
- Inner text always `12px` (`--text-sm`) via `!text-[length:var(--text-sm)]`.

### Accent Style (Default) — Color Matrix

| Type | Background | Text | Border |
|---|---|---|---|
| `primary` | `color-mix(… var(--primary-500) 12%…)` | `var(--primary-600)` | `color-mix(… var(--primary-500) 20%…)` |
| `neutral` | `color-mix(… var(--neutral-900) 8%…)` | `var(--neutral-900)` | `color-mix(… var(--neutral-900) 12%…)` |
| `extra` | `color-mix(… var(--color-warning-600) 12%…)` | `var(--color-warning-600)` | `color-mix(… var(--color-warning-600) 20%…)` |
| `success` | `color-mix(… var(--color-success-700) 12%…)` | `var(--color-success-700)` | `color-mix(… var(--color-success-700) 20%…)` |
| `error` | `color-mix(… var(--color-destructive-600) 12%…)` | `var(--color-destructive-600)` | `color-mix(… var(--color-destructive-600) 20%…)` |
| `info` | `color-mix(… var(--color-info-600) 12%…)` | `var(--color-info-600)` | `color-mix(… var(--color-info-600) 20%…)` |

### State Pattern (consistent for all accent types)

- **Hover:** Background 12% → 20%
- **Active:** Background → 16%
- **Disabled:** Background 6%, border 12%, text 40%

---

## 14. StatusChip

Wrapper around `LoKeyChip`. Always **accent style, size `s` (24px)**.

| Status Key | Display Label | Chip Type |
|---|---|---|
| `draft` | Draft | `neutral` |
| `published` | Published | `success` |
| `in-review` | In Review | `extra` |
| `change-requested` | Change Requested | `error` |
| `not-required` | Not Required | `neutral` |
| `not-initiated` | Not Initiated | `extra` |
| `initiated` | Initiated | `info` |
| `in-progress` | In Progress | `primary` |
| `under-review` | Under Review | `extra` |
| `completed` | Completed | `success` |

---

## 15. StatCard

| Property | Value |
|---|---|
| Background | `var(--card)` |
| Border | `1px solid var(--border)` |
| Border radius | `var(--radius-md)` |
| Padding | `16px` |
| Hover | `hover:shadow-md` |
| Label | 12px, 500, muted-foreground, uppercase, tracking-wide |
| Value | 32px, 700, foreground, line-height 1.2 |
| Icon container | 32×32, `--radius-sm`, tinted 8% bg |

---

## 16. SearchBar

| Property | Value |
|---|---|
| Height | `36px` |
| Default width | `350px` |
| Border | `1px solid color-mix(in srgb, var(--neutral-900) 20%, transparent)` |
| Background | `var(--neutral-0)` |
| Border radius | `var(--radius-md)` |
| Search icon | 16×16, `color-mix(in srgb, var(--neutral-900) 50%, transparent)` |
| Input text | 12px, 500 |
| Placeholder | `color-mix(in srgb, var(--neutral-900) 50%, transparent)` |
| Clear X | 12×12 icon, 16×16 hit area, only shown when value present |

---

## 17. FilterDropdown

| Property | Value |
|---|---|
| Trigger | 36px height, px-3, transparent bg, `hover:bg-muted` |
| Label | 12px, 500, muted-foreground |
| Active value | 12px, 700, foreground |
| Chevron | 16×16, rotates 180° |
| Panel | min-w-200px, card bg, border, radius-md, elevation-sm, 4px offset |
| Item | px-3 py-2, 12px, `hover:bg-muted` |

---

## 18. ActionButton

Simplified button for page-level actions.

| Property | Value |
|---|---|
| Height | `36px` |
| Padding | 16px horizontal |
| Radius | `var(--radius-md)` |
| Icon | 16×16 |
| Gap | 8px |
| Font | 14px, 500 |
| Variants | Primary and Secondary (same colors as LoKeyButton) |
| Modes | `modal`, `drawer`, `navigate` |

---

## 19. PageHeader

| Property | Value |
|---|---|
| Background | card |
| Border | border-b border-border |
| Padding | px-6 py-3 |
| Breadcrumb | 12px, 500, first item = primary-500, others = muted-foreground |
| Separator | ChevronRight 14×14 |
| Title | 20px, 600 |
| Entry count | 14px, muted-foreground, in parentheses |

---

## 20. TopBar

| Property | Value |
|---|---|
| Height | 56px |
| Background | card |
| Border | border-b border-border |
| Padding | px-6 |
| Product name | 16px, 500 |
| Notification button | 36×36, radius 8px, border |
| Profile trigger | 36px height, px-3, radius 8px, border |
| Avatar | 24×24 circle, tinted bg |
| Role badge | 9px, 700, uppercase, 16px height, 3px radius |

### Role Badge Colors

| Role | Bg | Text | Border |
|---|---|---|---|
| Maker | primary-500 10% | primary-500 | primary-500 25% |
| Checker | success-500 10% | success-700 | success-500 25% |

---

## 21. Layout (Sidebar + Content)

### Sidebar

| Property | Expanded | Collapsed |
|---|---|---|
| Width | 280px | 64px |
| Background | `--sidebar-dark` (#131A25) | same |
| Logo area | 56px height | same |
| Nav text | 14px white | hidden |
| Sub-item | 13px, px-4 py-1.5 | hidden |
| Active sub-item bg | `--sidebar-dark-active` | — |
| Tooltip (collapsed) | left-72px, 13px, radius-sm, scale animation |
| Transition | `duration-300` | same |

---

## 22. TemplateCard

Content card for template listings.

| Property | Value |
|---|---|
| Background | `var(--card)` |
| Border | `1px solid var(--border)` |
| Border radius | `var(--radius-md)` |
| Padding | `12px` (p-3) |
| Hover | `hover:shadow-lg` |
| Cursor | `pointer` |
| Icon container | 32×32, primary-500 8% bg, radius-sm |
| Title | 18px, 600, line-clamp-1 |
| Description | 14px, muted-foreground, line-clamp-4, leading 140% |
| Created-by avatar | 20×20 circle, primary tint |
| Footer | border-t, pt-2, flex between version/fields and icon actions |
| Icon action buttons | 28×28, radius-sm, hover primary 8% bg, icon 14×14 |

---

## 23. Modal / Dialog

| Property | Value |
|---|---|
| Backdrop | `var(--foreground)/40` (40% opacity) |
| Container | card bg, radius-lg, p-6, max-w-600px, elevation-sm |
| Title | 20px, 700, foreground |
| Close | 20×20 X, muted → foreground on hover |
| Z-index | 50 |

---

## 24. Drawer (Side Panel)

| Property | Value |
|---|---|
| Backdrop | `var(--foreground)/40` |
| Width | 500px |
| Background | card |
| Shadow | shadow-xl |
| Header | p-6, border-b |
| Content | p-6, overflow-y-auto, flex-1 |
| Position | fixed right |
| Z-index | 50 |

---

## 25. DataTable

| Property | Value |
|---|---|
| Wrapper | border, radius-lg, card bg, overflow-hidden |
| Header cell | 12–13px, 600–700, p-3 |
| Body cell | 14px, 400–500, p-3 |
| Row border | border-b border-border |
| Row hover | bg-muted |
| Toolbar | px-4 py-3, border-b |

---

## 26. Form Elements

LoKey skins shadcn/ui form primitives. These are NOT custom components — they are the standard shadcn/ui exports styled via LoKey CSS variables.

### 26.1 Input

| Property | Value |
|---|---|
| Height | `36px` (h-9) |
| Border | `1px solid var(--input)` i.e. `border-input` |
| Background | `var(--input-background)` |
| Border radius | `rounded-md` (6px) |
| Padding | `px-3 py-1` |
| Font | 14px base (md: text-sm), font-weight 400 |
| Placeholder | `text-muted-foreground` |
| Focus | `border-ring`, `ring-ring/50`, `ring-[3px]` |
| Error | `border-destructive`, `ring-destructive/20` (via `aria-invalid`) |
| Disabled | `opacity-50`, `cursor-not-allowed` |
| Selection | `bg-primary`, `text-primary-foreground` |

### 26.2 Textarea

Same styling as Input but multi-line. Minimum height `60px`. Resize vertical only.

### 26.3 Select

Uses Radix Select primitive. Trigger has same dimensions as Input (36px height). Dropdown panel uses `--popover` bg, `--border`, `--radius-md`, `--elevation-sm`.

### 26.4 Checkbox

| Property | Value |
|---|---|
| Size | `16×16` (size-4) |
| Border radius | `4px` (rounded-[4px]) |
| Unchecked | `border`, `bg-input-background` |
| Checked | `bg-primary`, `text-primary-foreground`, `border-primary` |
| Focus | `border-ring`, `ring-ring/50`, `ring-[3px]` |
| Error | `border-destructive`, `ring-destructive/20` |
| Disabled | `opacity-50`, `cursor-not-allowed` |
| Check icon | lucide `CheckIcon`, `size-3.5` (14px) |

### 26.5 Radio Group

Same visual language as Checkbox but circular (`rounded-full`). Dot indicator when selected.

### 26.6 Switch

| Property | Value |
|---|---|
| Track size | `32×18px` (w-8, h-[1.15rem]) |
| Track shape | `rounded-full` |
| Unchecked track | `bg-switch-background` (muted) |
| Checked track | `bg-primary` |
| Thumb | `16×16` circle, `bg-card` |
| Transition | `transition-all` on track, `transition-transform` on thumb |
| Disabled | `opacity-50`, `cursor-not-allowed` |

### 26.7 Label

| Property | Value |
|---|---|
| Font | 12px (`--text-sm`), 500 |
| Color | foreground |
| Disabled | `opacity-50` (when peer is disabled) |

### 26.8 Form Field Pattern

Standard form field layout used across LoKey:

```
┌─────────────────────────────┐
│ Label (12px, 500)           │
│ [Input / Select / Textarea] │
│ Helper text (12px, muted)   │  ← optional
│ Error text (12px, error)    │  ← conditional
└─────────────────────────────┘
```

- Label-to-input gap: `6px` (gap-1.5) or `8px` (gap-2)
- Input-to-helper gap: `4px`
- Error text color: `var(--color-destructive-500)` / `#E23318`
- Helper text color: `var(--muted-foreground)`

---

## 27. Tabs

| Property | Value |
|---|---|
| List bg | `bg-muted` |
| List height | `36px` (h-9) |
| List radius | `rounded-xl` (12px) |
| List padding | `3px` |
| Trigger (inactive) | `text-foreground` (light), `text-muted-foreground` (dark) |
| Trigger (active) | `bg-card`, `text-foreground` |
| Trigger radius | `rounded-xl` |
| Trigger font | `text-sm` (12px), `font-medium` |
| Trigger gap | `gap-1.5` |
| Tab icon size | `size-4` (16px) |

---

## 28. Tooltip

| Property | Value |
|---|---|
| Background | `bg-primary` |
| Text | `text-primary-foreground` |
| Border radius | `rounded-md` |
| Padding | `px-3 py-1.5` |
| Font | `text-xs` (12px) |
| Arrow | `size-2.5`, same bg as tooltip |
| Z-index | 50 |
| Animation | `fade-in-0 zoom-in-95` with directional slides |
| Delay | `0ms` (instant via TooltipProvider) |

---

## 29. Progress Bar

| Property | Value |
|---|---|
| Track height | `8px` (h-2) |
| Track bg | `bg-primary/20` |
| Track radius | `rounded-full` |
| Indicator bg | `bg-primary` |
| Animation | `transition-all` on indicator width |

---

## 30. Skeleton / Loading Placeholder

| Property | Value |
|---|---|
| Background | `bg-accent` (primary blue) |
| Animation | `animate-pulse` (Tailwind built-in — **exception** to Lottie rule, see note) |
| Border radius | `rounded-md` |

> **Note on Lottie exception:** Skeleton pulse is the ONE animation that uses CSS `animate-pulse` because it's a structural placeholder, not a visual animation. All other loaders, spinners, and motion graphics MUST use Lottie JSON.

---

## 31. Alert / Banner

| Property | Value |
|---|---|
| Layout | CSS Grid with icon column + content column |
| Border | `1px solid var(--border)` |
| Border radius | `rounded-lg` (8px) |
| Padding | `px-4 py-3` |
| Default variant | `bg-card`, `text-card-foreground` |
| Destructive variant | `bg-card`, `text-destructive` |
| Title font | `font-medium`, `tracking-tight` |
| Description | `text-sm`, `text-muted-foreground` |
| Icon size | `size-4` (16px) |

### Additional LoKey Alert Variants (not yet in shadcn — AI tools should create these)

| Variant | Background | Border | Icon Color | Text Color |
|---|---|---|---|---|
| `success` | `var(--color-success-50)` | `var(--color-success-200)` | `var(--color-success-700)` | `var(--color-success-700)` |
| `warning` | `var(--color-warning-50)` | `var(--color-warning-200)` | `var(--color-warning-600)` | `var(--color-warning-700)` |
| `info` | `var(--color-info-50)` | `var(--color-info-200)` | `var(--color-info-600)` | `var(--color-info-800)` |

---

## 32. Accordion

Uses Radix Accordion primitive. Styling:

| Property | Value |
|---|---|
| Item border | `border-b border-border` |
| Trigger font | 14px, font-medium |
| Trigger padding | `py-4` |
| Chevron | 16×16, `transition-transform duration-200`, rotates 180° |
| Content padding | `pb-4 pt-0` |
| Animation | `animate-accordion-down` / `animate-accordion-up` |

---

## 33. Pagination

| Property | Value |
|---|---|
| Button size | 36×36 (same as input height) |
| Button radius | `var(--radius-md)` |
| Active page | `bg-primary`, `text-primary-foreground` |
| Inactive | `bg-transparent`, `text-foreground`, `hover:bg-muted` |
| Disabled | `opacity-50`, `cursor-not-allowed` |
| Font | 14px, 500 |
| Gap | 4px between buttons |
| Ellipsis | `...` as text, no button |

---

## 34. Avatar

Not yet built as a LoKey component. AI tools must follow these specs:

| Property | Value |
|---|---|
| Sizes | XS: 20×20, S: 24×24, M: 32×32, L: 40×40, XL: 48×48 |
| Shape | `rounded-full` always |
| Fallback | Initials on tinted background |
| Initials font | XS: 8px/700, S: 10px/700, M: 12px/700, L: 14px/700, XL: 16px/700 |
| Image | `object-cover`, `rounded-full` |
| Border | None by default. Group: `ring-2 ring-card` for overlapping avatars |
| Tint pattern (no image) | `color-mix(in srgb, var(--primary-500) 12%, transparent)` bg, `var(--primary-500)` text |

### Avatar Group (stacked)

- Overlap: `-ml-2` for each avatar after the first
- Z-index: Each avatar gets decreasing z-index
- Overflow indicator: `+N` in neutral chip style, same size as avatars
- Max visible: 4 avatars + overflow count

---

## 35. Toast / Notification

Use `sonner` (already in project as `sonner.tsx`). LoKey styling:

| Property | Value |
|---|---|
| Position | Bottom-right |
| Width | 360px |
| Background | `var(--card)` |
| Border | `1px solid var(--border)` |
| Border radius | `var(--radius-lg)` (8px) |
| Shadow | `var(--elevation-md)` |
| Padding | `16px` |
| Title | 14px, 600, foreground |
| Description | 12px, 400, muted-foreground |
| Close button | 12×12 X icon, top-right |
| Duration | 5000ms default |
| Z-index | 9999 |

### Toast Variants

| Variant | Left accent / Icon color |
|---|---|
| `success` | `var(--color-success-500)` — CheckCircle icon |
| `error` | `var(--color-destructive-500)` — AlertCircle icon |
| `warning` | `var(--color-warning-600)` — AlertTriangle icon |
| `info` | `var(--color-info-600)` — Info icon |

### Toast with Action

Action button inside toast uses `LoKeyButton` ghost type, size `xs`.

---

## 36. Empty State

Used when a list, table, or content area has no data.

| Property | Value |
|---|---|
| Container | Centered, max-w-400px, py-16 |
| Illustration | Lottie JSON animation (64×64 or 80×80), **not an icon** |
| Heading | 16px, 600, foreground |
| Description | 14px, 400, muted-foreground, text-center, max-w-300px |
| CTA button | `LoKeyButton` primary, size `m`, centered |
| Spacing | illustration → heading: 16px, heading → description: 8px, description → CTA: 24px |

### Example copy patterns:

| Context | Heading | Description |
|---|---|---|
| No RoPA entries | "No processing activities yet" | "Create your first RoPA entry to start documenting processing activities." |
| No search results | "No results found" | "Try adjusting your search or filters to find what you're looking for." |
| No templates | "No templates available" | "Create a template to standardize your RoPA data collection." |

---

## 37. Confirmation Dialog

Used before destructive or irreversible actions.

| Property | Value |
|---|---|
| Extends | Modal / Dialog (Section 23) |
| Max width | 440px |
| Icon | 48×48 circle, destructive-500 at 8% bg, AlertTriangle 24×24 in destructive-500 |
| Title | 18px, 600, foreground |
| Description | 14px, 400, muted-foreground |
| Actions | Right-aligned, gap-3 |
| Cancel | `LoKeyButton` tertiary, size `m` |
| Confirm (destructive) | `LoKeyButton` with bg `var(--color-destructive-500)`, text white, hover `var(--color-destructive-600)` |
| Confirm (non-destructive) | `LoKeyButton` primary, size `m` |

### Destructive Button Spec (not a standard LoKeyButton type — construct manually)

```tsx
// Destructive action button — only for confirmation dialogs
className="bg-[var(--color-destructive-500)] text-[color:var(--neutral-0)] hover:bg-[var(--color-destructive-600)] active:bg-[var(--color-destructive-700)]"
```

---

## 38. File Upload

| Property | Value |
|---|---|
| Drop zone | Dashed border (`2px dashed var(--border)`), radius-lg, p-8, text-center |
| Drop zone hover/drag-over | Border `var(--primary-500)`, bg `color-mix(in srgb, var(--primary-500) 4%, transparent)` |
| Icon | Upload cloud, 32×32, muted-foreground |
| Label | 14px, 500, foreground. "Click to upload" in primary-500 |
| Subtext | 12px, muted-foreground. File type and size limits |
| File list item | Border, radius-md, p-3, flex between filename+size and remove button |
| Progress | LoKey Progress bar inside file list item during upload |

---

## 39. Date Picker

Uses Radix Popover + custom calendar (already in project as `calendar.tsx`).

| Property | Value |
|---|---|
| Trigger | Same as Input (36px, border, radius-md) with Calendar icon 16×16 right-aligned |
| Display format | `DD MMM YYYY` (e.g., "18 Feb 2026") |
| Calendar panel | card bg, border, radius-lg, elevation-sm, p-3 |
| Day cell | 32×32, text-center, 14px |
| Today | `font-bold`, no special bg |
| Selected | `bg-primary`, `text-primary-foreground`, `rounded-md` |
| Hover | `bg-muted`, `rounded-md` |
| Outside month | `text-muted-foreground`, `opacity-50` |
| Navigation arrows | 16×16 ChevronLeft/ChevronRight |

---

## 40. Stepper / Wizard

For multi-step forms (e.g., DPIA Assessment creation, RoPA wizard).

| Property | Value |
|---|---|
| Step indicator | 28×28 circle |
| Completed step | `bg-primary`, white checkmark icon (12×12) |
| Current step | `border-2 border-primary`, `bg-primary` at 12%, step number in primary-500 |
| Upcoming step | `border border-border`, `bg-card`, step number in muted-foreground |
| Connector line | `2px solid var(--border)` between steps, completed = `var(--primary-500)` |
| Step label | 12px, 500, below indicator |
| Current label | `text-primary-500`, `font-weight: 600` |
| Layout | Horizontal for desktop (flex, gap-0), vertical for mobile |

---

## 41. Inline Editable Field

For table cells and form fields that toggle between view and edit mode (common in RoPA entry forms).

| Property | Value |
|---|---|
| View mode | Plain text, same font as surrounding context |
| Hover | Subtle `bg-muted` background, `rounded-sm`, pencil icon appears (12×12, muted-foreground) |
| Edit mode | Transforms to Input component inline, auto-focus |
| Save | Click outside or press Enter |
| Cancel | Press Escape, reverts to original value |
| Transition | `transition-all duration-150` |

---

## 42. Breadcrumb (Standalone)

Already used inside PageHeader, but can be used independently.

| Property | Value |
|---|---|
| Font | 12px, 500 |
| Home/first item | `var(--primary-500)`, cursor pointer |
| Intermediate items | `text-muted-foreground`, cursor pointer, `hover:text-foreground` |
| Current (last) item | `text-foreground`, no cursor |
| Separator | ChevronRight 14×14, muted-foreground |
| Truncation | Show first + last 2 items, middle items collapsed as `...` |

---

## 43. KPI / Metric Banner

For dashboard headers showing high-level KPIs (extends StatCard pattern into a row).

| Property | Value |
|---|---|
| Container | `bg-card`, `border border-border`, `rounded-lg`, `p-6` |
| Layout | Horizontal flex, gap-6, dividers between metrics |
| Divider | `1px solid var(--border)`, vertical, self-stretch |
| Metric label | 12px, 500, muted-foreground, uppercase |
| Metric value | 28px, 700, foreground |
| Change indicator | 12px, 500. Green for positive (success-700), red for negative (destructive-600) |
| Trend icon | ArrowUpRight or ArrowDownRight, 14×14, same color as change |

---

## 44. Semantic Color Usage Rules

| Scenario | Color to Use |
|---|---|
| Primary CTA button | `--primary-500` bg, white text |
| Secondary/supporting action | `--primary-500` tinted 8% bg, `--primary-500` text |
| Success / Published / Completed | `--color-success-700` text, 12% bg |
| Warning / In-Review / Pending | `--color-warning-600` text, 12% bg |
| Error / Rejected / Delete | `--color-destructive-600` text, 12% bg |
| Info / Initiated / System notice | `--color-info-600` text, 12% bg |
| Neutral / Draft / Default | `--neutral-900` text, 8% bg |
| Muted / secondary text | `--muted-foreground` |
| Borders | `--border` |
| Page background | `--background` (#F8F8F8) |
| Card / container | `--card` (#FFFFFF) |

### Color-Mix Opacity Formula

```css
/* Default */   color-mix(in srgb, <color> 8%–12%, transparent);
/* Hover */     color-mix(in srgb, <color> 16%–20%, transparent);
/* Active */    color-mix(in srgb, <color> 12%–16%, transparent);
/* Disabled */  bg: 4%–6%, border: 12%–20%, text: 40%
```

---

## 45. Dark Mode Tokens

Activated by `.dark` class on parent element.

| Token | Dark Value |
|---|---|
| `--background` | `rgba(19, 26, 37, 1)` |
| `--foreground` | `rgba(248, 248, 248, 1)` |
| `--card` | `rgba(30, 39, 54, 1)` |
| `--primary` | `rgba(76, 146, 230, 1)` |
| `--secondary` | `rgba(72, 78, 86, 1)` |
| `--muted` | `rgba(45, 55, 72, 1)` |
| `--muted-foreground` | `rgba(160, 174, 192, 1)` |
| `--destructive` | `rgba(248, 113, 113, 1)` |
| `--border` | `rgba(72, 78, 86, 1)` |
| `--input` | `rgba(45, 55, 72, 1)` |
| `--ring` | `rgba(76, 146, 230, 1)` |
| `--elevation-sm` | `0px 4px 16px 0px rgba(0, 0, 0, 0.25)` |

---

## 46. Animation & Motion Guidelines

### THE CARDINAL RULE: ALL ANIMATIONS MUST BE LOTTIE JSON

**Every loader, spinner, pulse effect, success animation, error shake, progress animation, onboarding animation, and any visual motion graphic MUST be delivered as a Lottie JSON file** — not CSS `@keyframes`, not CSS transitions for decorative motion, not GIFs, not SVG SMIL animations, not canvas animations.

### Why Lottie JSON?

1. **Extractability**: Designers export from After Effects → Bodymovin → JSON. Engineers consume the same JSON file across React, LiveView, Flutter, and native platforms.
2. **Cross-stack consistency**: IDfy runs Elixir/Phoenix/LiveView AND React. CSS animations cannot be shared. Lottie JSON can.
3. **Design control**: Designers own motion. Engineers play a file. No CSS translation drift.
4. **Performance**: Lottie uses `requestAnimationFrame`, renders to Canvas/SVG, and is more performant than CSS animations for complex motion.

### Implementation

#### React (Node.js)

```tsx
import Lottie from 'lottie-react';
import loaderData from '@/assets/lottie/loader.json';

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <Lottie
        animationData={loaderData}
        loop={true}
        style={{ width: 64, height: 64 }}
      />
    </div>
  );
}
```

#### Elixir / Phoenix LiveView

```html
<!-- Use lottie-web via CDN or npm -->
<div id="loader" phx-hook="LottiePlayer" data-src="/assets/lottie/loader.json" data-loop="true" style="width:64px;height:64px;"></div>
```

```javascript
// hooks/lottie_player.js
import lottie from 'lottie-web';

export const LottiePlayer = {
  mounted() {
    this.animation = lottie.loadAnimation({
      container: this.el,
      renderer: 'svg',
      loop: this.el.dataset.loop === 'true',
      autoplay: true,
      path: this.el.dataset.src,
    });
  },
  destroyed() {
    this.animation?.destroy();
  }
};
```

#### Bootstrap (legacy)

```html
<div id="loader"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>
<script>
  lottie.loadAnimation({
    container: document.getElementById('loader'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '/assets/lottie/loader.json'
  });
</script>
```

### Standard Lottie Animations (required in the asset library)

| Animation | Filename | Size | Loop | Usage |
|---|---|---|---|---|
| Page loader / spinner | `loader.json` | 64×64 | yes | Full page loading states |
| Inline spinner | `spinner-inline.json` | 20×20 | yes | Button loading, inline fetches |
| Success checkmark | `success-check.json` | 48×48 | no (play once) | Form submission success, toast |
| Error shake | `error-shake.json` | 48×48 | no | Validation failure emphasis |
| Empty state | `empty-state.json` | 80×80 | yes (subtle) | Empty tables, no results |
| Upload progress | `upload-progress.json` | 32×32 | yes | File upload indicator |
| Skeleton shimmer | — | — | — | **Exception: use CSS `animate-pulse`** |

### What IS Allowed as CSS Transitions (not Lottie)

These are **property transitions**, not animations. They are allowed:

- `transition-all` / `transition-colors` / `transition-transform` — for hover/focus state changes
- `transform: rotate()` — for chevron rotation on dropdowns
- `opacity` transitions — for fade in/out of dropdowns, tooltips, modals
- `transform: scale()` — for tooltip appear/disappear
- `transition: width` — for sidebar expand/collapse

### What is FORBIDDEN as CSS

- ❌ `@keyframes spin` for loaders
- ❌ `@keyframes pulse` for anything except Skeleton placeholders
- ❌ `@keyframes bounce` for any purpose
- ❌ Custom CSS-animated spinners, progress circles, or dot-dot-dot loaders
- ❌ SVG `<animate>` or SMIL animations
- ❌ Canvas-based custom animations (use Lottie Canvas renderer instead)

---

## 47. WCAG Accessibility Compliance (AA)

IDfy builds **compliance and regulatory products**. Accessibility is not a nice-to-have — it's a legal and ethical requirement for enterprise software. All UI must meet **WCAG 2.1 Level AA**.

### 47.1 Color Contrast

| Element | Minimum Ratio | Standard |
|---|---|---|
| Normal text (< 18px or < 14px bold) | 4.5:1 | AA |
| Large text (≥ 18px or ≥ 14px bold) | 3:1 | AA |
| UI components & graphical objects | 3:1 | AA |
| Focus indicators | 3:1 | AA |

The LoKey color palette is designed to meet these ratios. **Do not create custom color combinations without verifying contrast.**

### 47.2 Focus Management

- **Every interactive element must have a visible focus indicator.** LoKey uses `--ring` (`#1766D6`) as the focus color with a 3px ring offset.
- Focus ring pattern: `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- **Never use `outline: none` without providing an alternative focus indicator.**
- Focus must be visible on both light and dark backgrounds.

### 47.3 Semantic HTML

| Pattern | Required HTML |
|---|---|
| Page landmark | `<main>`, `<nav>`, `<aside>`, `<header>`, `<footer>` |
| Headings | Hierarchical `<h1>` → `<h6>`, never skip levels |
| Lists | `<ul>`, `<ol>`, `<li>` for list content |
| Tables | `<table>`, `<thead>`, `<th scope="col">`, `<tbody>` |
| Forms | `<form>`, `<label>`, `<fieldset>`, `<legend>` |
| Buttons | `<button>` for actions, `<a>` for navigation. NEVER `<div onClick>` for buttons |
| Dialogs | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Alerts | `role="alert"` for dynamic notifications |

### 47.4 ARIA Attributes

| Pattern | Required ARIA |
|---|---|
| Modals | `aria-modal="true"`, `aria-labelledby="title-id"` |
| Dropdowns | `aria-expanded`, `aria-haspopup`, `role="listbox"` or `role="menu"` |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` |
| Loading states | `aria-busy="true"` on the container being loaded |
| Status chips | `role="status"` or included within descriptive text |
| Icon-only buttons | `aria-label="descriptive text"` |
| Tooltips | `role="tooltip"`, trigger has `aria-describedby` |
| Progress bars | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Required fields | `aria-required="true"` on input |
| Error fields | `aria-invalid="true"`, `aria-describedby="error-message-id"` |

### 47.5 Images & Icons

- Decorative icons (next to text that describes them): `aria-hidden="true"`
- Meaningful icons (sole indicator): `aria-label` or `<title>` within SVG
- All `<img>` tags must have `alt` text. Decorative images: `alt=""`
- Never use images of text. All text must be real text.

### 47.6 Motion & Animation

- Respect `prefers-reduced-motion` media query. When enabled:
  - Lottie: `autoplay: false` and show static first frame
  - CSS transitions: reduce to `duration-0` or `duration-75`
- No auto-playing video or animation that cannot be paused
- No content that flashes more than 3 times per second

```tsx
// Lottie with reduced motion respect
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<Lottie
  animationData={loaderData}
  loop={!prefersReduced}
  autoplay={!prefersReduced}
/>
```

---

## 48. Keyboard Navigation Patterns

| Component | Keys |
|---|---|
| Button | `Enter` / `Space` to activate |
| Checkbox | `Space` to toggle |
| Switch | `Space` to toggle |
| Radio group | `Arrow Up/Down` to move, `Space` to select |
| Dropdown menu | `Enter` to open, `Arrow Up/Down` to navigate, `Enter` to select, `Escape` to close |
| Select | Same as dropdown |
| Tabs | `Arrow Left/Right` to switch tabs |
| Modal | `Tab` to cycle focus within, `Escape` to close, focus trapped inside |
| Drawer | Same as modal |
| Accordion | `Enter`/`Space` to expand/collapse, `Arrow Up/Down` between items |
| Table | `Tab` through focusable cells, `Arrow keys` for navigation within |
| Date picker | `Arrow keys` to navigate dates, `Enter` to select, `Escape` to close |
| Toast | Auto-dismiss, `Escape` to dismiss early, focus does not trap |

### Focus Trap Rule

Modals, drawers, and confirmation dialogs MUST trap focus. When open, `Tab` cycles through focusable elements within the overlay only. Focus returns to the trigger element when closed.

---

## 49. Form Patterns & Validation

### 49.1 Validation Timing

| Event | Behavior |
|---|---|
| On blur (first touch) | Validate field, show error if invalid |
| On change (after first error) | Re-validate on every keystroke to clear errors immediately |
| On submit | Validate all fields, scroll to first error, focus first invalid field |

### 49.2 Error Display

| Property | Value |
|---|---|
| Error text | 12px, 400, `var(--color-destructive-500)` |
| Error icon | AlertCircle, 12×12, same color, left of error text |
| Input border on error | `var(--color-destructive-500)` via `aria-invalid` |
| Input ring on error | `var(--color-destructive-500)/20` |
| Error position | Below input, 4px gap |
| Animation | Lottie `error-shake.json` on first display (plays once) |

### 49.3 Required Fields

- Mark with `*` after label text, in `var(--color-destructive-500)`
- Add `aria-required="true"` to input
- Optional fields: append "(optional)" in `text-muted-foreground` after label

### 49.4 Long Form Patterns

For RoPA entry forms and DPIA assessments (can have 20+ fields):

- Group related fields under collapsible section headers
- Section header: 16px, 600, foreground, with ChevronDown 16×16
- Show completion progress per section
- Sticky footer with Save Draft and Submit buttons
- Auto-save indicator: small muted text "Saved 2 min ago" or Lottie `spinner-inline.json`

---

## 50. Loading & Error State Patterns

### 50.1 Page-Level Loading

```
┌────────────────────────────────┐
│         [Lottie loader]        │
│         loader.json 64×64      │
│      "Loading..." (14px, muted)│
└────────────────────────────────┘
```

Centered in the content area. Sidebar and TopBar remain visible.

### 50.2 Table Loading

Show Skeleton rows matching the table structure: 5 rows of rectangles matching column widths.

### 50.3 Card Grid Loading

Show Skeleton cards matching the grid layout (typically 3–4 cards).

### 50.4 Inline / Button Loading

Replace button text with Lottie `spinner-inline.json` (20×20). Button remains same size. Add `disabled` state.

### 50.5 Error States

| Type | Display |
|---|---|
| Page error | Empty state pattern with error Lottie, "Something went wrong" heading, retry button |
| API error | Toast notification (error variant) |
| Form error | Field-level inline errors (Section 49.2) |
| Network error | Full-width Alert banner (destructive variant) at top of content area |

---

## 51. Content & Writing Guidelines (Enterprise SaaS)

### 51.1 Tone

- **Professional, clear, and precise.** Never casual, never playful.
- Use active voice: "Save as draft" not "Your changes will be saved as a draft"
- Be direct: "Delete this entry?" not "Are you sure you want to delete this entry?"

### 51.2 Button Labels

| Action | Label | NEVER |
|---|---|---|
| Create new | "Create", "Add [noun]" | "New", "+" only |
| Save without submitting | "Save Draft" | "Save" (ambiguous) |
| Submit for review | "Submit for Review" | "Submit" (vague in maker-checker) |
| Approve | "Approve" | "Accept", "OK" |
| Reject / Request changes | "Request Changes" | "Reject" (too harsh) |
| Delete | "Delete" | "Remove" (ambiguous) |
| Cancel | "Cancel" | "Never mind", "Go back" |
| Close | "Close" | "X" alone (need aria-label) |
| Download | "Download" or "Export" | "Get" |
| Filter | "Filter" or "Show [Category]" | "Sort" (different action) |

### 51.3 Status Labels

Always use the exact labels from StatusChip (Section 14). Never rephrase:

- ✅ "Draft" — ❌ "Drafted", "In Draft"
- ✅ "In Review" — ❌ "Under Review" (that's a different DPIA status), "Reviewing"
- ✅ "Published" — ❌ "Active", "Live"
- ✅ "Change Requested" — ❌ "Rejected", "Needs Changes"

### 51.4 Empty State Copy

- Heading: State what's missing ("No processing activities yet")
- Description: Tell the user what to do ("Create your first entry to begin.")
- CTA: Match the heading action ("Create Entry")

### 51.5 Error Messages

- Be specific: "Business unit name is required" not "This field is required"
- Suggest fix: "Date must be in the future" not "Invalid date"
- Never blame the user: "Could not save — please try again" not "You entered invalid data"

### 51.6 Date & Number Formatting

| Type | Format | Example |
|---|---|---|
| Date (display) | DD MMM YYYY | 18 Feb 2026 |
| Date (data) | ISO 8601 | 2026-02-18 |
| Date + time | DD MMM YYYY, HH:mm | 18 Feb 2026, 14:30 |
| Numbers | Locale-formatted with commas | 1,234,567 |
| Percentages | One decimal max | 78.5% |
| Currency | Symbol + locale format | ₹1,23,456.00 |

---

## 52. Internationalization & RTL Readiness

While LoKey currently serves English, the design system is built for future i18n:

### 52.1 Layout Rules

- Use `flex` and `gap` instead of explicit `margin-left`/`margin-right`
- Use logical properties where possible: `padding-inline-start` vs `padding-left`
- Icons that imply direction (arrows, chevrons) must flip in RTL
- Text alignment: use `text-start` / `text-end` instead of `text-left` / `text-right`

### 52.2 Text Rules

- Never concatenate strings in UI code. Use template literals or i18n keys.
- Avoid fixed widths on text containers (text length varies by language)
- Button widths: `min-w` + `hug` (Tailwind: don't set fixed widths, let content determine)
- Plural handling: always handle 0, 1, and many ("0 entries", "1 entry", "8 entries")

### 52.3 Date & Number

- Store dates as ISO 8601. Format for display using locale-aware libraries (`date-fns` with locale, `Intl.DateTimeFormat`).
- Numbers: use `Intl.NumberFormat` for locale-aware formatting.

---

## 53. Anti-Patterns — Things AI Tools Must NEVER Do

### Typography

- ❌ **NEVER** use `Inter`, `Roboto`, `system-ui`, `Helvetica`, or `sans-serif` alone. Always `'Plus Jakarta Sans', sans-serif`.
- ❌ **NEVER** use font sizes not in the scale.
- ❌ **NEVER** use font-weight `300` (light) or `800`/`900` (extra-bold/black).

### Colors

- ❌ **NEVER** use raw Tailwind color classes like `bg-blue-500`, `text-gray-700`. Always use CSS variables.
- ❌ **NEVER** invent colors. No `#3B82F6`, no `#6B7280`, no `#EF4444`.
- ❌ **NEVER** use `opacity-50` on elements for lighter colors. Use `color-mix()`.
- ❌ **NEVER** use gradients on buttons, cards, or UI surfaces.

### Border Radius

- ❌ **NEVER** use `rounded-full` on buttons. Buttons are `var(--radius-md)` (6px).
- ❌ **NEVER** use anything other than `20px` for chips/badges.
- ❌ **NEVER** use `rounded-none` on interactive elements.

### Shadows

- ❌ **NEVER** apply shadows to buttons.
- ❌ **NEVER** apply shadows to cards by default (only on hover).
- ❌ **NEVER** use arbitrary shadows not from LoKey elevation tokens.

### Spacing

- ❌ **NEVER** use odd spacing values like `5px`, `7px`, `15px`, `18px`. Use the 4px grid.

### Components

- ❌ **NEVER** create buttons with pill shapes. Only chips are pills.
- ❌ **NEVER** mix chip styles — status = accent, size `s`, always.
- ❌ **NEVER** put icons larger than 16×16 inside buttons.
- ❌ **NEVER** use colored page backgrounds.

### Layout

- ❌ **NEVER** create light/white sidebars. Always dark (#131A25).
- ❌ **NEVER** make TopBar taller than 56px.
- ❌ **NEVER** put breadcrumbs in TopBar. They go in PageHeader.

### Icons

- ❌ **NEVER** use any icon library other than `lucide-react`.
- ❌ **NEVER** change icon stroke widths.

### Animations

- ❌ **NEVER** create CSS `@keyframes` for loaders, spinners, or decorative motion. Use Lottie JSON.
- ❌ **NEVER** use GIFs for animations. Use Lottie.
- ❌ **NEVER** use CSS `animation: spin` for loading indicators.
- ❌ **NEVER** forget `prefers-reduced-motion` support.

### Accessibility

- ❌ **NEVER** use `<div onClick>` for interactive elements. Use `<button>` or `<a>`.
- ❌ **NEVER** remove focus outlines without replacement.
- ❌ **NEVER** use color alone to convey meaning.
- ❌ **NEVER** skip heading levels.
- ❌ **NEVER** forget `alt` text on images or `aria-label` on icon buttons.
- ❌ **NEVER** auto-play animations without `prefers-reduced-motion` check.
- ❌ **NEVER** trap keyboard focus in non-modal components.

---

## 54. CSS Variable Quick Reference

```css
:root {
  --font-size: 14px;
  --text-4xl: 52px;
  --text-3xl: 40px;
  --text-2xl: 36px;
  --text-xl: 28px;
  --text-base: 14px;
  --text-sm: 12px;

  --neutral-0: #FFFFFF;
  --neutral-50: #FAFAFB;
  --neutral-100: #ECEDED;
  --neutral-200: #BFC2C4;
  --neutral-900: #131A25;
  --neutral-950: #0A0D13;

  --primary-500: #1766D6;
  --primary-600: #104EB8;

  --color-success-50: #E9FCE5;
  --color-success-200: #B6F1A5;
  --color-success-500: #4CAF47;
  --color-success-700: #1A7A1E;
  --color-success-900: #043A1A;

  --color-warning-50: #FEF2CB;
  --color-warning-200: #F9C963;
  --color-warning-600: #CB7100;
  --color-warning-700: #AA5800;

  --color-destructive-200: #FCC3A1;
  --color-destructive-500: #E23318;
  --color-destructive-600: #C21B11;
  --color-destructive-700: #A20C0F;
  --color-destructive-900: #6C0417;

  --color-info-50: #E0FCFD;
  --color-info-200: #C8FAFA;
  --color-info-400: #5CD4E6;
  --color-info-500: #33AFCD;
  --color-info-600: #007FAD;
  --color-info-800: #004A7C;

  --background: rgba(248, 248, 248, 1);
  --foreground: rgba(19, 26, 37, 1);
  --card: rgba(255, 255, 255, 1);
  --card-foreground: rgba(19, 26, 37, 1);
  --popover: rgba(255, 255, 255, 1);
  --popover-foreground: rgba(19, 26, 37, 1);
  --primary: rgba(23, 102, 214, 1);
  --primary-foreground: rgba(255, 255, 255, 1);
  --secondary: rgba(0, 0, 0, 0);
  --secondary-foreground: rgba(23, 102, 214, 1);
  --muted: rgba(237, 241, 247, 1);
  --muted-foreground: rgba(72, 78, 86, 1);
  --accent: rgba(23, 102, 214, 1);
  --accent-foreground: rgba(255, 255, 255, 1);
  --destructive: rgba(226, 51, 24, 1);
  --destructive-foreground: rgba(255, 255, 255, 1);
  --border: rgba(228, 233, 242, 1);
  --input: rgba(255, 255, 255, 1);
  --input-background: rgba(255, 255, 255, 1);
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --ring: rgba(23, 102, 214, 1);

  --elevation-sm: 0px 4px 16px 0px rgba(0, 0, 0, 0.08);
  --elevation-md: 0px 8px 32px 0px rgba(0, 0, 0, 0.12);
  --elevation-sticky: -8px 0 16px -4px color-mix(in srgb, var(--neutral-950) 15%, transparent);

  --radius: 8px;

  --chart-1: rgba(23, 102, 214, 1);
  --chart-2: rgba(76, 146, 230, 1);
  --chart-3: rgba(112, 177, 242, 1);
  --chart-4: rgba(161, 209, 250, 1);
  --chart-5: rgba(207, 234, 252, 1);

  --sidebar-dark: var(--neutral-900);
  --sidebar-dark-border: color-mix(in srgb, var(--neutral-0) 12%, var(--neutral-950));
  --sidebar-dark-text: var(--neutral-0);
  --sidebar-dark-text-muted: color-mix(in srgb, var(--neutral-0) 70%, transparent);
  --sidebar-dark-hover: color-mix(in srgb, var(--primary-500) 12%, transparent);
  --sidebar-dark-active: color-mix(in srgb, var(--neutral-0) 15%, transparent);
}
```

---

*End of LoKey Design System AI Guidelines v2.0. Any value not found in this document should NOT be used. When in doubt, use the closest defined token and flag it for the DS team.*
