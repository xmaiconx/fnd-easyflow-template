# Design System Foundations

Design system extraído do projeto FND EasyFlow. Mobile-first: design para 320px, escala para cima. Gerado pela análise do frontend em 2025-12-21.

**Stack:** React 18 + Vite + Tailwind v3 + Shadcn/UI
**Apps:** frontend (user-facing) | manager (admin panel)

---

## Spec (Token-Efficient)

### Context
{"analyzedFrom":"apps/frontend/src, apps/manager/src","uiLibrary":"shadcn/ui + radix","icons":"lucide-react","generated":"2025-12-21"}

### Breakpoints
{"mobile":"320px-767px (DEFAULT)","tablet":"768px-1023px (md:)","desktop":"1024px+ (lg:)"}

### Spacing Scale
{"1":"0.25rem (4px)","2":"0.5rem (8px)","4":"1rem (16px)","6":"1.5rem (24px)","8":"2rem (32px)"}

### Typography
{"fonts":{"sans":"system-ui, sans-serif","mono":"ui-monospace, monospace"},"scale":{"xs":"0.75rem","sm":"0.875rem","base":"1rem","lg":"1.125rem","xl":"1.25rem","2xl":"1.5rem","3xl":"1.875rem"}}

---

## Color Tokens (CSS Variables)

### Base
```css
--background: 0 0% 100%;      /* White */
--foreground: 222 47% 11%;    /* Dark slate */
--card: 0 0% 100%;
--card-foreground: 222 47% 11%;
--popover: 0 0% 100%;
--popover-foreground: 222 47% 11%;
```

### Brand
```css
--brand-primary: 15 90% 50%;           /* Laranja #F56B00 */
--brand-primary-hover: 15 90% 45%;
--brand-secondary: 230 70% 50%;        /* Azul #2667E5 */
--accent: 340 85% 55%;                 /* Rosa #F0447A */
```

### Semantic
```css
--primary: 15 90% 50%;        /* Brand orange */
--secondary: 210 40% 96%;
--muted: 210 40% 96%;
--muted-foreground: 215 16% 47%;
--destructive: 0 84% 60%;     /* Red */
--success: 142 76% 36%;       /* Green */
--warning: 38 92% 50%;        /* Yellow */
```

### Dark Mode
```css
.dark {
  --background: 222 47% 11%;
  --foreground: 210 40% 98%;
  --card: 222 47% 11%;
  --secondary: 217 33% 17%;
  --muted: 217 33% 17%;
  --muted-foreground: 215 20% 65%;
  --border: 217 33% 17%;
}
```

---

## Components Inventory

### UI Primitives (components/ui/)
| Component | Path | Notes |
|-----------|------|-------|
| Button | button.tsx | variants: default, destructive, outline, ghost, link |
| Card | card.tsx | CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| Input | input.tsx | Standard input with focus ring |
| Label | label.tsx | Form labels |
| Badge | badge.tsx | variants: default, secondary, destructive, outline |
| Dialog | dialog.tsx | Modal dialogs |
| Select | select.tsx | Dropdown select |
| Textarea | textarea.tsx | Multi-line input |
| Table | table.tsx | TableHeader, TableBody, TableRow, TableCell, TableHead |
| Avatar | avatar.tsx | AvatarImage, AvatarFallback |
| DropdownMenu | dropdown-menu.tsx | Context menus |
| Tabs | tabs.tsx | TabsList, TabsTrigger, TabsContent |
| Skeleton | skeleton.tsx | Loading placeholder |
| Alert | alert.tsx | Info/warning/error messages |
| Separator | separator.tsx | Visual divider |
| Progress | progress.tsx | Progress bar |
| ThemeToggle | theme-toggle.tsx | Dark/light mode switcher |

### Layout Components
| Component | Path | App |
|-----------|------|-----|
| Header | components/layout/Header.tsx | frontend |
| Sidebar | components/layout/Sidebar.tsx | frontend |
| AppLayout | components/layout/app-layout.tsx | frontend |
| AuthLayout | components/layout/auth-layout.tsx | frontend |

### Feature Components
| Folder | Components | App |
|--------|------------|-----|
| auth/ | ProtectedRoute, RedirectIfAuthenticated, FeatureGate, GoogleSignInButton | frontend |
| billing/ | PlanCard, CurrentPlan | frontend |
| workspace/ | CreateWorkspaceModal, WorkspaceSwitcher | frontend |
| forms/ | LoadingButton, FormField | frontend |

---

## Conventions

### Naming
{"files":"kebab-case.tsx","components":"PascalCase","props":"interface ComponentNameProps","exports":"named, no default"}

### Component Structure
```tsx
interface ComponentProps {
  // props
}

export function Component({ ...props }: ComponentProps) {
  return (...)
}
```

### Patterns Used
["forwardRef for form elements","cn() for class merging","variants with cva()","Zustand for state","React Query for server state"]

### File Organization
```
src/
├── components/
│   ├── ui/           → Primitivos reutilizáveis
│   ├── layout/       → Header, Sidebar, Layouts
│   ├── auth/         → Componentes de autenticação
│   ├── [feature]/    → Componentes por feature
│   └── *.tsx         → Componentes standalone
├── contexts/         → React contexts
├── stores/           → Zustand stores
├── hooks/            → Custom hooks
├── pages/            → Route components
├── lib/              → Utilities (api, utils, constants)
└── types/            → TypeScript types
```

---

## Mobile Checklist

{"required":["Touch targets min 44px","Input font 16px+ (prevent zoom)","Focus visible on all interactive","Contrast WCAG AA","Reduced motion support"]}

### Responsive Patterns
{"sidebar":"overlay on mobile, persistent on lg:","header":"hamburger menu on mobile","tables":"card layout on mobile","dialogs":"bottom sheet on mobile (optional)"}

---

## Theme System

### Implementation
```
stores/theme-store.ts     → Zustand store with persist
contexts/theme-context.tsx → Provider + useTheme hook
components/ui/theme-toggle.tsx → Toggle button
```

### Theme Values
{"options":["light","dark","system"],"default":"system","storage":"localStorage"}

### Usage
```tsx
// In App.tsx
<ThemeProvider>
  <App />
</ThemeProvider>

// In any component
const { theme, toggleTheme } = useTheme()
```
