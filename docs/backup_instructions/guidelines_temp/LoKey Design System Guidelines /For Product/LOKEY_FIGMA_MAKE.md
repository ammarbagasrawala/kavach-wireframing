# LoKey Design System — Figma Make Instructions

> **How to use:** In Figma Make, go to your project settings and paste this entire document into the **Custom Instructions** field. Figma Make will follow these rules every time it generates or modifies a design.

---

You are designing within the **LoKey Design System** by IDfy. LoKey is a professional B2B SaaS enterprise design system for compliance and privacy products. Every design you generate MUST follow these rules exactly. Do not invent, guess, or hallucinate any value not defined below.

## Core Identity

- **Font:** Plus Jakarta Sans — ONLY this font, always. Weights: 400 (Regular), 500 (Medium — default), 600 (Semi-bold), 700 (Bold). Never use Inter, Roboto, SF Pro, Helvetica, or system fonts.
- **Base text size:** 14px. Letter spacing: 0.4% on all text.
- **Design language:** Clean, minimal, professional. No gradients, no heavy shadows, no playful/rounded aesthetics. This is enterprise compliance software.
- **Spacing grid:** 4px base unit. All spacing must be multiples of 4: 0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 112.

## Type Scale

| Name | Size | Weight | Use |
|---|---|---|---|
| Display | 52px | 500 | Marketing hero (rare in app) |
| H1 | 40px | 500 | Page-level headings |
| H2 | 36px | 500 | Section headings |
| H3 | 28px | 500 | Sub-section headings |
| Stat Value | 32px | 700 | Dashboard metric numbers |
| Page Title | 20px | 600 | Page headers, modal titles |
| Card Title | 18px | 600 | Card headings |
| Product Name | 16px | 500 | Top bar product label |
| Body / Default | 14px | 500 | Buttons, table cells, nav items, forms |
| Body (read) | 14px | 400 | Long-form text, descriptions |
| Small / Caption | 12px | 500 | Chips, breadcrumbs, labels, metadata |
| Section Header | 11px | 600 | Dropdown section headers (UPPERCASE, 0.06em tracking) |
| Micro | 10px | 400 | Email, tertiary info |
| Badge | 9px | 700 | Role badges (UPPERCASE) |

## Colors

### Primary
| Token | Hex | Use |
|---|---|---|
| Primary 500 | #1766D6 | THE primary blue. Buttons, links, active states, focus |
| Primary 600 | #104EB8 | Hover state for primary elements |
| Primary 20/50 | #DBE9FA | Light primary backgrounds |

### Neutral
| Token | Hex | Use |
|---|---|---|
| Neutral 0 | #FFFFFF | Card backgrounds, button surfaces |
| Neutral 50 | #FAFAFB | Subtle off-white |
| Neutral 100 | #ECEDED | Light borders |
| Neutral 200 | #BFC2C4 | Disabled hint |
| Neutral 900 | #131A25 | Primary text, sidebar background |
| Neutral 950 | #0A0D13 | Deepest dark |

### Semantic Colors
| Color | Light bg | Text/Icon | Use |
|---|---|---|---|
| Success | #E9FCE5 | #1A7A1E | Published, Completed, Approved |
| Warning | #FEF2CB | #CB7100 | In Review, Pending, Draft warnings |
| Error | #FCC3A1 | #C21B11 | Rejected, Failed, Delete |
| Info | #E0FCFD | #007FAD | Initiated, System notices |

### Functional Tokens
| Token | Value | Use |
|---|---|---|
| Background | #F8F8F8 | App page background (NEVER white, NEVER colored) |
| Card | #FFFFFF | All card/container surfaces |
| Border | #E4E9F2 | All borders and dividers |
| Muted Foreground | #484E56 | Secondary/description text |
| Ring | #1766D6 | Focus indicators |

### Tinting Pattern (CRITICAL)
For tinted/light backgrounds, LoKey uses color-mix, not opacity:
- Default: base color at 8–12% over transparent
- Hover: base color at 16–20% over transparent
- Disabled: background 4–6%, border 12–20%, text 40%

## Border Radius

| Token | Value | Use |
|---|---|---|
| radius-sm | 4px | Icon containers, small elements, checkbox |
| radius-md | 6px | **MOST COMMON** — Buttons, inputs, dropdowns, cards |
| radius-lg | 8px | Modals, table wrappers, large containers |
| radius-xl | 12px | Tabs list, hero sections |
| 20px (pill) | 20px | Chips and badges ONLY |
| Full circle | 9999px | Avatars ONLY |

**CRITICAL:** Buttons are NEVER pill-shaped. Always 6px radius. Only chips/badges are pills (20px).

## Shadows

| Token | Value | Use |
|---|---|---|
| Elevation SM | 0 4px 16px rgba(0,0,0,0.08) | Cards on HOVER only, dropdowns |
| Elevation MD | 0 8px 32px rgba(0,0,0,0.12) | Modals, dialogs |

**Rules:** Cards have NO shadow at rest. Buttons NEVER have shadows.

## Icons
- Library: Lucide icons ONLY.
- Sizes: 16×16 (buttons/chips), 18×18 (sidebar/topbar), 14×14 (breadcrumb/dropdown chevrons), 12×12 (close/dismiss).
- Color: Inherit from parent text color. Never change stroke width.

## Components

### Buttons (LoKeyButton)
**Variants:**
- **Primary:** Blue fill (#1766D6), white text. Hover: #104EB8.
- **Secondary:** Light blue tint bg, blue text, blue tint border.
- **Tertiary:** White fill, dark text (#131A25), dark border.
- **Outlined:** White fill, blue text, blue border.
- **Ghost:** Transparent, blue text, no border.

**Sizes:** xxs (24px), xs (28px), s (32px), m (36px — default), l (40px), xl (44px), xxl (48px).
**Radius:** 6px always. NEVER pill. **Font weight:** 500. **Icons inside:** Always 16×16.

### Chips / Badges (LoKeyChip)
Always pill-shaped (20px radius). Font always 12px regardless of size.
**Sizes:** s (24px), m (28px), l (32px), xl (36px).
**Accent style colors:**
| Type | Bg tint | Text |
|---|---|---|
| Primary | #1766D6 at 12% | #104EB8 |
| Neutral | #131A25 at 8% | #131A25 |
| Success | #1A7A1E at 12% | #1A7A1E |
| Warning/extra | #CB7100 at 12% | #CB7100 |
| Error | #C21B11 at 12% | #C21B11 |
| Info | #007FAD at 12% | #007FAD |

### Status Chips
Always accent style, always size s (24px):
Draft → neutral | Published → success | In Review → warning | Change Requested → error | In Progress → primary | Initiated → info | Completed → success

### Layout Structure
- **App background:** #F8F8F8 always
- **Sidebar:** Dark (#131A25), left, 280px expanded / 64px collapsed, white text, icons 18×18
- **TopBar:** 56px height, card bg, border-bottom. Product name (16px) + bell icon + profile dropdown
- **PageHeader:** Card bg, border-bottom. Breadcrumbs (12px) + Title (20px/600) + entry count
- **Content:** Scrollable, 24px padding

### Other Components
- **Stat Card:** White card, border, 6px radius, 16px padding. Label (12px uppercase muted) + icon container (32×32 tinted) + value (32px/700).
- **Search Bar:** 36px height, 350px width, 6px radius, search icon + 12px input + clear X.
- **Filter Dropdown:** 36px trigger, label (muted) + value (bold) + chevron, dropdown panel 200px+ with items.
- **Modal:** 40% overlay, card bg, 8px radius, 24px padding, max 600px, shadow. Title 20px/700.
- **Drawer:** 40% overlay, 500px width, card bg, right-aligned, shadow-xl. Header border-bottom.
- **Data Table:** Border wrapper 8px radius, header 12-13px/bold, body 14px, toolbar above with search+filters+actions.
- **Template Card:** Card bg, border, 6px radius, 12px padding, hover:shadow. Icon 32×32, title 18px/600, description line-clamp-4, footer with actions.
- **Form Input:** 36px height, 6px radius, border, 14px text, blue focus ring.
- **Checkbox:** 16×16, 4px radius, checked = blue fill + white check.
- **Switch:** 32×18 track, 16×16 thumb, circle, checked = blue.
- **Tabs:** Muted bg container, 36px height, 12px radius tabs, active = white card bg.
- **Tooltip:** Primary blue bg, white text, 12px, rounded-md.
- **Empty State:** Centered, illustration + heading (16px/600) + description (14px/muted) + CTA button.
- **Confirmation Dialog:** 440px modal, warning icon in 48px circle + title + Cancel/Confirm.
- **Avatar:** Circle, 20–48px sizes, initials on tinted bg or image.
- **Toast:** Bottom-right, 360px, card bg, border, 8px radius, shadow. Color accent per type.
- **Stepper:** 28×28 circle indicators, connector lines, blue = completed/current.
- **Pagination:** 36×36 buttons, 6px radius, active = blue fill.

### Role Badges
- Maker: blue tint bg, blue text, blue border
- Checker: green tint bg, green text, green border

## What You Must NEVER Do

❌ Use any font other than Plus Jakarta Sans
❌ Use colors not defined above — no inventing hex codes
❌ Use gradients on UI surfaces
❌ Make buttons pill-shaped (only chips are pills)
❌ Apply shadows to buttons or cards at rest
❌ Use a white or light sidebar (always dark #131A25)
❌ Make TopBar taller than 56px
❌ Put breadcrumbs in the TopBar (they go in PageHeader)
❌ Use odd spacing (5px, 7px, 15px, 18px) — stick to 4px grid
❌ Use icons from any library other than Lucide
❌ Use color alone to convey status (always pair with text label)
❌ Skip focus indicators on interactive elements
❌ Use animated loaders as CSS — use Lottie JSON animations
