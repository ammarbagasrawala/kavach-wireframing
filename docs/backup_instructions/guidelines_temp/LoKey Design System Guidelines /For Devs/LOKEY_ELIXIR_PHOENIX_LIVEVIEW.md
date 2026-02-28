# LoKey Design System — Elixir / Phoenix / LiveView Implementation Guide

> **Version:** 2.0.0
> **Last Updated:** February 2026
> **Parent Document:** `LOKEY_DESIGN_SYSTEM_GUIDELINES.md` (source of truth for all tokens)
> **Stack:** Elixir, Phoenix Framework, Phoenix LiveView, Tailwind CSS
> **Purpose:** This file translates LoKey design tokens and component specs into Phoenix/LiveView-compatible patterns. Every token, color, spacing, and component rule comes from the parent guidelines. **This file does NOT redefine tokens — it shows how to implement them in HEEx templates, LiveView components, and Phoenix function components.**

---

## 1. Project Setup

### 1.1 Font Loading

In `root.html.heex` or your layout:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

### 1.2 CSS Variables

Paste the full `:root` block from `LOKEY_DESIGN_SYSTEM_GUIDELINES.md` Section 54 into your `app.css` or a dedicated `lokey-tokens.css` file imported before Tailwind layers.

```css
/* assets/css/lokey-tokens.css */
@import "tailwindcss/base";

:root {
  /* Paste all tokens from Section 54 of the parent doc */
}

@import "tailwindcss/components";
@import "tailwindcss/utilities";
```

### 1.3 Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./lib/*_web/**/*.*ex",
    "./lib/*_web/**/*.heex",
    "../deps/live_view/**/*.ex",
    "./assets/js/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",   // --radius-sm
        md: "6px",   // --radius-md
        lg: "8px",   // --radius-lg
        xl: "12px",  // --radius-xl
      },
      fontSize: {
        "4xl": "52px",
        "3xl": "40px",
        "2xl": "36px",
        "xl": "28px",
        "base": "14px",
        "sm": "12px",
      },
    },
  },
};
```

### 1.4 Lottie Setup for LiveView

Install `lottie-web` in your JS bundle:

```bash
cd assets && npm install lottie-web
```

Create a LiveView JS hook:

```javascript
// assets/js/hooks/lottie_player.js
import lottie from "lottie-web";

export const LottiePlayer = {
  mounted() {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.animation = lottie.loadAnimation({
      container: this.el,
      renderer: "svg",
      loop: this.el.dataset.loop === "true" && !prefersReduced,
      autoplay: !prefersReduced,
      path: this.el.dataset.src,
    });
  },
  updated() {
    // Handle dynamic state changes
    if (this.el.dataset.play === "false") {
      this.animation?.stop();
    }
  },
  destroyed() {
    this.animation?.destroy();
  },
};
```

Register in `app.js`:

```javascript
import { LottiePlayer } from "./hooks/lottie_player";

let liveSocket = new LiveSocket("/live", Socket, {
  hooks: { LottiePlayer },
  // ...
});
```

---

## 2. Function Components (Phoenix Component Pattern)

LoKey components translate to Phoenix function components. Place these in a shared module:

```elixir
# lib/my_app_web/components/lokey_components.ex
defmodule MyAppWeb.LoKeyComponents do
  use Phoenix.Component
  import MyAppWeb.CoreComponents  # For built-in Phoenix components

  # All LoKey function components go here
end
```

Import in your `my_app_web.ex`:

```elixir
defp html_helpers do
  quote do
    import MyAppWeb.LoKeyComponents
    # ...
  end
end
```

---

## 3. Component Implementations

### 3.1 LoKeyButton

```elixir
@doc """
LoKey button component.

## Attributes
  * `:type` - Visual variant: "primary" | "secondary" | "tertiary" | "outlined" | "ghost". Default: "primary"
  * `:size` - Size: "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl". Default: "m"
  * `:disabled` - Boolean. Default: false
  * `:class` - Additional CSS classes

## Slots
  * `:left_icon` - Icon slot before text
  * `:right_icon` - Icon slot after text
  * `:inner_block` - Button label
"""
attr :type, :string, default: "primary", values: ~w(primary secondary tertiary outlined ghost)
attr :size, :string, default: "m", values: ~w(xxs xs s m l xl xxl)
attr :disabled, :boolean, default: false
attr :class, :string, default: ""
attr :rest, :global

slot :left_icon
slot :right_icon
slot :inner_block, required: true

def lokey_button(assigns) do
  ~H"""
  <button
    class={[
      "inline-flex items-center justify-center whitespace-nowrap transition-all font-[var(--font-weight-medium)] rounded-[var(--radius-md)]",
      button_size_classes(@size),
      button_type_classes(@type),
      @disabled && "cursor-not-allowed",
      @class
    ]}
    disabled={@disabled}
    {@rest}
  >
    <%= render_slot(@left_icon) %>
    <%= render_slot(@inner_block) %>
    <%= render_slot(@right_icon) %>
  </button>
  """
end

defp button_size_classes("xxs"), do: "h-[24px] px-3 text-[length:var(--text-sm)] gap-1"
defp button_size_classes("xs"),  do: "h-[28px] px-3 text-[13px] gap-1.5"
defp button_size_classes("s"),   do: "h-[32px] px-4 text-[13px] gap-1.5"
defp button_size_classes("m"),   do: "h-[36px] px-4 text-[length:var(--text-base)] gap-2"
defp button_size_classes("l"),   do: "h-[40px] px-5 text-[length:var(--text-base)] gap-2"
defp button_size_classes("xl"),  do: "h-[44px] px-5 text-[15px] gap-2"
defp button_size_classes("xxl"), do: "h-[48px] px-6 text-[15px] gap-2"

defp button_type_classes("primary") do
  "bg-[var(--primary-500)] text-[color:var(--neutral-0)] hover:bg-[var(--primary-600)] active:opacity-90 disabled:bg-[color-mix(in_srgb,var(--primary-500)_32%,transparent)] disabled:text-[color-mix(in_srgb,var(--neutral-0)_60%,transparent)]"
end

defp button_type_classes("secondary") do
  "bg-[color-mix(in_srgb,var(--primary-500)_8%,transparent)] text-[color:var(--primary-500)] border border-[color-mix(in_srgb,var(--primary-500)_50%,transparent)] hover:bg-[color-mix(in_srgb,var(--primary-500)_20%,transparent)] disabled:bg-[color-mix(in_srgb,var(--primary-500)_4%,transparent)] disabled:text-[color-mix(in_srgb,var(--primary-500)_40%,transparent)] disabled:border-[color-mix(in_srgb,var(--primary-500)_20%,transparent)]"
end

defp button_type_classes("tertiary") do
  "bg-[var(--neutral-0)] text-[color:var(--neutral-900)] border border-[var(--neutral-900)] hover:bg-[color-mix(in_srgb,var(--neutral-900)_4%,transparent)] disabled:bg-transparent disabled:text-[color-mix(in_srgb,var(--neutral-900)_40%,transparent)] disabled:border-[color-mix(in_srgb,var(--neutral-900)_20%,transparent)]"
end

defp button_type_classes("outlined") do
  "bg-[var(--neutral-0)] text-[color:var(--primary-500)] border border-[var(--primary-500)] hover:bg-[color-mix(in_srgb,var(--primary-500)_4%,transparent)] disabled:bg-transparent disabled:text-[color-mix(in_srgb,var(--primary-500)_40%,transparent)] disabled:border-[color-mix(in_srgb,var(--primary-500)_20%,transparent)]"
end

defp button_type_classes("ghost") do
  "bg-transparent text-[color:var(--primary-500)] hover:bg-[color-mix(in_srgb,var(--primary-500)_4%,transparent)] disabled:text-[color-mix(in_srgb,var(--primary-500)_40%,transparent)]"
end
```

### 3.2 LoKeyChip

```elixir
attr :style, :string, default: "accent", values: ~w(filled accent outline)
attr :type, :string, default: "primary", values: ~w(primary extra neutral success error info)
attr :size, :string, default: "m", values: ~w(s m l xl)
attr :class, :string, default: ""

slot :left_icon
slot :right_icon
slot :inner_block, required: true

def lokey_chip(assigns) do
  ~H"""
  <span class={[
    "inline-flex items-center justify-center whitespace-nowrap rounded-[20px] font-[var(--font-weight-medium)] !text-[length:var(--text-sm)]",
    chip_size_classes(@size),
    chip_style_classes(@style, @type),
    @class
  ]}>
    <%= render_slot(@left_icon) %>
    <%= render_slot(@inner_block) %>
    <%= render_slot(@right_icon) %>
  </span>
  """
end

defp chip_size_classes("s"),  do: "h-[24px] px-2.5 gap-1"
defp chip_size_classes("m"),  do: "h-[28px] px-3 gap-1.5"
defp chip_size_classes("l"),  do: "h-[32px] px-3 gap-1.5"
defp chip_size_classes("xl"), do: "h-[36px] px-4 gap-2"

# Accent style (default) — most common
defp chip_style_classes("accent", "primary"),
  do: "bg-[color-mix(in_srgb,var(--primary-500)_12%,transparent)] text-[color:var(--primary-600)] border border-[color-mix(in_srgb,var(--primary-500)_20%,transparent)]"
defp chip_style_classes("accent", "neutral"),
  do: "bg-[color-mix(in_srgb,var(--neutral-900)_8%,transparent)] text-[color:var(--neutral-900)] border border-[color-mix(in_srgb,var(--neutral-900)_12%,transparent)]"
defp chip_style_classes("accent", "success"),
  do: "bg-[color-mix(in_srgb,var(--color-success-700)_12%,transparent)] text-[color:var(--color-success-700)] border border-[color-mix(in_srgb,var(--color-success-700)_20%,transparent)]"
defp chip_style_classes("accent", "extra"),
  do: "bg-[color-mix(in_srgb,var(--color-warning-600)_12%,transparent)] text-[color:var(--color-warning-600)] border border-[color-mix(in_srgb,var(--color-warning-600)_20%,transparent)]"
defp chip_style_classes("accent", "error"),
  do: "bg-[color-mix(in_srgb,var(--color-destructive-600)_12%,transparent)] text-[color:var(--color-destructive-600)] border border-[color-mix(in_srgb,var(--color-destructive-600)_20%,transparent)]"
defp chip_style_classes("accent", "info"),
  do: "bg-[color-mix(in_srgb,var(--color-info-600)_12%,transparent)] text-[color:var(--color-info-600)] border border-[color-mix(in_srgb,var(--color-info-600)_20%,transparent)]"
defp chip_style_classes(_, _), do: "" # Fallback
```

### 3.3 StatusChip

```elixir
@status_map %{
  "draft"            => %{label: "Draft",            type: "neutral"},
  "published"        => %{label: "Published",        type: "success"},
  "in-review"        => %{label: "In Review",        type: "extra"},
  "change-requested" => %{label: "Change Requested", type: "error"},
  "not-required"     => %{label: "Not Required",     type: "neutral"},
  "not-initiated"    => %{label: "Not Initiated",    type: "extra"},
  "initiated"        => %{label: "Initiated",        type: "info"},
  "in-progress"      => %{label: "In Progress",      type: "primary"},
  "under-review"     => %{label: "Under Review",     type: "extra"},
  "completed"        => %{label: "Completed",        type: "success"},
}

attr :status, :string, required: true
attr :class, :string, default: ""

def status_chip(assigns) do
  config = Map.get(@status_map, assigns.status, %{label: assigns.status, type: "neutral"})
  assigns = assign(assigns, :config, config)

  ~H"""
  <.lokey_chip style="accent" type={@config.type} size="s" class={@class}>
    {@config.label}
  </.lokey_chip>
  """
end
```

### 3.4 StatCard

```elixir
attr :label, :string, required: true
attr :value, :string, required: true
attr :icon_color, :string, default: "var(--primary-500)"

slot :icon, required: true

def stat_card(assigns) do
  ~H"""
  <div class="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4 hover:shadow-md transition-all">
    <div class="flex items-start gap-3">
      <div
        class="w-[32px] h-[32px] rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0"
        style={"background: color-mix(in srgb, #{@icon_color} 8%, transparent);"}
      >
        <%= render_slot(@icon) %>
      </div>
      <div>
        <p class="text-[12px] font-[500] text-[color:var(--muted-foreground)] uppercase tracking-wide mb-1">
          {@label}
        </p>
        <p class="text-[32px] font-[700] text-[color:var(--foreground)] leading-[1.2]">
          {@value}
        </p>
      </div>
    </div>
  </div>
  """
end
```

### 3.5 SearchBar

```elixir
attr :value, :string, default: ""
attr :placeholder, :string, default: "Search..."
attr :width, :string, default: "350px"
attr :class, :string, default: ""
attr :rest, :global

def search_bar(assigns) do
  ~H"""
  <div class={["relative", @class]} style={"width: #{@width};"}>
    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[color-mix(in_srgb,var(--neutral-900)_50%,transparent)] pointer-events-none flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
    <input
      type="text"
      value={@value}
      placeholder={@placeholder}
      class="w-full h-[36px] pl-9 pr-8 rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--neutral-900)_20%,transparent)] bg-[var(--neutral-0)] text-[12px] font-[500] text-[color:var(--foreground)] placeholder:text-[color-mix(in_srgb,var(--neutral-900)_50%,transparent)] outline-none focus:border-[var(--ring)] focus:ring-[3px] focus:ring-[var(--ring)]/50 transition-all"
      {@rest}
    />
    <button
      :if={@value != ""}
      class="absolute right-2.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] flex items-center justify-center rounded-full hover:bg-[color-mix(in_srgb,var(--neutral-900)_8%,transparent)]"
      aria-label="Clear search"
    >
      <svg class="w-[12px] h-[12px] text-[color:var(--muted-foreground)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
      </svg>
    </button>
  </div>
  """
end
```

### 3.6 Lottie Loader (LiveView)

```elixir
attr :src, :string, required: true
attr :width, :integer, default: 64
attr :height, :integer, default: 64
attr :loop, :boolean, default: true

def lottie_loader(assigns) do
  ~H"""
  <div
    id={"lottie-#{System.unique_integer([:positive])}"}
    phx-hook="LottiePlayer"
    data-src={@src}
    data-loop={to_string(@loop)}
    style={"width: #{@width}px; height: #{@height}px;"}
    role="status"
    aria-label="Loading"
  />
  """
end
```

Usage in templates:

```html
<!-- Page loader -->
<div class="flex items-center justify-center py-16">
  <.lottie_loader src="/assets/lottie/loader.json" width={64} height={64} />
</div>

<!-- Inline button spinner -->
<.lokey_button type="primary" size="m" disabled>
  <:left_icon>
    <.lottie_loader src="/assets/lottie/spinner-inline.json" width={20} height={20} />
  </:left_icon>
  Saving...
</.lokey_button>

<!-- Empty state -->
<div class="flex flex-col items-center py-16">
  <.lottie_loader src="/assets/lottie/empty-state.json" width={80} height={80} />
  <h3 class="text-[16px] font-[600] text-[color:var(--foreground)] mt-4">No processing activities yet</h3>
  <p class="text-[14px] text-[color:var(--muted-foreground)] text-center max-w-[300px] mt-2">
    Create your first RoPA entry to start documenting processing activities.
  </p>
  <.lokey_button type="primary" size="m" class="mt-6">
    Create Entry
  </.lokey_button>
</div>
```

---

## 4. LiveView-Specific Patterns

### 4.1 Form Validation with LoKey Styling

```elixir
def form_field(assigns) do
  ~H"""
  <div class="flex flex-col gap-1.5">
    <label class="text-[12px] font-[500] text-[color:var(--foreground)]">
      {@label}
      <span :if={@required} class="text-[color:var(--color-destructive-500)]">*</span>
    </label>
    <input
      type={@type}
      name={@name}
      value={@value}
      class={[
        "h-[36px] px-3 rounded-[var(--radius-md)] border bg-[var(--input-background)] text-[14px] font-[400] outline-none transition-all",
        "focus:border-[var(--ring)] focus:ring-[3px] focus:ring-[var(--ring)]/50",
        "placeholder:text-[color:var(--muted-foreground)]",
        @error && "border-[var(--color-destructive-500)] ring-[var(--color-destructive-500)]/20 ring-[3px]",
        !@error && "border-[var(--border)]"
      ]}
      aria-invalid={@error && "true"}
      aria-required={@required && "true"}
      aria-describedby={@error && "#{@name}-error"}
    />
    <p :if={@error} id={"#{@name}-error"} class="text-[12px] text-[color:var(--color-destructive-500)] flex items-center gap-1" role="alert">
      <svg class="w-[12px] h-[12px] flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
      </svg>
      {@error}
    </p>
    <p :if={@helper && !@error} class="text-[12px] text-[color:var(--muted-foreground)]">
      {@helper}
    </p>
  </div>
  """
end
```

### 4.2 LiveView Loading States

```elixir
# In your LiveView
def render(assigns) do
  ~H"""
  <div :if={@loading} class="flex items-center justify-center py-16">
    <.lottie_loader src="/assets/lottie/loader.json" />
  </div>

  <div :if={!@loading && @entries == []} class="flex flex-col items-center py-16">
    <.lottie_loader src="/assets/lottie/empty-state.json" width={80} height={80} />
    <h3 class="text-[16px] font-[600] text-[color:var(--foreground)] mt-4">No entries found</h3>
  </div>

  <div :if={!@loading && @entries != []}>
    <!-- Table / content -->
  </div>
  """
end
```

### 4.3 phx-click with Disabled States

```html
<.lokey_button
  type="primary"
  size="m"
  phx-click="submit_for_review"
  phx-disable-with="Submitting..."
  disabled={!@form_valid}
>
  Submit for Review
</.lokey_button>
```

---

## 5. Icon Usage in LiveView

Since `lucide-react` is React-specific, in LiveView use **inline SVGs from lucide.dev** or a helper:

```elixir
# Option 1: SVG component helper
def lucide_icon(assigns) do
  ~H"""
  <svg
    class={["flex-shrink-0", @class]}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden={@decorative && "true"}
    aria-label={!@decorative && @label}
  >
    <%= raw(@path) %>
  </svg>
  """
end
```

Alternatively, use the `lucide_icons` Hex package if available, or maintain a module with SVG path data for commonly used icons.

### Standard Icon Sizes (in Tailwind classes)

| Context | Class |
|---|---|
| Inside buttons/chips | `w-[16px] h-[16px]` |
| Sidebar nav | `w-[18px] h-[18px]` |
| Breadcrumb chevrons | `w-[14px] h-[14px]` |
| Small utility | `w-[12px] h-[12px]` |
| StatCard container | `w-[16px] h-[16px]` inside 32×32 div |

---

## 6. Accessibility in LiveView

### 6.1 Live Regions

```html
<!-- Announce dynamic content changes -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  <%= @status_message %>
</div>
```

### 6.2 Focus Management on Navigation

```javascript
// In app.js — restore focus after LiveView patch
let liveSocket = new LiveSocket("/live", Socket, {
  hooks: {
    LottiePlayer,
    RestoreFocus: {
      updated() {
        const target = this.el.dataset.focusTarget;
        if (target) {
          document.getElementById(target)?.focus();
        }
      }
    }
  }
});
```

### 6.3 Skip Navigation Link

```html
<!-- In root layout, first element in body -->
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:bg-[var(--primary-500)] focus:text-[color:var(--neutral-0)] focus:px-4 focus:py-2 focus:rounded-[var(--radius-md)]">
  Skip to main content
</a>
```

---

## 7. Date Formatting

```elixir
# In a helper module
def format_date(nil), do: "—"
def format_date(%Date{} = date) do
  Calendar.strftime(date, "%d %b %Y")  # 18 Feb 2026
end

def format_datetime(nil), do: "—"
def format_datetime(%NaiveDateTime{} = dt) do
  Calendar.strftime(dt, "%d %b %Y, %H:%M")  # 18 Feb 2026, 14:30
end
```

---

## 8. Critical Rules for AI Code Generation (LiveView)

1. **Always use HEEx templates** with function components, not string interpolation.
2. **Never use React patterns** (useState, useEffect). Use LiveView assigns and handle_event.
3. **Always use `phx-click`** for button actions, not JavaScript `onclick`.
4. **Use `phx-hook`** for JavaScript-dependent behavior (Lottie, dropdowns, focus traps).
5. **Lottie for all animations** — implemented via the `LottiePlayer` hook.
6. **Same CSS variable tokens** — the CSS is shared across React and LiveView since both use Tailwind.
7. **Icon SVGs must match lucide** — same viewBox (0 0 24 24), same stroke attributes.
8. **All form inputs must have associated labels** for accessibility.
9. **Use `aria-live` regions** for dynamic content announcements.
10. **Never inline SVG icons larger than necessary** — maintain a shared icon module.

---

*This file extends the parent `LOKEY_DESIGN_SYSTEM_GUIDELINES.md`. For token values, color hex codes, spacing scales, and complete component specs, always refer to the parent document.*
