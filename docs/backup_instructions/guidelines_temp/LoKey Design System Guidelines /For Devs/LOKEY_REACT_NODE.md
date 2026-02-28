# LoKey Design System — React / Node.js Implementation Guide

> **Version:** 2.0.0
> **Last Updated:** February 2026
> **Parent Document:** `LOKEY_DESIGN_SYSTEM_GUIDELINES.md` (source of truth for all tokens)
> **Stack:** React 18+, Next.js, TypeScript (strict), Tailwind CSS v4, shadcn/ui (Radix), lucide-react
> **Purpose:** This file provides React-specific patterns, import conventions, component usage, and implementation rules. Every token and spec comes from the parent guidelines. **This file shows HOW to build in React — the parent doc defines WHAT to build.**

---

## 1. Project Setup

### 1.1 Required Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "next": "^14.0.0",
    "tailwindcss": "^4.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "latest",
    "lottie-react": "^2.4.0",
    "date-fns": "^3.0.0",
    "recharts": "^2.0.0",
    "@radix-ui/react-checkbox": "latest",
    "@radix-ui/react-switch": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-tooltip": "latest",
    "@radix-ui/react-progress": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-popover": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-accordion": "latest",
    "sonner": "latest"
  }
}
```

### 1.2 Font Loading (Next.js)

```tsx
// app/layout.tsx
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
});

export default function RootLayout({ children }) {
  return (
    <html className={plusJakarta.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

```css
/* In tailwind config or CSS */
body {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
```

### 1.3 Utility Function

```tsx
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 1.4 CSS Variables

Paste the complete `:root` block from `LOKEY_DESIGN_SYSTEM_GUIDELINES.md` Section 54 into your global CSS file (e.g., `globals.css` or `theme.css`), imported before Tailwind layers.

---

## 2. Import Conventions

### 2.1 Standard Import Order

```tsx
// 1. React / Next.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// 2. Icons — ALWAYS from lucide-react
import {
  Plus, Download, ChevronDown, ChevronRight, Search, X,
  Bell, FileText, Eye, Copy, Lock, User, Save, Send,
  ArrowLeft, Calendar, Check, Info, Pencil, AlertCircle,
  AlertTriangle, CheckCircle, Upload,
} from 'lucide-react';

// 3. Lottie — for ALL animations except skeleton pulse
import Lottie from 'lottie-react';
import loaderAnimation from '@/assets/lottie/loader.json';
import spinnerInline from '@/assets/lottie/spinner-inline.json';
import successCheck from '@/assets/lottie/success-check.json';
import emptyStateAnim from '@/assets/lottie/empty-state.json';

// 4. LoKey custom components
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

// 5. shadcn/ui primitives (skinned with LoKey tokens)
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// 6. Types
import type { RopaEntry, TemplateColumn } from '@/types';
```

### 2.2 NEVER Import These

```tsx
// ❌ FORBIDDEN
import { FaSearch } from 'react-icons/fa';       // Wrong icon library
import { HiOutlineBell } from 'react-icons/hi';  // Wrong icon library
import { MdDelete } from 'react-icons/md';       // Wrong icon library
import spinner from './spinner.css';               // No CSS animations for loaders
import '@/styles/animations.css';                  // No custom @keyframes
```

---

## 3. Component Usage Patterns

### 3.1 Page Layout Pattern

Every page follows this structure:

```tsx
export default function ProductRoPA() {
  return (
    <Layout currentPage="product-ropa">
      <TopBar productName="Privacy Governance" />
      <PageHeader
        breadcrumbs={[
          { label: 'RoPA', onClick: () => navigate('master') },
          { label: 'Product RoPA' },
        ]}
        title="Processing Activities"
        entryCount={entries.length}
      />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Toolbar: SearchBar + FilterDropdown + ActionButton */}
        {/* Content: DataTable or Cards */}
      </main>
    </Layout>
  );
}
```

### 3.2 Toolbar Pattern

```tsx
<div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-3">
    <SearchBar
      value={search}
      onChange={setSearch}
      placeholder="Search entries..."
    />
    <FilterDropdown
      label="Status"
      options={statusOptions}
      value={statusFilter}
      onChange={setStatusFilter}
    />
    <FilterDropdown
      label="Business Unit"
      options={buOptions}
      value={buFilter}
      onChange={setBuFilter}
    />
  </div>
  <div className="flex items-center gap-2">
    <ActionButton variant="secondary" icon={Download} onClick={handleExport}>
      Export
    </ActionButton>
    <ActionButton variant="primary" icon={Plus} onClick={handleCreate}>
      Add Entry
    </ActionButton>
  </div>
</div>
```

### 3.3 Dashboard Stats Row

```tsx
<div className="grid grid-cols-4 gap-4 mb-6">
  <StatCard
    label="Total Entries"
    value="234"
    icon={<FileText className="w-[16px] h-[16px] text-[color:var(--primary-500)]" />}
    iconColor="var(--primary-500)"
  />
  <StatCard
    label="Published"
    value="189"
    icon={<CheckCircle className="w-[16px] h-[16px] text-[color:var(--color-success-700)]" />}
    iconColor="var(--color-success-500)"
  />
  {/* ... */}
</div>
```

### 3.4 Modal Pattern

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-[600px] rounded-[var(--radius-lg)] p-6 shadow-[var(--elevation-sm)]">
    <DialogHeader>
      <DialogTitle className="text-[20px] font-[700]">
        Create New Template
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-4 py-4">
      {/* Form fields */}
    </div>

    <DialogFooter className="flex justify-end gap-3">
      <LoKeyButton type="tertiary" size="m" onClick={() => setIsOpen(false)}>
        Cancel
      </LoKeyButton>
      <LoKeyButton type="primary" size="m" onClick={handleCreate}>
        Create
      </LoKeyButton>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 3.5 Confirmation Dialog Pattern (Destructive)

```tsx
<Dialog open={showConfirm} onOpenChange={setShowConfirm}>
  <DialogContent className="max-w-[440px] rounded-[var(--radius-lg)] p-6">
    <div className="flex flex-col items-center text-center">
      <div className="w-[48px] h-[48px] rounded-full bg-[color-mix(in_srgb,var(--color-destructive-500)_8%,transparent)] flex items-center justify-center mb-4">
        <AlertTriangle className="w-[24px] h-[24px] text-[color:var(--color-destructive-500)]" />
      </div>
      <h3 className="text-[18px] font-[600] mb-2">Delete this entry?</h3>
      <p className="text-[14px] text-[color:var(--muted-foreground)]">
        This action cannot be undone.
      </p>
    </div>
    <DialogFooter className="flex justify-end gap-3 mt-6">
      <LoKeyButton type="tertiary" size="m" onClick={() => setShowConfirm(false)}>
        Cancel
      </LoKeyButton>
      <button
        className="h-[36px] px-4 rounded-[var(--radius-md)] bg-[var(--color-destructive-500)] text-[color:var(--neutral-0)] text-[14px] font-[500] hover:bg-[var(--color-destructive-600)] transition-all"
        onClick={handleDelete}
      >
        Delete
      </button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 4. Lottie Animation Usage

### 4.1 Page Loader

```tsx
function PageLoader() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="flex items-center justify-center py-16" role="status" aria-label="Loading">
      <Lottie
        animationData={loaderAnimation}
        loop={!prefersReduced}
        autoplay={!prefersReduced}
        style={{ width: 64, height: 64 }}
      />
    </div>
  );
}
```

### 4.2 Button with Loading State

```tsx
<LoKeyButton type="primary" size="m" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Lottie
        animationData={spinnerInline}
        loop
        autoplay
        style={{ width: 20, height: 20 }}
      />
      Saving...
    </>
  ) : (
    <>
      <Save className="w-[16px] h-[16px]" />
      Save Draft
    </>
  )}
</LoKeyButton>
```

### 4.3 Empty State

```tsx
function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center py-16 max-w-[400px] mx-auto">
      <Lottie
        animationData={emptyStateAnim}
        loop
        autoplay
        style={{ width: 80, height: 80 }}
      />
      <h3 className="text-[16px] font-[600] text-[color:var(--foreground)] mt-4">{title}</h3>
      <p className="text-[14px] text-[color:var(--muted-foreground)] text-center max-w-[300px] mt-2">
        {description}
      </p>
      {onAction && (
        <LoKeyButton type="primary" size="m" onClick={onAction} className="mt-6">
          <Plus className="w-[16px] h-[16px]" />
          {actionLabel}
        </LoKeyButton>
      )}
    </div>
  );
}
```

### 4.4 Reduced Motion Hook

```tsx
function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
```

---

## 5. Form Patterns

### 5.1 Standard Form Field

```tsx
interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  helper?: string;
  children: React.ReactNode;
}

function FormField({ label, name, required, error, helper, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-[12px] font-[500] text-[color:var(--foreground)]">
        {label}
        {required && <span className="text-[color:var(--color-destructive-500)] ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="text-[12px] text-[color:var(--color-destructive-500)] flex items-center gap-1" role="alert">
          <AlertCircle className="w-[12px] h-[12px] flex-shrink-0" />
          {error}
        </p>
      )}
      {helper && !error && (
        <p className="text-[12px] text-[color:var(--muted-foreground)]">{helper}</p>
      )}
    </div>
  );
}
```

### 5.2 Usage

```tsx
<FormField label="Processing Activity Name" name="name" required error={errors.name}>
  <Input
    id="name"
    name="name"
    value={formData.name}
    onChange={(e) => setField('name', e.target.value)}
    placeholder="Enter the name of the processing activity"
    aria-required="true"
    aria-invalid={!!errors.name}
    aria-describedby={errors.name ? 'name-error' : undefined}
  />
</FormField>
```

---

## 6. Table Skeleton Loading

```tsx
function TableSkeleton({ columns = 5, rows = 5 }) {
  return (
    <div className="border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 px-3 py-3 border-b border-[var(--border)]">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded-md" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 px-3 py-3 border-b border-[var(--border)] last:border-b-0">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-4 flex-1 rounded-md" />
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

## 7. Date Formatting

```tsx
import { format, parseISO } from 'date-fns';

// Display format: DD MMM YYYY
export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy'); // "18 Feb 2026"
}

// Display format with time: DD MMM YYYY, HH:mm
export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy, HH:mm'); // "18 Feb 2026, 14:30"
}
```

---

## 8. TypeScript Patterns

### 8.1 Common Types

```typescript
// Status types — must match StatusChip config
type RopaStatus = 'draft' | 'published' | 'in-review' | 'change-requested';
type DpiaStatus = 'not-required' | 'not-initiated' | 'initiated' | 'in-progress' | 'under-review' | 'completed';
type CombinedStatus = RopaStatus | DpiaStatus;

// Button types — match LoKeyButton props exactly
type ButtonType = 'primary' | 'secondary' | 'tertiary' | 'outlined' | 'ghost';
type ButtonSize = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

// Chip types — match LoKeyChip props exactly
type ChipStyle = 'filled' | 'accent' | 'outline';
type ChipType = 'primary' | 'extra' | 'neutral' | 'success' | 'error' | 'info';
type ChipSize = 's' | 'm' | 'l' | 'xl';

// Role types
type UserRole = 'maker' | 'checker' | 'admin';
```

### 8.2 Component Props Pattern

Always define explicit interfaces for component props:

```typescript
interface PageHeaderProps {
  breadcrumbs: Array<{ label: string; onClick?: () => void }>;
  title: string;
  entryCount?: number;
}
```

---

## 9. Critical Rules for AI Code Generation (React)

1. **TypeScript strict mode.** No `any` types. Define explicit interfaces.
2. **Icons: ONLY `lucide-react`.** Never react-icons, heroicons, or inline SVGs when a lucide icon exists.
3. **Lottie for ALL animations** except Skeleton pulse. Import from `lottie-react`.
4. **CSS variables for all tokens.** Never hardcode `#1766D6` — use `var(--primary-500)`.
5. **color-mix() for tinted backgrounds.** Never `opacity-50` or `bg-blue-500/10`.
6. **shadcn/ui as base.** Don't rebuild Input, Checkbox, Switch, Tabs, Dialog from scratch. Use the skinned shadcn primitives.
7. **Accessibility first.** Every interactive element: proper HTML element, focus ring, aria attributes, keyboard handler.
8. **Button radius = 6px.** Never `rounded-full` on buttons. Chips = `20px` (pill), always.
9. **Import from correct paths.** LoKey components from `@/app/components/`, shadcn from `@/components/ui/`.
10. **Form validation:** blur on first touch, re-validate on change after error, `aria-invalid` + `aria-describedby`.

---

*This file extends the parent `LOKEY_DESIGN_SYSTEM_GUIDELINES.md`. For token values, color hex codes, spacing scales, and complete component specs, always refer to the parent document.*
