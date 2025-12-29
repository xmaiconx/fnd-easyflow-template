# FND QuickLaunch - Design System Foundations

Design System para aplicações SaaS modernas. Mobile-first como princípio central: todo design começa em 320px e escala para cima. Inspirado nos templates premium do Envato (Metronic, Vuexy, Trezo) com foco em dark mode como experiência primária, microinteractions sutis e interfaces data-driven.

**Stack Principal:** React 18 + Tailwind CSS v3 + shadcn/ui + Motion (Framer) + Recharts + TanStack (Table, Query, Router) + Lucide Icons

**Filosofia:** Minimalismo refinado com toques de sofisticação. Menos elementos, mais clareza. Cada pixel tem propósito.

---

## Spec (Token-Efficient)

### Meta
{"version":"1.0.0","generated":"2025-12-21","inspiration":["Metronic","Vuexy","Trezo","StrikingDash"],"stack":"React+TailwindV3+shadcn+Motion+Recharts+TanStack"}

---

## Breakpoints

Design SEMPRE começa no mobile (320px). Classes sem prefixo = mobile. Prefixos adicionam comportamento para telas maiores.

```
{"mobile":"320px-767px (default)","tablet":"768px-1023px (md:)","desktop":"1024px-1279px (lg:)","wide":"1280px+ (xl:)"}
```

### Responsive Pattern
```tsx
// CORRETO: Mobile-first
<div className="p-4 md:p-6 lg:p-8">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
<div className="text-sm md:text-base">

// ERRADO: Desktop-first (NUNCA fazer)
<div className="p-8 sm:p-4">
```

---

## Color System

Paleta sofisticada com dark mode como padrão. Cores semânticas para consistência e acessibilidade.

### REGRA CRÍTICA: Contraste de Foreground
**SEMPRE use o foreground correto para cada background:**
- `bg-primary` → `text-primary-foreground` (branco)
- `bg-secondary` → `text-secondary-foreground` (preto)
- `bg-accent` → `text-accent-foreground` (branco)
- `bg-destructive` → `text-destructive-foreground` (branco)

**NUNCA:**
- ❌ `bg-primary text-primary` (azul + azul = invisível)
- ❌ `bg-secondary text-secondary` (cinza + cinza = invisível)

### Brand Colors
```
{"brand":{"primary":"hsl(210, 100%, 56%)","primaryHover":"hsl(210, 100%, 51%)","secondary":"hsl(200, 90%, 48%)","secondaryHover":"hsl(200, 90%, 43%)","accent":"hsl(200, 90%, 48%)","accentHover":"hsl(200, 90%, 43%)"}}
```

### Semantic Colors
```
{"semantic":{"success":"hsl(142, 76%, 36%)","warning":"hsl(38, 92%, 50%)","destructive":"hsl(0, 84%, 60%)","info":"hsl(200, 98%, 39%)"}}
```

### Light Theme
```css
:root {
  /* Backgrounds */
  --background: 0 0% 98%;           /* #FAFAFA - Off-white softer */
  --foreground: 224 71% 4%;         /* #030712 - Near black */
  --card: 0 0% 100%;                /* #FFFFFF - Pure white cards */
  --card-foreground: 224 71% 4%;
  --popover: 0 0% 100%;
  --popover-foreground: 224 71% 4%;

  /* Brand */
  --primary: 210 100% 56%;          /* #3B9EFF - Blue vibrant */
  --primary-foreground: 0 0% 100%;

  /* Neutrals */
  --secondary: 220 14% 96%;         /* #F4F4F5 - Light gray */
  --secondary-foreground: 224 71% 4%;
  --muted: 220 14% 96%;
  --muted-foreground: 220 9% 46%;   /* #6B7280 - Medium gray */
  --accent: 200 90% 48%;            /* #1AA3E0 - Blue darker */
  --accent-foreground: 0 0% 100%;

  /* Feedback */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 76% 36%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 0%;
  --info: 200 98% 39%;
  --info-foreground: 0 0% 100%;

  /* UI Elements */
  --border: 220 13% 91%;            /* #E5E7EB - Subtle border */
  --input: 220 13% 91%;
  --ring: 210 100% 56%;
  --radius: 0.75rem;                /* 12px - Modern rounded */

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
```

### Dark Theme (Primary Experience)
```css
.dark {
  /* Backgrounds - Layered depth */
  --background: 224 71% 4%;         /* #030712 - Deep dark */
  --foreground: 210 20% 98%;        /* #F8FAFC - Crisp white text */
  --card: 224 40% 8%;               /* #0F172A - Elevated surface */
  --card-foreground: 210 20% 98%;
  --popover: 224 40% 10%;           /* #1E293B - Popover layer */
  --popover-foreground: 210 20% 98%;

  /* Brand - Slightly adjusted for dark */
  --primary: 210 100% 60%;          /* Lighter blue for contrast */
  --primary-foreground: 0 0% 100%;

  /* Neutrals */
  --secondary: 224 30% 12%;         /* Subtle elevation */
  --secondary-foreground: 210 20% 98%;
  --muted: 224 30% 15%;
  --muted-foreground: 215 20% 65%;  /* Readable secondary text */
  --accent: 200 90% 52%;            /* Brighter blue in dark */
  --accent-foreground: 0 0% 100%;

  /* Feedback - Same with adjusted luminance */
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 71% 45%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 0%;
  --info: 200 98% 50%;
  --info-foreground: 0 0% 100%;

  /* UI Elements */
  --border: 224 30% 18%;            /* Subtle in dark */
  --input: 224 30% 15%;
  --ring: 210 100% 60%;

  /* Shadows - Darker, subtler */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);
  --shadow-xl: 0 25px 50px -12px rgb(0 0 0 / 0.6);
}
```

### Status Colors (Charts/Tags)
```
{"status":{"blue-light":"hsl(210, 100%, 56%)","blue":"hsl(210, 90%, 50%)","blue-dark":"hsl(200, 90%, 48%)","cyan":"hsl(190, 85%, 50%)","green":"hsl(142, 76%, 36%)","purple":"hsl(270, 70%, 55%)","orange":"hsl(30, 100%, 50%)","yellow":"hsl(45, 93%, 47%)","red":"hsl(0, 84%, 60%)"}}
```

### Gradients
```css
/* Hero gradients - Usar com moderação */
.gradient-brand {
  @apply bg-gradient-to-br from-primary/20 via-background to-accent/10;
}

.gradient-radial {
  background: radial-gradient(ellipse at top, hsl(var(--primary) / 0.15), transparent 50%);
}

.gradient-glow {
  background: radial-gradient(circle at center, hsl(var(--primary) / 0.2) 0%, transparent 70%);
}

/* Glass effect */
.glass {
  @apply bg-background/80 backdrop-blur-lg border border-border/50;
}
```

---

## Typography

Tipografia moderna e legível. Plus Jakarta Sans para headings (geométrica, moderna), DM Sans para body (humanista, legível).

### Font Families
```
{"fonts":{"display":"Plus Jakarta Sans, system-ui, sans-serif","body":"DM Sans, system-ui, sans-serif","mono":"JetBrains Mono, Fira Code, monospace"}}
```

### Font Installation
```html
<!-- Google Fonts - Add to index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Tailwind Config
```js
fontFamily: {
  display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
  body: ['DM Sans', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
}
```

### Type Scale
```
{"scale":{"xs":"0.75rem/1rem (12px)","sm":"0.875rem/1.25rem (14px)","base":"1rem/1.5rem (16px)","lg":"1.125rem/1.75rem (18px)","xl":"1.25rem/1.75rem (20px)","2xl":"1.5rem/2rem (24px)","3xl":"1.875rem/2.25rem (30px)","4xl":"2.25rem/2.5rem (36px)","5xl":"3rem/1 (48px)"}}
```

### Heading Styles
```tsx
// H1 - Page titles
<h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">

// H2 - Section titles
<h2 className="font-display text-xl md:text-2xl font-semibold">

// H3 - Card titles
<h3 className="font-display text-lg md:text-xl font-semibold">

// H4 - Subsections
<h4 className="font-display text-base md:text-lg font-medium">
```

### Body Styles
```tsx
// Body - Default
<p className="font-body text-sm md:text-base text-muted-foreground">

// Body small
<p className="font-body text-xs md:text-sm text-muted-foreground">

// Labels
<label className="font-body text-sm font-medium">

// Code
<code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">
```

---

## Spacing System

Sistema de 4px base. Escala consistente para padding, margin e gap.

```
{"scale":{"0":"0px","0.5":"2px","1":"4px","1.5":"6px","2":"8px","2.5":"10px","3":"12px","4":"16px","5":"20px","6":"24px","8":"32px","10":"40px","12":"48px","16":"64px","20":"80px","24":"96px"}}
```

### Common Patterns
```tsx
// Container padding (mobile → desktop)
<section className="px-4 md:px-6 lg:px-8">

// Section spacing
<section className="py-8 md:py-12 lg:py-16">

// Card padding
<div className="p-4 md:p-6">

// Stack spacing
<div className="space-y-4 md:space-y-6">

// Grid gap
<div className="gap-4 md:gap-6 lg:gap-8">
```

---

## Layout System

Layouts responsivos com sidebar colapsável e header fixo. Mobile usa bottom navigation.

### Layout Variables
```css
:root {
  --sidebar-width: 280px;
  --sidebar-collapsed: 80px;
  --header-height: 64px;
  --banner-height: 40px;
  --bottom-nav-height: 64px;
}
```

### Dashboard Layout Structure
```tsx
// Main Layout - Mobile-first
<div className="min-h-screen bg-background">
  {/* Mobile Header */}
  <header className="sticky top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
    <div className="flex h-full items-center justify-between px-4">
      {/* Logo + Menu button */}
    </div>
  </header>

  <div className="flex">
    {/* Sidebar - Hidden mobile, visible lg+ */}
    <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:fixed lg:inset-y-0 border-r bg-card">
      <nav className="flex-1 space-y-1 p-4">
        {/* Nav items */}
      </nav>
    </aside>

    {/* Main Content */}
    <main className="flex-1 lg:pl-[280px]">
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 hidden lg:flex h-16 items-center border-b bg-background/95 backdrop-blur px-6">
        {/* Breadcrumb, Search, User menu */}
      </header>

      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        {/* Page content */}
      </div>
    </main>
  </div>

  {/* Mobile Bottom Navigation */}
  <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur lg:hidden">
    <div className="flex h-full items-center justify-around">
      {/* 4-5 main nav items */}
    </div>
  </nav>
</div>
```

### Page Layout Patterns
```tsx
// Standard page with header
<div className="space-y-6">
  {/* Page header */}
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-bold">Page Title</h1>
      <p className="text-muted-foreground mt-1">Page description</p>
    </div>
    <Button>Primary Action</Button>
  </div>

  {/* Content area */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    {/* Cards/Content */}
  </div>
</div>
```

### Container Sizes
```
{"containers":{"sm":"640px","md":"768px","lg":"1024px","xl":"1280px","2xl":"1400px"}}
```

---

## Components Inventory

Componentes categorizados por função. Todos devem seguir padrões shadcn/ui.

### Primitives (ui/)
```
{"primitives":["button","input","textarea","select","checkbox","radio-group","switch","slider","label","badge","avatar","separator","skeleton","tooltip","scroll-area","aspect-ratio"]}
```

### Feedback (ui/)
```
{"feedback":["alert","alert-dialog","dialog","drawer","sheet","toast/sonner","progress","spinner"]}
```

### Navigation (ui/)
```
{"navigation":["tabs","navigation-menu","breadcrumb","pagination","command","dropdown-menu","context-menu","menubar"]}
```

### Data Display (ui/)
```
{"dataDisplay":["card","table","data-table","calendar","accordion","collapsible","hover-card","popover","carousel"]}
```

### Forms (ui/)
```
{"forms":["form","input-otp","date-picker","combobox","toggle","toggle-group"]}
```

### Layout Components (layout/)
```
{"layout":["app-shell","sidebar","header","mobile-nav","page-header","section","container"]}
```

### Feature Components (features/)
```
{"features":["auth/login-form","auth/signup-form","auth/forgot-password-form","billing/plan-card","billing/subscription-status","workspace/workspace-switcher","workspace/member-list","dashboard/stats-card","dashboard/chart-card","dashboard/activity-feed"]}
```

### Chart Components (charts/)
```
{"charts":["area-chart","bar-chart","line-chart","pie-chart","donut-chart","radial-chart","sparkline"]}
```

### Table Components (tables/)
```
{"tables":["data-table","data-table-toolbar","data-table-pagination","data-table-column-header","data-table-faceted-filter","data-table-view-options"]}
```

---

## Component Patterns

### Card Pattern
```tsx
<Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
  <CardHeader className="pb-2">
    <div className="flex items-center justify-between">
      <CardTitle className="text-base font-semibold">Title</CardTitle>
      <Badge variant="secondary">Status</Badge>
    </div>
    <CardDescription className="text-sm text-muted-foreground">
      Description text
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter className="border-t bg-muted/50 px-6 py-3">
    {/* Actions */}
  </CardFooter>
</Card>
```

### Stats Card Pattern
```tsx
<Card>
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
        <p className="text-2xl md:text-3xl font-bold">$45,231.89</p>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-success">+20.1%</span>
          <span className="text-muted-foreground">from last month</span>
        </div>
      </div>
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
        <DollarSign className="h-6 w-6 text-primary" />
      </div>
    </div>
  </CardContent>
</Card>
```

### Form Field Pattern
```tsx
<div className="space-y-2">
  <Label htmlFor="email" className="text-sm font-medium">
    Email
  </Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
    className="h-11"  /* Touch-friendly 44px */
  />
  <p className="text-xs text-muted-foreground">
    Helper text goes here
  </p>
</div>
```

### Button Variants
```tsx
// Primary - Main actions
<Button className="h-11 px-6">Save Changes</Button>

// Secondary - Alternative actions
<Button variant="secondary" className="h-11 px-6">Cancel</Button>

// Outline - Tertiary actions
<Button variant="outline" className="h-11 px-6">View Details</Button>

// Ghost - Minimal emphasis
<Button variant="ghost" size="icon"><MoreHorizontal /></Button>

// Destructive - Dangerous actions
<Button variant="destructive" className="h-11 px-6">Delete</Button>

// With icon
<Button className="h-11 px-6">
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>

// Loading state
<Button disabled className="h-11 px-6">
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Saving...
</Button>
```

---

## Animation System

Animações sutis e propositais. Usar Motion (Framer Motion) para complexidade, Tailwind transitions para simples.

### Tailwind Transitions
```tsx
// Hover states
className="transition-colors hover:bg-accent"
className="transition-all hover:shadow-lg"
className="transition-transform hover:scale-105"

// With duration
className="transition-all duration-200 ease-out"
className="transition-all duration-300 ease-in-out"
```

### Motion Patterns
```tsx
import { motion } from "framer-motion"

// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>

// Slide up
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>

// Scale on hover
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>

// Stagger children
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(i => (
    <motion.li key={i.id} variants={item}>{i.name}</motion.li>
  ))}
</motion.ul>
```

### Skeleton Loading
```tsx
// Card skeleton
<Card>
  <CardContent className="p-6 space-y-4">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-2/3" />
    <div className="flex gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-24" />
    </div>
  </CardContent>
</Card>

// Table skeleton
<TableRow>
  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
</TableRow>
```

---

## Accessibility Requirements

Todos os componentes DEVEM atender WCAG 2.1 AA.

### Checklist
```
{"a11y":["Contraste mínimo 4.5:1 texto, 3:1 UI","Touch targets 44x44px mínimo","Focus visible em todos interativos","Labels em todos inputs","Alt text em imagens","Ordem de tab lógica","Screen reader announcements","Reduced motion support","Keyboard navigation completa"]}
```

### Focus Styles
```css
/* Default focus ring */
.focus-visible:focus-visible {
  @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
}

/* High contrast for dark mode */
.dark .focus-visible:focus-visible {
  @apply ring-primary ring-offset-background;
}
```

### Reduced Motion
```tsx
// Respect user preference
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.3,
    // Disable animations if user prefers
    ...(prefersReducedMotion && { duration: 0 })
  }}
>
```

---

## Mobile-First Checklist

Validar antes de considerar qualquer componente/página completo.

```
{"mobile":["Design começa em 320px","Touch targets 44px mínimo","Input font-size 16px+ (evita zoom iOS)","Bottom nav para ações primárias","Drawer/Sheet para menus (não dropdown)","Cards full-width no mobile","Text legível sem zoom","Scroll horizontal evitado","Loading states visíveis","Pull-to-refresh onde apropriado"]}
```

---

## File Structure

Organização de arquivos do frontend.

```
apps/frontend/src/
├── components/
│   ├── ui/                 # shadcn primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/             # Layout components
│   │   ├── app-shell.tsx
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── mobile-nav.tsx
│   │   └── page-header.tsx
│   ├── charts/             # Recharts wrappers
│   │   ├── area-chart.tsx
│   │   ├── bar-chart.tsx
│   │   └── ...
│   ├── tables/             # TanStack Table wrappers
│   │   ├── data-table.tsx
│   │   └── ...
│   └── features/           # Feature-specific
│       ├── auth/
│       ├── billing/
│       ├── workspace/
│       └── dashboard/
├── hooks/
│   ├── use-mobile.ts       # isMobile detection
│   ├── use-media-query.ts
│   └── use-toast.ts
├── lib/
│   ├── utils.ts            # cn(), formatters
│   └── api.ts              # Axios client
├── stores/
│   ├── auth-store.ts
│   └── ui-store.ts         # Sidebar state, theme
├── styles/
│   └── globals.css         # Tailwind + tokens
└── types/
    └── index.ts            # Shared types
```

---

## Component Development Guide

### Criar Novo Componente
```
{"steps":["Verificar se existe em shadcn (npx shadcn add [component])","Se não, criar em components/ui/ ou components/features/","Usar forwardRef para componentes interativos","Exportar em index.ts do diretório","Adicionar displayName","Documentar props com JSDoc"]}
```

### Component Template
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface ComponentNameProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Description of prop */
  variant?: "default" | "secondary"
}

const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "base-classes-here",
          variant === "secondary" && "secondary-classes",
          className
        )}
        {...props}
      />
    )
  }
)
ComponentName.displayName = "ComponentName"

export { ComponentName }
```

---

## Performance Guidelines

```
{"performance":["Lazy load routes (TanStack Router)","Virtualizar listas 100+ items (@tanstack/react-virtual)","Skeleton loaders durante fetch","Prefetch no hover (preload='intent')","Otimizar imagens (next/image ou lazy loading)","Code splitting por feature","Memoize callbacks/values caros"]}
```

---

## Theme Toggle Implementation

```tsx
// stores/ui-store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UIStore {
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: "dark", // Default to dark
      setTheme: (theme) => set({ theme }),
    }),
    { name: "ui-storage" }
  )
)

// In App.tsx or layout
useEffect(() => {
  const root = window.document.documentElement
  root.classList.remove("light", "dark")

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    root.classList.add(systemTheme)
  } else {
    root.classList.add(theme)
  }
}, [theme])
```

---

## References

Skill de UX Design para patterns detalhados: `.claude/skills/ux-design/SKILL.md`

Documentação das bibliotecas:
- Tailwind v3: `.claude/skills/ux-design/tailwind-v3-docs.md`
- shadcn/ui: `.claude/skills/ux-design/shadcn-docs.md`
- Motion: `.claude/skills/ux-design/motion-dev-docs.md`
- Recharts: `.claude/skills/ux-design/recharts-docs.md`
- TanStack Table: `.claude/skills/ux-design/tanstack-table-docs.md`
- TanStack Query: `.claude/skills/ux-design/tanstack-query-docs.md`
- TanStack Router: `.claude/skills/ux-design/tanstack-router-docs.md`

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-21 | Initial design system - Envato-inspired, mobile-first, dark-mode primary |
| 1.1.0 | 2025-12-21 | Updated brand colors: Emerald primary (#10B981), Indigo accent (#6366F1) |
| 1.2.0 | 2025-12-21 | Harmonic palette redesign: Teal primary (#1AB394), Cyan accent (#16A8E0) - analogous color scheme |
| 1.3.0 | 2025-12-21 | Monochromatic blue redesign: Blue primary (#3B9EFF), Blue accent (#1AA3E0) - single color family for visual harmony |
