# Frontend Layout Redesign

**Data:** 2025-12-21 | **Referências:** Shadcn Dashboard, Linear, Vercel, Notion

Redesign completo do layout do frontend seguindo padrões modernos de admin templates. O layout atual possui problemas críticos de UX que precisam ser corrigidos.

---

## Problemas Identificados

| # | Problema | Severidade | Arquivo | Descrição |
|---|----------|------------|---------|-----------|
| 1 | Banner fora do layout | Alta | App.tsx:20 | ImpersonateBanner renderiza fora do AppLayout, causando sobreposição com sidebar |
| 2 | Sidebar não colapsa | Alta | Sidebar.tsx | Sem toggle, ocupa 256px fixos sempre |
| 3 | Header desalinhado | Média | Header.tsx | Não respeita posição da sidebar em todos estados |
| 4 | Sem toggle de sidebar | Alta | app-layout.tsx | Usuário não pode minimizar sidebar |
| 5 | Header não é sticky | Média | Header.tsx | Header rola com conteúdo |
| 6 | Mobile menu básico | Média | app-layout.tsx | Overlay simples sem transições |

---

## Arquitetura

### Atual (Problemática)

```
App.tsx
├── ImpersonateHandler
├── ImpersonateBanner  ← PROBLEMA: fora do layout!
└── Routes
    └── AppLayout
        ├── Sidebar (fixed, 256px)
        └── div (lg:pl-64)
            ├── Header
            └── main
```

O banner renderiza **antes** do layout, sem considerar a sidebar.

### Nova (Corrigida)

```
App.tsx
├── ImpersonateHandler
└── Routes
    └── AppLayout
        ├── SidebarProvider  ← NOVO: context
        ├── Sidebar (fixed, colapsável)
        └── div (margin dinâmica)
            ├── ImpersonateBanner  ← MOVIDO: dentro do layout
            ├── Header (sticky)
            └── main
```

---

## Dimensões

| Elemento | Valor |
|----------|-------|
| Sidebar expanded | 256px (w-64) |
| Sidebar collapsed | 64px (w-16) |
| Header height | 64px (h-16) |
| Banner height | 40px |
| Transição | 200ms ease-in-out |

---

## Estados da Sidebar

### Desktop (>= 1024px)

**Expanded (padrão):**
```
┌──────────────┐
│ 🟠 Agentics  │
├──────────────┤
│ 🏠 Dashboard │
├──────────────┤
│ CONFIGURAÇÕES│
│ 👤 Perfil    │
│ ⚙️ Workspaces│
├──────────────┤
│              │
│     [«]      │ ← Toggle collapse
│   v1.0.0     │
└──────────────┘
```

**Collapsed (64px - icon only):**
```
┌────┐
│ 🟠 │
├────┤
│ 🏠 │ ← Tooltip: "Dashboard"
├────┤
│ 👤 │ ← Tooltip: "Perfil"
│ ⚙️ │ ← Tooltip: "Workspaces"
├────┤
│[»] │
└────┘
```

- Toggle entre expanded/collapsed
- Estado persistido em localStorage
- Tooltip mostra label no hover quando collapsed

### Tablet (768px - 1023px)

- Começa collapsed por padrão
- Toggle para expandir

### Mobile (< 768px)

**Fechada (padrão):**
```
┌─────────────────────┐
│ [≡] Teste ▼  [🌙][U]│
├─────────────────────┤
│                     │
│ Welcome, Maicon...  │
│                     │
└─────────────────────┘
```

**Aberta (overlay com backdrop):**
```
┌─────────────────────┐
│ Agentics      [X]   │
├─────────────────────┤
│ 🏠 Dashboard        │
├─────────────────────┤
│ CONFIGURAÇÕES       │
│ 👤 Perfil           │
│ ⚙️ Workspaces       │
├─────────────────────┤
│▓▓▓▓▓ backdrop ▓▓▓▓▓│
└─────────────────────┘
```

- Sidebar como overlay
- Backdrop escuro fecha ao clicar
- Botão X no header da sidebar

---

## Wireframes Desktop

### Estado Normal (sidebar expanded)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌────────────┬───────────────────────────────────────────────┐  │
│  │            │                                               │  │
│  │  Agentics  │  [≡]  Teste ▼        Dashboard    [🌙] [U]   │  │
│  │            │                                               │  │
│  ├────────────┼───────────────────────────────────────────────┤  │
│  │            │                                               │  │
│  │ 🏠Dashboard│  Welcome, Maicon Wentz Matsubaraa!           │  │
│  │            │  This is your dashboard.                      │  │
│  ├────────────┤                                               │  │
│  │CONFIGURAÇÕES                                               │  │
│  │ 👤 Perfil  │                                               │  │
│  │ ⚙️ Worksp. │                                               │  │
│  │            │                                               │  │
│  ├────────────┤                                               │  │
│  │    [«]     │                                               │  │
│  │  v1.0.0    │                                               │  │
│  └────────────┴───────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Estado Collapsed (sidebar minimizada)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌────┬───────────────────────────────────────────────────────┐  │
│  │    │                                                       │  │
│  │ 🟠 │  [≡]  Teste ▼        Dashboard         [🌙] [U]      │  │
│  │    │                                                       │  │
│  ├────┼───────────────────────────────────────────────────────┤  │
│  │    │                                                       │  │
│  │ 🏠 │  Welcome, Maicon Wentz Matsubaraa!                   │  │
│  │    │  This is your dashboard.                              │  │
│  ├────┤                                                       │  │
│  │ 👤 │  [Cards e conteúdo com mais espaço]                  │  │
│  │ ⚙️ │                                                       │  │
│  │    │                                                       │  │
│  ├────┤                                                       │  │
│  │[»] │                                                       │  │
│  └────┴───────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Com Banner de Impersonação

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌────────────┬───────────────────────────────────────────────┐  │
│  │            │⚠️ Impersonando usuário (Expira: 14:30) [Sair] │  │
│  │  Agentics  ├───────────────────────────────────────────────┤  │
│  │            │  [≡]  Teste ▼        Dashboard    [🌙] [U]   │  │
│  ├────────────┼───────────────────────────────────────────────┤  │
│  │ ...        │  ...                                          │  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Componentes

### Criar (3 novos)

#### 1. sidebar-context.tsx

```typescript
// Estado global da sidebar
interface SidebarState {
  isCollapsed: boolean      // Desktop: collapsed mode
  isMobileOpen: boolean     // Mobile: overlay open
}

interface SidebarContextValue extends SidebarState {
  toggleCollapse: () => void
  openMobile: () => void
  closeMobile: () => void
}

// Persist isCollapsed em localStorage key: "sidebar-collapsed"
```

**Exports:** `SidebarProvider`, `useSidebar`

#### 2. sidebar-item.tsx

```typescript
interface SidebarItemProps {
  href: string
  icon: React.ElementType
  label: string
  isActive?: boolean
  onClose?: () => void  // Para fechar sidebar mobile
}

// Quando collapsed: renderiza só ícone + Tooltip com label
// Quando expanded: renderiza ícone + label
```

#### 3. sidebar-toggle.tsx

```typescript
interface SidebarToggleProps {
  className?: string
}

// Renderiza botão « (collapse) ou » (expand)
// Usa useSidebar().toggleCollapse()
```

### Dependência Shadcn

```bash
npx shadcn@latest add tooltip
```

### Refatorar (6 arquivos)

#### 1. index.css

Adicionar CSS variables:

```css
:root {
  /* Layout */
  --sidebar-width: 256px;
  --sidebar-collapsed: 64px;
  --header-height: 64px;
  --banner-height: 40px;
}
```

#### 2. Sidebar.tsx

Mudanças:
- Importar `useSidebar` do context
- Usar `SidebarItem` para itens de navegação
- Adicionar `SidebarToggle` no footer
- Classes condicionais `w-64` / `w-16` baseado em `isCollapsed`
- Transição: `transition-all duration-200`

#### 3. Header.tsx

Mudanças:
- Toggle button sempre visível (não só `lg:hidden`)
- Adicionar classe `sticky top-0 z-30`
- z-index correto para ficar abaixo do banner

#### 4. app-layout.tsx

Mudanças:
- Wrap tudo com `<SidebarProvider>`
- Mover `<ImpersonateBanner />` para dentro do layout
- Margin dinâmica: `lg:ml-64` quando expanded, `lg:ml-16` quando collapsed
- Transição na margin

```tsx
// Exemplo da nova estrutura
<SidebarProvider>
  <div className="min-h-screen bg-background">
    {/* Sidebar */}
    <Sidebar />

    {/* Main area */}
    <div className={cn(
      "transition-all duration-200",
      isCollapsed ? "lg:ml-16" : "lg:ml-64"
    )}>
      <ImpersonateBanner />
      <Header />
      <main className="p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  </div>
</SidebarProvider>
```

#### 5. ImpersonateBanner.tsx

Mudanças:
- Classes responsivas `flex-col sm:flex-row`
- `sticky top-0 z-50`
- Texto não quebra mal no mobile

```tsx
<div className="sticky top-0 z-50 bg-yellow-500 text-black px-4 py-2
  flex flex-col sm:flex-row items-start sm:items-center
  justify-between gap-2 sm:gap-0">
```

#### 6. App.tsx

Mudanças:
- Remover `import { ImpersonateBanner }` (linha 9)
- Remover `<ImpersonateBanner />` (linha 20)

---

## Ordem de Implementação

1. `apps/frontend/src/index.css` - CSS vars
2. `npx shadcn@latest add tooltip` - Componente tooltip
3. `apps/frontend/src/components/layout/sidebar-context.tsx` - Context
4. `apps/frontend/src/components/layout/sidebar-item.tsx` - Item com tooltip
5. `apps/frontend/src/components/layout/sidebar-toggle.tsx` - Toggle button
6. `apps/frontend/src/components/layout/Sidebar.tsx` - Refatorar
7. `apps/frontend/src/components/layout/Header.tsx` - Sticky + toggle
8. `apps/frontend/src/components/layout/app-layout.tsx` - Nova estrutura
9. `apps/frontend/src/components/ImpersonateBanner.tsx` - Responsivo
10. `apps/frontend/src/App.tsx` - Remover banner

---

## Validação

### Mobile
- [ ] Sidebar overlay funciona
- [ ] Backdrop fecha sidebar ao clicar
- [ ] Banner responsivo (flex-col em mobile)
- [ ] Touch targets 44px mínimo

### Desktop
- [ ] Collapse persiste após reload (localStorage)
- [ ] Transições suaves (200ms)
- [ ] Alinhamentos corretos (sidebar, header, content)
- [ ] Tooltips aparecem em modo collapsed

### UX
- [ ] Toggle acessível via teclado
- [ ] Estado salvo em localStorage
- [ ] Sem flash no load (hydration ok)
- [ ] Banner não sobrepõe sidebar

---

## Resumo

| Item | Quantidade |
|------|------------|
| Arquivos a criar | 3 |
| Arquivos a refatorar | 6 |
| Dependência Shadcn | tooltip |
| Complexidade | Média |
| Risco | Baixo (apenas layout) |
