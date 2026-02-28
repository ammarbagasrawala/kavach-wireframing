# LoKey Design System — Antigravity Instructions

> **How to use:** In Antigravity, paste this entire document into the **Context / Custom Instructions** field of your project. Antigravity will follow these rules when generating designs and code from your prompts.

---

You are working with the **LoKey Design System** by IDfy. LoKey is a skinned layer on top of Tailwind CSS + shadcn/ui, built for B2B SaaS enterprise compliance products. Every output — whether design or code — MUST follow the tokens, components, and patterns below. Do not invent or hallucinate values.

## Design Language
- Professional, minimal, data-dense enterprise SaaS. No gradients, no playful aesthetics.
- Font: **Plus Jakarta Sans** only. Weights: 400, 500 (default), 600, 700. Base size: 14px.
- 4px spacing grid. Allowed values: 0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 112.
- Icons: Lucide only. Sizes: 16×16 (buttons), 18×18 (nav), 14×14 (chevrons), 12×12 (close/utility).
- Animations: Lottie JSON files only. Never CSS @keyframes for loaders, spinners, or motion graphics.

## Color Tokens

**Primary:** #1766D6 (default), #104EB8 (hover), #DBE9FA (light bg)
**Neutral:** #FFFFFF (card), #FAFAFB (off-white), #ECEDED (light border), #131A25 (text/sidebar), #0A0D13 (deepest)
**Success:** #E9FCE5 (bg), #1A7A1E (text) — Published, Completed
**Warning:** #FEF2CB (bg), #CB7100 (text) — In Review, Pending
**Error:** #FCC3A1 (bg), #C21B11 (text) — Rejected, Delete
**Info:** #E0FCFD (bg), #007FAD (text) — Initiated, System notices

**Functional:** Background #F8F8F8, Card #FFFFFF, Border #E4E9F2, Muted text #484E56, Focus ring #1766D6

**Tinting:** Use `color-mix(in srgb, <color> 8-12%, transparent)` for tinted backgrounds. Hover: 16-20%. Disabled: bg 4-6%, text 40%. NEVER use opacity utilities.

## Border Radius
- 4px → icon containers, checkbox
- **6px → buttons, inputs, cards, dropdowns (MOST COMMON)**
- 8px → modals, table wrappers
- 12px → tabs list
- **20px → chips/badges ONLY (pill shape)**
- Full circle → avatars ONLY
- **Buttons are NEVER pill-shaped.**

## Shadows
- Cards: NO shadow at rest. Shadow on hover only (0 4px 16px rgba(0,0,0,0.08)).
- Modals: 0 8px 32px rgba(0,0,0,0.12).
- Buttons: NEVER have shadows.

## Components

### Buttons — 5 variants × 7 sizes
**Types:** Primary (blue fill, white text) | Secondary (blue tint bg, blue text, blue tint border) | Tertiary (white, dark text, dark border) | Outlined (white, blue text, blue border) | Ghost (transparent, blue text)
**Sizes:** xxs 24px | xs 28px | s 32px | m 36px (default) | l 40px | xl 44px | xxl 48px
**Radius: 6px.** Font: 500. Icons: 16×16.

### Chips — always pill (20px), font always 12px
**Sizes:** s 24px | m 28px | l 32px | xl 36px
**Accent colors:** Primary (#1766D6/12% bg, #104EB8 text) | Neutral (#131A25/8%, #131A25) | Success (#1A7A1E/12%, #1A7A1E) | Warning (#CB7100/12%, #CB7100) | Error (#C21B11/12%, #C21B11) | Info (#007FAD/12%, #007FAD)

### Status Chips — accent style, size s (24px), always
Draft→neutral | Published→success | In Review→warning | Change Requested→error | In Progress→primary | Initiated→info | Completed→success

### Layout
- Sidebar: #131A25 dark, 280px expanded / 64px collapsed, white text
- TopBar: 56px height, card bg, border-bottom
- PageHeader: card bg, border-bottom, breadcrumbs (12px) + title (20px/600)
- Content: #F8F8F8 bg, 24px padding, scrollable

### Other Key Components
- **StatCard:** card, border, 6px radius, 16px padding, hover shadow. Label 12px uppercase muted + icon 32×32 tinted + value 32px/700.
- **SearchBar:** 36px, 350px, 6px radius, search icon + 12px input + clear X.
- **FilterDropdown:** 36px trigger, chevron rotates, panel 200px+ with shadow.
- **Modal:** 40% overlay, card bg, 8px radius, 24px padding, max 600px, shadow. Title 20px/700.
- **Drawer:** 40% overlay, 500px right, card bg, shadow-xl.
- **DataTable:** border 8px radius, header 12-13px bold, body 14px, 12px cell padding, toolbar above.
- **TemplateCard:** card, border, 6px radius, 12px padding, hover:shadow-lg. Title 18px/600, description 14px muted.
- **Form Input:** 36px, 6px radius, border, 14px text, blue focus ring.
- **Checkbox:** 16×16, 4px radius, checked = blue fill + white check.
- **Switch:** 32×18 track, 16×16 thumb, checked = blue.
- **Tabs:** muted bg, 36px, 12px radius, active = white card bg.
- **Tooltip:** blue bg, white text, 12px.
- **Empty State:** centered illustration + heading 16px/600 + description 14px muted + CTA button.
- **Confirmation Dialog:** 440px, warning icon 48px circle + title + Cancel/Confirm.
- **Avatar:** circle, 20-48px, initials on tinted bg.
- **Toast:** bottom-right, 360px, card bg, shadow, color accent per type.
- **Stepper:** 28×28 circles, connector lines, blue = done/current.
- **Pagination:** 36×36 buttons, 6px radius, active = blue fill.

### Role Badges
Maker: blue tint bg/text/border | Checker: green tint bg/text/border. Always 9px/700 uppercase.

## Writing & Content
- Tone: Professional, precise, direct. Active voice.
- Button labels: "Create", "Save Draft", "Submit for Review", "Delete", "Cancel" — never "OK", "Remove", "Submit" (vague).
- Status labels: Use exact text — "Draft", "Published", "In Review", "Change Requested" (never rephrase).
- Dates: DD MMM YYYY (18 Feb 2026).

## Accessibility (WCAG AA — mandatory)
- All interactive elements use `<button>` or `<a>`, never `<div onClick>`
- Focus rings on everything interactive (blue #1766D6, 3px ring)
- Icon-only buttons have aria-label
- Color never sole indicator of meaning
- Modals trap focus, close on Escape
- Form errors: aria-invalid + aria-describedby
- Respect prefers-reduced-motion

## NEVER Do
❌ Use any font except Plus Jakarta Sans
❌ Invent colors or use default Tailwind color classes
❌ Make buttons pill-shaped (only chips are pills)
❌ Put shadows on buttons or cards at rest
❌ Use gradients on UI surfaces
❌ Create light/white sidebars
❌ Use CSS @keyframes for loaders — use Lottie JSON
❌ Use spacing not on the 4px grid
❌ Use icons from any library other than Lucide
❌ Skip focus indicators or ARIA attributes
