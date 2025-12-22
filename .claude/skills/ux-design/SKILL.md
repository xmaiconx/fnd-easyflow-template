---
name: ux-design
description: |
  Frontend UI: mobile-first, responsive, modern aesthetics. Tailwind v3, shadcn, Motion, Recharts, TanStack.
---

# UX Design

Skill para criar interfaces **distintivas, responsivas e mobile-first**.

**Use para:** Components, pages, layouts, dashboards, charts, tables
**Não use para:** Backend (backend-development), Database (database-development)

**Referência:** Sempre consultar `CLAUDE.md` para padrões gerais do projeto.

---

## Design Philosophy

### Before Coding
1. **Purpose** - What problem does this solve? Who uses it?
2. **Aesthetic** - Pick BOLD direction: Minimal | Brutal | Retro | Playful | Luxury
3. **Differentiation** - What makes it MEMORABLE?

### Anti-Patterns (NEVER)
{"avoid":["Inter/Roboto/Arial fonts","purple gradients on white","predictable layouts","timid palettes"]}

---

## Mobile-First (MANDATORY)

```tsx
// CORRECT: Mobile-first
<div className="p-4 md:p-6 lg:p-8">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<div className="text-sm md:text-base lg:text-lg">

// WRONG: Desktop-first
<div className="p-8 sm:p-4">  // Don't do this
```

---

## Docs Lookup

{"shadcn":".claude/skills/ux-design/shadcn-docs.md"}
{"tailwind":".claude/skills/ux-design/tailwind-v3-docs.md"}
{"motion":".claude/skills/ux-design/motion-dev-docs.md"}
{"recharts":".claude/skills/ux-design/recharts-docs.md"}
{"tanstackTable":".claude/skills/ux-design/tanstack-table-docs.md"}
{"tanstackQuery":".claude/skills/ux-design/tanstack-query-docs.md"}
{"tanstackRouter":".claude/skills/ux-design/tanstack-router-docs.md"}

---

## Quick Patterns

### Layout
```tsx
<div className="min-h-screen bg-background">
  <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
    <div className="container flex h-14 md:h-16 items-center px-4" />
  </header>
  <div className="container flex flex-col md:flex-row gap-6 p-4 md:p-6">
    <aside className="hidden md:block w-64 shrink-0">
      <nav className="sticky top-20 space-y-2" />
    </aside>
    <main className="flex-1 space-y-6" />
  </div>
</div>
```

### Card with Animation
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.02 }}
>
  <Card className="group cursor-pointer hover:shadow-lg hover:border-primary/50">
    <CardHeader>
      <CardTitle className="group-hover:text-primary transition-colors" />
    </CardHeader>
  </Card>
</motion.div>
```

### Staggered List
```tsx
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map((i) => <motion.li key={i.id} variants={item} />)}
</motion.ul>
```

### Chart
```tsx
<div className="h-[200px] md:h-[300px] w-full">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis dataKey="name" className="text-xs" />
      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))' }} />
      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
</div>
```

---

## Recommended Libs

{"libs":[{"name":"@tanstack/react-virtual","when":"1000+ items"},{"name":"sonner","when":"toasts","cmd":"npx shadcn add sonner"},{"name":"vaul","when":"mobile drawer","cmd":"npx shadcn add drawer"},{"name":"cmdk","when":"command palette","cmd":"npx shadcn add command"},{"name":"date-fns","when":"date formatting"},{"name":"nuqs","when":"URL search params"},{"name":"react-dropzone","when":"file upload"}]}

---

## Improvements Checklist

{"performance":["virtualization for long lists","lazy loading images","code splitting by route","prefetch on hover","skeleton loaders"]}

{"ux":["loading skeletons","empty states with illustrations","error states with retry","toast feedback","enter/exit animations","focus trapping in modals","keyboard shortcuts"]}

{"a11y":["WCAG AA contrast","labels on inputs","alt text on images","logical focus order","screen reader announcements","reduced motion support"]}

---

## Typography

{"displayFonts":["Clash Display","Cabinet Grotesk","Satoshi","Outfit","Plus Jakarta Sans"]}
{"bodyFonts":["DM Sans","Source Sans Pro","Work Sans"]}

```tsx
fontFamily: {
  display: ['Clash Display', 'sans-serif'],
  body: ['DM Sans', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}

<h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
<p className="font-body text-sm md:text-base text-muted-foreground">
```

---

## Colors

```css
/* Use CSS variables for consistency */
:root {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 142.1 76.2% 36.3%;
  --accent: 270 95% 75%;
}
```

```tsx
/* Distinctive gradients */
<div className="bg-gradient-to-br from-primary/20 via-background to-accent/10">
<div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background">
```

---

## Spacing

```tsx
// Padding
<section className="py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-8">

// Gap
<div className="gap-4 md:gap-6 lg:gap-8">

// Container
<div className="container mx-auto max-w-7xl">
```

---

## Common Mistakes

{"mistakes":[{"wrong":"forget min-h-screen","fix":"add to root layout"},{"wrong":"no container","fix":"wrap main content"},{"wrong":"heavy animations","fix":"use will-change, GPU accel"},{"wrong":"hardcoded colors","fix":"use CSS vars hsl(var(--primary))"},{"wrong":"z-index chaos","fix":"scale: 10,20,30,40,50"},{"wrong":"not testing mobile","fix":"develop mobile-first"}]}

---

## File Structure

```
apps/frontend/src/
├── components/
│   ├── ui/        # shadcn
│   ├── layout/    # Header,Sidebar,Footer
│   ├── charts/    # Recharts wrappers
│   ├── tables/    # TanStack Table wrappers
│   └── shared/    # Reusable
├── hooks/use-*.ts
├── lib/utils.ts   # cn(), formatters
└── styles/globals.css
```
