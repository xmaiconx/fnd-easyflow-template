---
name: ux-design
description: Use when building frontend components, pages, layouts, dashboards, or any UI - creates distinctive, production-grade, mobile-first interfaces with modern aesthetics using the project's stack (Tailwind v3, shadcn, Motion, Recharts, TanStack)
---

# UX Design Specialist

## Overview

Skill especializada em criar interfaces frontend **distintivas, responsivas e mobile-first** utilizando a stack do projeto. Foge da estética genérica de "IA slop" e entrega código de produção com atenção meticulosa aos detalhes visuais.

**Stack Principal:**
- Tailwind CSS v3 (utility-first, responsive)
- shadcn/ui (componentes headless + Radix)
- Motion (Framer Motion - animações)
- Recharts (visualização de dados)
- TanStack Table (tabelas avançadas)
- TanStack Query (data fetching)
- Lucide React (ícones)

## Design Philosophy

### ANTES de Codar

1. **Propósito** - Que problema essa interface resolve? Quem usa?
2. **Tom Estético** - Escolher direção BOLD:
   - Minimalista refinado | Brutalista | Retro-futurista
   - Orgânico/natural | Luxo/refinado | Playful/toy-like
   - Editorial/magazine | Art deco | Soft/pastel | Industrial
3. **Diferenciação** - O que torna MEMORÁVEL?

### Mobile-First OBRIGATÓRIO

```tsx
// CORRETO: Mobile-first
<div className="p-4 md:p-6 lg:p-8">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<div className="text-sm md:text-base lg:text-lg">

// ERRADO: Desktop-first
<div className="p-8 sm:p-4"> // Não fazer isso
```

### Anti-Patterns (NUNCA Usar)

| Evitar | Por quê |
|--------|---------|
| Inter, Roboto, Arial | Genérico demais |
| Purple gradients em branco | Clichê de IA |
| Layouts previsíveis | Cookie-cutter |
| Paletas tímidas | Falta de intenção |

## Consultando Documentação

```bash
# Componentes shadcn
Grep pattern="Button" path=".claude/skills/ux-design/shadcn-docs.md"
Grep pattern="Dialog" path=".claude/skills/ux-design/shadcn-docs.md"
Grep pattern="Card" path=".claude/skills/ux-design/shadcn-docs.md"

# Tailwind utilities
Grep pattern="grid" path=".claude/skills/ux-design/tailwind-v3-docs.md"
Grep pattern="flex" path=".claude/skills/ux-design/tailwind-v3-docs.md"
Grep pattern="responsive" path=".claude/skills/ux-design/tailwind-v3-docs.md"

# Animações Motion
Grep pattern="animate" path=".claude/skills/ux-design/motion-dev-docs.md"
Grep pattern="transition" path=".claude/skills/ux-design/motion-dev-docs.md"
Grep pattern="stagger" path=".claude/skills/ux-design/motion-dev-docs.md"

# Charts Recharts
Grep pattern="LineChart" path=".claude/skills/ux-design/recharts-docs.md"
Grep pattern="BarChart" path=".claude/skills/ux-design/recharts-docs.md"
Grep pattern="ResponsiveContainer" path=".claude/skills/ux-design/recharts-docs.md"

# Tabelas TanStack
Grep pattern="useReactTable" path=".claude/skills/ux-design/tanstack-table-docs.md"
Grep pattern="sorting" path=".claude/skills/ux-design/tanstack-table-docs.md"
Grep pattern="pagination" path=".claude/skills/ux-design/tanstack-table-docs.md"

# Data Fetching
Grep pattern="useQuery" path=".claude/skills/ux-design/tanstack-query-docs.md"
Grep pattern="useMutation" path=".claude/skills/ux-design/tanstack-query-docs.md"

# Routing
Grep pattern="createFileRoute" path=".claude/skills/ux-design/tanstack-router-docs.md"
Grep pattern="useNavigate" path=".claude/skills/ux-design/tanstack-router-docs.md"
```

## Quick Patterns

### Layout Responsivo Básico

```tsx
// Mobile-first dashboard layout
<div className="min-h-screen bg-background">
  {/* Header - sticky no mobile */}
  <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-14 md:h-16 items-center px-4">
      {/* Logo + Nav */}
    </div>
  </header>

  <div className="container flex flex-col md:flex-row gap-6 p-4 md:p-6">
    {/* Sidebar - hidden mobile, drawer ou bottom nav */}
    <aside className="hidden md:block w-64 shrink-0">
      <nav className="sticky top-20 space-y-2">
        {/* Nav items */}
      </nav>
    </aside>

    {/* Main content */}
    <main className="flex-1 space-y-6">
      {/* Content */}
    </main>
  </div>
</div>
```

### Card com Hover e Animação

```tsx
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
    <CardHeader>
      <CardTitle className="group-hover:text-primary transition-colors">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {/* Content */}
    </CardContent>
  </Card>
</motion.div>
```

### Tabela com TanStack Table + shadcn

```tsx
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
})

<div className="rounded-md border">
  <Table>
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id}>
              {header.column.getCanSort() ? (
                <Button
                  variant="ghost"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                flexRender(header.column.columnDef.header, header.getContext())
              )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
    <TableBody>
      {table.getRowModel().rows.map((row) => (
        <TableRow key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

### Chart Responsivo

```tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

<div className="h-[200px] md:h-[300px] lg:h-[400px] w-full">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis dataKey="name" className="text-xs" />
      <YAxis className="text-xs" />
      <Tooltip
        contentStyle={{
          backgroundColor: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px'
        }}
      />
      <Line
        type="monotone"
        dataKey="value"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        dot={{ fill: 'hsl(var(--primary))' }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
```

### Lista com Staggered Animation

```tsx
import { motion } from "framer-motion"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
}

<motion.ul
  variants={container}
  initial="hidden"
  animate="show"
  className="space-y-2"
>
  {items.map((item) => (
    <motion.li key={item.id} variants={item}>
      {/* Item content */}
    </motion.li>
  ))}
</motion.ul>
```

## Stack Improvements Checklist

Ao desenvolver interfaces, considere estas melhorias:

### Libs Complementares Recomendadas

| Lib | Quando Usar | Instalação |
|-----|-------------|------------|
| `@tanstack/react-virtual` | Listas longas (1000+ items) | `npm i @tanstack/react-virtual` |
| `react-hot-toast` / `sonner` | Notificações toast | `npx shadcn add sonner` |
| `vaul` | Drawers mobile | `npx shadcn add drawer` |
| `cmdk` | Command palette | `npx shadcn add command` |
| `date-fns` | Formatação de datas | `npm i date-fns` |
| `nuqs` | Search params state | `npm i nuqs` |
| `react-dropzone` | Upload de arquivos | `npm i react-dropzone` |

### Melhorias de Performance

- [ ] Virtualização para listas longas (`@tanstack/react-virtual`)
- [ ] Lazy loading de imagens (`loading="lazy"`)
- [ ] Code splitting por rota (já integrado com TanStack Router)
- [ ] Prefetch de rotas no hover (`preload="intent"`)
- [ ] Skeleton loaders durante carregamento

### Melhorias de UX

- [ ] Estados de loading com skeletons
- [ ] Estados vazios com ilustrações
- [ ] Estados de erro com retry
- [ ] Feedback visual em ações (toasts)
- [ ] Animações de entrada/saída
- [ ] Transições suaves entre estados
- [ ] Focus trapping em modais
- [ ] Keyboard shortcuts para power users

### Melhorias de Acessibilidade

- [ ] Contraste adequado (WCAG AA)
- [ ] Labels em todos inputs
- [ ] Alt text em imagens
- [ ] Ordem de focus lógica
- [ ] Screen reader announcements
- [ ] Reduced motion support

## Typography Guidelines

```tsx
// Fontes distintivas (não genéricas)
// Adicionar em tailwind.config.js ou index.css

// Display fonts sugeridas:
// - Clash Display, Cabinet Grotesk, Satoshi
// - Outfit, Plus Jakarta Sans, Manrope

// Body fonts sugeridas:
// - DM Sans, Source Sans Pro, Work Sans

// Exemplo de configuração:
fontFamily: {
  display: ['Clash Display', 'sans-serif'],
  body: ['DM Sans', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}

// Uso:
<h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
<p className="font-body text-sm md:text-base text-muted-foreground">
```

## Color Palettes

```tsx
// Usar CSS variables do shadcn para consistência
// Customizar em globals.css ou usar themes

// Paleta dark mode premium:
:root {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 4.9%;
  --primary: 142.1 76.2% 36.3%; // Verde vibrante
  --accent: 270 95% 75%; // Purple accent
}

// Gradients distintivos:
<div className="bg-gradient-to-br from-primary/20 via-background to-accent/10">
<div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background">
```

## Spacing System

```tsx
// Consistência mobile-first
// Padding padrão:
<section className="py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-8">

// Gap padrão:
<div className="gap-4 md:gap-6 lg:gap-8">

// Container responsivo:
<div className="container mx-auto max-w-7xl">
```

## Common Mistakes

| Erro | Solução |
|------|---------|
| Esquecer `min-h-screen` | Adicionar no layout root |
| Não usar `container` | Sempre envolver conteúdo principal |
| Animações pesadas | Usar `will-change` e GPU acceleration |
| Cores hardcoded | Usar CSS variables (`hsl(var(--primary))`) |
| Z-index chaos | Seguir escala: 10, 20, 30, 40, 50 |
| Não testar mobile | Sempre desenvolver mobile-first |

## File Structure

```
apps/frontend/src/
├── components/
│   ├── ui/           # shadcn components
│   ├── layout/       # Header, Sidebar, Footer
│   ├── charts/       # Wrappers Recharts
│   ├── tables/       # Wrappers TanStack Table
│   └── shared/       # Componentes reutilizáveis
├── hooks/
│   └── use-*.ts      # Custom hooks
├── lib/
│   └── utils.ts      # cn(), formatters
└── styles/
    └── globals.css   # Tailwind + custom CSS
```

## When to Use This Skill

- Criando novos componentes UI
- Desenvolvendo páginas/layouts
- Implementando dashboards
- Criando visualizações de dados
- Melhorando UX existente
- Adicionando animações
- Tornando interfaces responsivas
