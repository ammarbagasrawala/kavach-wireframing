# LoKey Design System — Tailwind CSS + Bootstrap Implementation Guide

> **Version:** 2.0.0
> **Last Updated:** February 2026
> **Parent Document:** `LOKEY_DESIGN_SYSTEM_GUIDELINES.md` (source of truth for all tokens)
> **Stack:** Tailwind CSS v4 (primary), Bootstrap 5 (legacy support)
> **Purpose:** This file bridges LoKey tokens across Tailwind CSS (the standard) and Bootstrap (legacy IDfy projects). It provides utility class mappings, migration patterns, and coexistence rules for projects that still use Bootstrap. **Tailwind is the primary styling system. Bootstrap is supported but should be migrated away from over time.**

---

## 1. Tailwind CSS — LoKey Configuration

### 1.1 Token-Aware Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html,heex}",
    "./lib/**/*.{ex,heex}",
    "./templates/**/*.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      colors: {
        // Map CSS variables to Tailwind color utilities
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      borderRadius: {
        sm: "4px",   // --radius-sm
        md: "6px",   // --radius-md
        lg: "8px",   // --radius-lg
        xl: "12px",  // --radius-xl
      },
      fontSize: {
        "4xl": ["52px", { lineHeight: "1.2" }],
        "3xl": ["40px", { lineHeight: "1.3" }],
        "2xl": ["36px", { lineHeight: "1.4" }],
        "xl":  ["28px", { lineHeight: "1.4" }],
        "base": ["14px", { lineHeight: "1.5" }],
        "sm":  ["12px", { lineHeight: "1.5" }],
      },
      boxShadow: {
        "elevation-sm": "0px 4px 16px 0px rgba(0, 0, 0, 0.08)",
        "elevation-md": "0px 8px 32px 0px rgba(0, 0, 0, 0.12)",
      },
      spacing: {
        // Ensure 4px grid compliance
        "0.5": "2px",
        "1": "4px",
        "1.5": "6px",
        "2": "8px",
        "2.5": "10px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "14": "56px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
        "28": "112px",
      },
    },
  },
};
```

### 1.2 Tailwind-to-LoKey Class Mapping

The standard Tailwind utilities you SHOULD use with LoKey:

| LoKey Token | Tailwind Class | Notes |
|---|---|---|
| `--background` | `bg-background` | Page background |
| `--foreground` | `text-foreground` | Default text |
| `--card` | `bg-card` | Card surfaces |
| `--muted` | `bg-muted` | Hover states, disabled bg |
| `--muted-foreground` | `text-muted-foreground` | Secondary text |
| `--border` | `border-border` | All borders |
| `--primary` | `bg-primary`, `text-primary` | Use cautiously — prefer CSS var for exact control |
| `--primary-foreground` | `text-primary-foreground` | Text on primary surfaces |
| `--radius-md` | `rounded-md` | Most interactive elements |
| `--radius-lg` | `rounded-lg` | Modals, containers |

### 1.3 Tailwind Classes You Must NEVER Use

These default Tailwind color utilities bypass LoKey tokens:

```
❌ bg-blue-500, bg-blue-600, bg-blue-700  → Use var(--primary-500), var(--primary-600)
❌ bg-red-500, bg-red-600                 → Use var(--color-destructive-500)
❌ bg-green-500, bg-green-600             → Use var(--color-success-500)
❌ bg-yellow-500, bg-orange-500           → Use var(--color-warning-600)
❌ bg-gray-100 through bg-gray-900        → Use var(--neutral-*) or semantic tokens
❌ text-gray-500, text-gray-600           → Use text-muted-foreground
❌ shadow-sm, shadow-md, shadow-lg        → Use shadow-elevation-sm, shadow-elevation-md
❌ rounded-full on buttons                → Use rounded-md (6px)
```

### 1.4 Correct Tailwind Usage for LoKey

```html
<!-- ✅ CORRECT: Using LoKey-mapped Tailwind utilities -->
<div class="bg-card border border-border rounded-lg p-4 hover:shadow-elevation-sm transition-all">
  <h3 class="text-foreground text-base font-semibold">Card Title</h3>
  <p class="text-muted-foreground text-sm mt-1">Description text</p>
</div>

<!-- ✅ CORRECT: Using CSS variables directly for tokens not in Tailwind config -->
<button class="h-[36px] px-4 rounded-[var(--radius-md)] bg-[var(--primary-500)] text-[color:var(--neutral-0)] hover:bg-[var(--primary-600)] transition-all">
  Primary Button
</button>

<!-- ✅ CORRECT: color-mix for tinted backgrounds -->
<span class="bg-[color-mix(in_srgb,var(--primary-500)_12%,transparent)] text-[color:var(--primary-600)] border border-[color-mix(in_srgb,var(--primary-500)_20%,transparent)] rounded-[20px] h-[24px] px-2.5 text-sm">
  Tag
</span>

<!-- ❌ WRONG: Raw Tailwind colors -->
<div class="bg-blue-50 border border-blue-200 rounded-full">
  <span class="text-blue-700">Tag</span>
</div>
```

---

## 2. Bootstrap — Legacy Support & Migration

### 2.1 When Bootstrap Is Still Used

Some older IDfy products still use Bootstrap 5. For these projects:

1. **Load LoKey CSS variables** in addition to Bootstrap CSS.
2. **Override Bootstrap defaults** using custom properties.
3. **Do NOT use Bootstrap color utilities** (`btn-primary`, `bg-success`, `text-danger`) — override them with LoKey tokens.
4. **Migrate incrementally** — replace Bootstrap components with LoKey equivalents one screen at a time.

### 2.2 Bootstrap Variable Overrides

```css
/* lokey-bootstrap-overrides.css — load AFTER bootstrap.css */
:root {
  /* Override Bootstrap's default color system */
  --bs-primary: #1766D6;         /* LoKey --primary-500 */
  --bs-primary-rgb: 23, 102, 214;
  --bs-secondary: #131A25;       /* LoKey --neutral-900 */
  --bs-secondary-rgb: 19, 26, 37;
  --bs-success: #1A7A1E;         /* LoKey --color-success-700 */
  --bs-success-rgb: 26, 122, 30;
  --bs-danger: #E23318;          /* LoKey --color-destructive-500 */
  --bs-danger-rgb: 226, 51, 24;
  --bs-warning: #CB7100;         /* LoKey --color-warning-600 */
  --bs-warning-rgb: 203, 113, 0;
  --bs-info: #007FAD;            /* LoKey --color-info-600 */
  --bs-info-rgb: 0, 127, 173;

  /* Override Bootstrap's typography */
  --bs-body-font-family: 'Plus Jakarta Sans', sans-serif;
  --bs-body-font-size: 14px;
  --bs-body-font-weight: 500;
  --bs-body-color: #131A25;      /* LoKey --foreground */
  --bs-body-bg: #F8F8F8;         /* LoKey --background */

  /* Override Bootstrap's border radius */
  --bs-border-radius: 6px;       /* LoKey --radius-md */
  --bs-border-radius-sm: 4px;    /* LoKey --radius-sm */
  --bs-border-radius-lg: 8px;    /* LoKey --radius-lg */
  --bs-border-radius-xl: 12px;   /* LoKey --radius-xl */
  --bs-border-radius-pill: 20px; /* LoKey chip radius */

  /* Override Bootstrap's border color */
  --bs-border-color: #E4E9F2;    /* LoKey --border */

  /* Card */
  --bs-card-bg: #FFFFFF;
  --bs-card-border-color: #E4E9F2;
  --bs-card-border-radius: 8px;
  --bs-card-spacer-y: 16px;
  --bs-card-spacer-x: 16px;
}
```

### 2.3 Bootstrap Class-to-LoKey Mapping

For legacy projects that cannot immediately switch to Tailwind:

| Bootstrap Class | LoKey Equivalent (CSS override) | Notes |
|---|---|---|
| `.btn-primary` | Override `--bs-primary` | Maps to `--primary-500` |
| `.btn-outline-primary` | Override colors | Maps to LoKey "outlined" type |
| `.btn-secondary` | Override `--bs-secondary` | Maps to LoKey "tertiary" type |
| `.btn-danger` | Override `--bs-danger` | Maps to destructive actions |
| `.badge` | Replace with LoKeyChip markup | Bootstrap badges don't support color-mix |
| `.card` | Override `--bs-card-*` | Close enough with overrides |
| `.form-control` | Override font, border, radius | Matches LoKey Input spec |
| `.form-check-input` | Override colors | Matches LoKey Checkbox/Switch |
| `.nav-tabs` | Replace with LoKey Tabs | Bootstrap tabs look different |
| `.modal` | Override spacing, radius | Close with overrides |
| `.table` | Override font sizes, padding | Matches LoKey DataTable |
| `.alert` | Override colors per variant | Maps to LoKey Alert |

### 2.4 Bootstrap Button Override (Full)

```css
/* Make Bootstrap buttons look like LoKey */
.btn {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 500;
  font-size: 14px;
  border-radius: 6px !important;  /* NEVER pill */
  height: 36px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.15s ease;
  white-space: nowrap;
  box-shadow: none !important;  /* LoKey buttons have NO shadow */
}

.btn-primary {
  background-color: var(--primary-500, #1766D6);
  border-color: var(--primary-500, #1766D6);
  color: #FFFFFF;
}

.btn-primary:hover {
  background-color: var(--primary-600, #104EB8);
  border-color: var(--primary-600, #104EB8);
}

.btn-primary:disabled {
  background-color: color-mix(in srgb, var(--primary-500) 32%, transparent);
  border-color: transparent;
  color: color-mix(in srgb, #FFFFFF 60%, transparent);
}

.btn-outline-primary {
  background-color: var(--neutral-0, #FFFFFF);
  border-color: var(--primary-500, #1766D6);
  color: var(--primary-500, #1766D6);
}

.btn-outline-primary:hover {
  background-color: color-mix(in srgb, var(--primary-500) 4%, transparent);
  border-color: var(--primary-500, #1766D6);
  color: var(--primary-500, #1766D6);
}

/* Chip as badge override */
.badge.lokey-chip {
  border-radius: 20px !important;
  font-size: 12px;
  font-weight: 500;
  padding: 0 10px;
  height: 24px;
  display: inline-flex;
  align-items: center;
}
```

### 2.5 Form Control Override

```css
.form-control,
.form-select {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  height: 36px;
  border-radius: 6px;
  border-color: var(--border, #E4E9F2);
  background-color: var(--input-background, #FFFFFF);
  color: var(--foreground, #131A25);
  padding: 4px 12px;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--ring, #1766D6);
  box-shadow: 0 0 0 3px rgba(23, 102, 214, 0.25);
}

.form-control::placeholder {
  color: var(--muted-foreground, #484E56);
}

.form-control.is-invalid {
  border-color: var(--color-destructive-500, #E23318);
  box-shadow: 0 0 0 3px rgba(226, 51, 24, 0.2);
}

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--foreground, #131A25);
  margin-bottom: 6px;
}
```

---

## 3. Coexistence Rules (Tailwind + Bootstrap in Same Project)

### 3.1 Load Order

```html
<!-- 1. Bootstrap CSS (base) -->
<link href="bootstrap.min.css" rel="stylesheet" />

<!-- 2. LoKey token overrides -->
<link href="lokey-tokens.css" rel="stylesheet" />
<link href="lokey-bootstrap-overrides.css" rel="stylesheet" />

<!-- 3. Tailwind CSS (utilities — wins on specificity) -->
<link href="tailwind-output.css" rel="stylesheet" />
```

### 3.2 Prefix Tailwind (Avoid Conflicts)

If Bootstrap and Tailwind share a project, prefix Tailwind:

```javascript
// tailwind.config.js
module.exports = {
  prefix: 'tw-',
  // ...
};
```

Then: `tw-bg-card`, `tw-text-foreground`, `tw-rounded-md`, etc.

### 3.3 Migration Strategy

1. **New pages/components:** Always use Tailwind + LoKey tokens. Never add Bootstrap to new code.
2. **Existing pages:** Add LoKey variable overrides. Replace Bootstrap components with LoKey equivalents when modifying.
3. **Shared layout (sidebar, topbar):** Migrate first since they appear on every page.
4. **Target:** Remove Bootstrap dependency entirely. Each sprint, convert at least one page.

---

## 4. Lottie in Pure HTML/CSS Projects

For projects that don't use React (plain HTML, Bootstrap-only, or server-rendered):

```html
<!-- Load lottie-web from CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>

<!-- Loader container -->
<div id="page-loader" style="width: 64px; height: 64px; margin: 64px auto;" role="status" aria-label="Loading"></div>

<script>
  // Respect reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const anim = lottie.loadAnimation({
    container: document.getElementById('page-loader'),
    renderer: 'svg',
    loop: !prefersReduced,
    autoplay: !prefersReduced,
    path: '/assets/lottie/loader.json'
  });
</script>
```

### Standard Lottie Files (must be in project assets)

| File | Size | Loop | Usage |
|---|---|---|---|
| `loader.json` | 64×64 | yes | Full page loading |
| `spinner-inline.json` | 20×20 | yes | Button loading, inline fetches |
| `success-check.json` | 48×48 | no | Success confirmation |
| `error-shake.json` | 48×48 | no | Validation failure |
| `empty-state.json` | 80×80 | yes (subtle) | No data screens |
| `upload-progress.json` | 32×32 | yes | File upload indicator |

### CSS Animations That ARE Allowed

Only property transitions (not decorative animations):

```css
/* ✅ ALLOWED — state transitions */
.lokey-transition { transition: all 0.15s ease; }
.lokey-transition-colors { transition: color 0.15s, background-color 0.15s, border-color 0.15s; }
.lokey-transition-transform { transition: transform 0.2s ease; }

/* ✅ ALLOWED — skeleton pulse (ONLY exception) */
.lokey-skeleton { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ❌ FORBIDDEN — decorative animations */
@keyframes spin { /* NEVER */ }
@keyframes bounce { /* NEVER */ }
@keyframes fadeInUp { /* Use Lottie instead */ }
```

---

## 5. Accessibility in CSS

### 5.1 Focus Styles

```css
/* LoKey focus ring — apply to ALL interactive elements */
:focus-visible {
  outline: none;
  border-color: var(--ring, #1766D6);
  box-shadow: 0 0 0 3px rgba(23, 102, 214, 0.25);
}

/* Skip link */
.lokey-skip-link {
  position: absolute;
  left: -9999px;
  z-index: 9999;
  padding: 8px 16px;
  background: var(--primary-500);
  color: #FFFFFF;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}
.lokey-skip-link:focus {
  left: 16px;
  top: 16px;
}
```

### 5.2 Screen Reader Utilities

```css
/* Visually hidden but accessible to screen readers */
.lokey-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Visible only on focus (for skip links, keyboard nav) */
.lokey-sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 8px 16px;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### 5.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 5.4 High Contrast Mode

```css
@media (prefers-contrast: high) {
  :root {
    --border: rgba(0, 0, 0, 0.5);
    --muted-foreground: rgba(50, 50, 50, 1);
  }
}
```

---

## 6. Critical Rules for AI Code Generation (Tailwind + Bootstrap)

1. **Tailwind is primary.** New code always uses Tailwind. Bootstrap only for legacy.
2. **Never mix Tailwind color utilities with Bootstrap color utilities** in the same element.
3. **Always use LoKey CSS variables** — even in Bootstrap projects, reference `var(--primary-500)` not `$primary`.
4. **color-mix() is the tinting method.** Not `opacity-*`, not Bootstrap's `bg-opacity`, not `rgba()` with hardcoded values.
5. **Button radius = 6px always.** In Bootstrap: `border-radius: 6px !important`. In Tailwind: `rounded-md`. Never `rounded-pill`.
6. **Chip radius = 20px always.** In Bootstrap: `border-radius: 20px !important`. In Tailwind: `rounded-[20px]`.
7. **Lottie for all animations.** In Bootstrap projects, use `lottie-web` from CDN. Never CSS `@keyframes` for loaders.
8. **Font is Plus Jakarta Sans everywhere.** Override both `--bs-body-font-family` and Tailwind's `font-sans`.
9. **No Bootstrap icons, no Font Awesome.** All icons come from lucide. In non-React: use inline SVGs matching lucide's viewBox and stroke attributes.
10. **Shadow rules apply equally.** No shadows on buttons. No shadows on cards at rest. `elevation-sm` on hover, `elevation-md` on modals.

---

*This file extends the parent `LOKEY_DESIGN_SYSTEM_GUIDELINES.md`. For token values, color hex codes, spacing scales, and complete component specs, always refer to the parent document.*
