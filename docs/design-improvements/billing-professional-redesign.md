# Design Improvement: Billing Professional Redesign

**Type:** Major UX Overhaul | **Date:** 2024-12-24 | **Target:** `/admin/billing`

Redesign completo da página de billing com organização em tabs, hierarquia visual profissional e layout 100% mobile-first. Soluciona problemas de poluição visual, scroll excessivo e fragmentação de informações.

**Princípios aplicados:** Mobile-first, progressive disclosure, information architecture, visual hierarchy, SaaS best practices.

**Skill Reference:** `.claude/skills/ux-design/SKILL.md`

---

## Spec (Token-Efficient)

### Context
{"page":"apps/frontend/src/pages/billing.tsx","currentIssue":"Informação fragmentada verticalmente, poluição visual, hierarquia confusa, muito scroll","solution":"Organização em 3 tabs com progressive disclosure","stack":"React+TailwindV3+Motion+shadcn+RadixTabs","designSystem":"docs/design-system/foundations.md"}

### Problem Analysis

**Problemas Identificados:**
```
{"visual":["Tudo empilhado verticalmente causa scroll excessivo","CurrentPlanCard + Planos Disponíveis + Histórico compete por atenção","Não há hierarquia clara de importância","Espaço mal aproveitado em desktop"],"ux":["Usuário precisa scrollar para ver tudo","Muitos botões no CurrentPlanCard confundem (Gerenciar, Upgrade, Downgrade)","Informação importante (próxima cobrança) perde-se no card grande","Planos disponíveis competem visualmente com plano atual"],"mobile":["Scroll infinito em mobile","Cards grandes consomem muito espaço vertical","Botões amontoados"]}
```

**User Journey Problemático:**
1. Entra na página → vê plano atual (ok)
2. Scroll down → vê planos disponíveis (mas não quer trocar agora)
3. Scroll down → vê histórico vazio (informação irrelevante)
4. **Resultado:** Informação importante (status, próxima cobrança) exige scroll

---

## Solution: Tab-Based Architecture

### Tab Structure

**3 Tabs com Progressive Disclosure:**

**Tab 1: "Visão Geral"** (Overview) - DEFAULT
- Propósito: Informação crítica rápida (status, cobrança, ações)
- Conteúdo: Plano atual compacto + Quick stats + Actions
- Uso: 80% dos acessos (apenas ver status)

**Tab 2: "Planos"** (Plans)
- Propósito: Comparar e trocar de plano
- Conteúdo: Grid de planos + Tabela comparativa (desktop)
- Uso: 15% dos acessos (quando quer upgrade)

**Tab 3: "Histórico"** (Billing History)
- Propósito: Consultar faturas e pagamentos
- Conteúdo: Tabela de invoices + Payment methods (futuro)
- Uso: 5% dos acessos (consulta pontual)

---

## Tab 1: Visão Geral (Overview)

### Purpose
Mostrar status atual da assinatura com informações críticas em layout compacto. Usuário vê tudo sem scroll.

### Layout Mobile (320px-767px)

**Estrutura:**
```
┌─────────────────────────────────┐
│  [Stats Cards - 2 cols grid]    │  ← Métricas rápidas
├─────────────────────────────────┤
│  [Plano Atual - Card Compacto]  │  ← Informação principal
├─────────────────────────────────┤
│  [Quick Actions - Stack]        │  ← CTAs principais
└─────────────────────────────────┘
```

**Componentes:**

**Stats Cards (2x1 grid):**
```
{"layout":"grid grid-cols-2 gap-3","cards":[{"title":"Próxima Cobrança","value":"15 Jan 2025","icon":"Calendar","color":"muted"},{"title":"Status","value":"Ativa","icon":"CheckCircle","color":"success","badge":true}]}
```

**Plano Atual Card (Compacto):**
```
{"layout":"Card compacto sem footer","header":{"title":"Seu Plano","badge":"Starter"},"content":{"price":"R$ 0,00/mês","features":"Lista resumida (3-4 items)"}}
```

**Quick Actions (Stack vertical):**
```
{"buttons":[{"label":"Fazer Upgrade","variant":"default","icon":"ArrowUpCircle","primary":true},{"label":"Gerenciar Assinatura","variant":"outline","icon":"Settings"}]}
```

### Layout Desktop (1024px+)

**Estrutura:**
```
┌─────────────────────────────────────────────────────┐
│  [Stats Cards - 4 cols grid]                        │
├─────────────────────────────────────────────────────┤
│  [Plano Atual]           [Quick Actions - Sidebar]  │
│  (2/3 width)             (1/3 width)                 │
└─────────────────────────────────────────────────────┘
```

**Stats Cards (4 cols):**
```
{"cards":[{"title":"Plano Atual","value":"Starter"},{"title":"Próxima Cobrança","value":"15 Jan 2025"},{"title":"Status","value":"Ativa","badge":"success"},{"title":"Gasto Mensal","value":"R$ 0,00"}]}
```

**Layout 2-column:**
```
{"left":"Card do plano com features detalhadas (2/3)","right":"Actions em sidebar vertical (1/3)"}
```

### New Component: PlanOverviewCard

**Location:** `components/features/billing/plan-overview-card.tsx`

**Purpose:** Card compacto do plano atual para tab Overview (substitui CurrentPlanCard na tab 1)

**Props:**
```
{"props":[{"name":"plan","type":"DisplayPlan","required":true},{"name":"subscription","type":"Subscription | undefined","required":false},{"name":"className","type":"string","required":false}]}
```

**Layout:**
```tsx
<Card>
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Seu Plano</CardTitle>
        <Badge>{plan.name}</Badge>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold">{formatPrice(plan.price)}</div>
        <div className="text-xs text-muted-foreground">por mês</div>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <ul className="space-y-2">
      {plan.features.slice(0, 4).map(...)}  {/* Max 4 features */}
    </ul>
  </CardContent>
</Card>
```

### New Component: StatCard

**Location:** `components/features/billing/stat-card.tsx`

**Purpose:** Card de métrica individual (próxima cobrança, status, etc)

**Props:**
```
{"props":[{"name":"title","type":"string","required":true},{"name":"value","type":"string","required":true},{"name":"icon","type":"LucideIcon","required":true},{"name":"variant","type":"default | success | warning | destructive","required":false,"default":"default"},{"name":"badge","type":"boolean","required":false,"default":"false"}]}
```

**Layout:**
```tsx
<Card>
  <CardContent className="p-4">
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-{variant}/10 p-2.5">
        <Icon className="h-4 w-4 text-{variant}" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{title}</p>
        {badge ? (
          <Badge variant={variant}>{value}</Badge>
        ) : (
          <p className="text-sm font-semibold truncate">{value}</p>
        )}
      </div>
    </div>
  </CardContent>
</Card>
```

### New Component: QuickActions

**Location:** `components/features/billing/quick-actions.tsx`

**Purpose:** Botões de ação rápida (Upgrade, Gerenciar, Downgrade)

**Props:**
```
{"props":[{"name":"currentPlan","type":"DisplayPlan","required":true},{"name":"hasSubscription","type":"boolean","required":true},{"name":"onUpgrade","type":"() => void","required":true},{"name":"onManage","type":"() => void","required":true},{"name":"onDowngrade","type":"() => void","required":false},{"name":"loading","type":"boolean","required":false,"default":"false"}]}
```

**Layout (Mobile - Stack):**
```tsx
<div className="space-y-3">
  {canUpgrade && (
    <Button className="w-full h-11" onClick={onUpgrade}>
      <ArrowUpCircle className="mr-2 h-4 w-4" />
      Fazer Upgrade
    </Button>
  )}
  {hasSubscription && (
    <Button variant="outline" className="w-full h-11" onClick={onManage}>
      <Settings className="mr-2 h-4 w-4" />
      Gerenciar Assinatura
    </Button>
  )}
</div>
```

**Layout (Desktop - Sidebar):**
```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-base">Ações</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    {/* Same buttons */}
  </CardContent>
</Card>
```

---

## Tab 2: Planos (Plans)

### Purpose
Comparar planos disponíveis e selecionar novo plano. Foco em comparação visual.

### Layout Mobile

**Estrutura:**
```
┌─────────────────────────────────┐
│  [Comparison Toggle]             │  ← Switch: Cards | Table
├─────────────────────────────────┤
│  [Plan Cards - Stack vertical]   │
│  - Starter (current)             │
│  - Professional                  │
│  - Enterprise                    │
└─────────────────────────────────┘
```

**Componentes:**
- Usa `PlanCard` existente (já adaptativo)
- Grid adaptativo (já implementado)
- Destaque visual no plano atual

### Layout Desktop

**Estrutura:**
```
┌─────────────────────────────────────────────────────┐
│  [View Toggle: Cards | Table]                       │
├─────────────────────────────────────────────────────┤
│  [Plan Cards Grid - 3 cols]  OU  [Comparison Table] │
└─────────────────────────────────────────────────────┘
```

**Comparison Table (Desktop only):**
```
{"enabled":"Desktop lg+ only","layout":"Tabela com features em linhas, planos em colunas","highlighting":"Coluna do plano atual com bg subtle"}
```

### New Component: PlanComparisonTable

**Location:** `components/features/billing/plan-comparison-table.tsx`

**Purpose:** Tabela comparativa de features entre planos (desktop)

**Props:**
```
{"props":[{"name":"plans","type":"DisplayPlan[]","required":true},{"name":"currentPlanCode","type":"string","required":true},{"name":"onSelectPlan","type":"(plan: DisplayPlan) => void","required":true},{"name":"loading","type":"boolean","required":false}]}
```

**Structure:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Recursos</TableHead>
      {plans.map(plan => (
        <TableHead key={plan.code} className={cn(
          "text-center",
          plan.code === currentPlanCode && "bg-primary/5"
        )}>
          <div>{plan.name}</div>
          <div className="text-lg font-bold">{formatPrice(plan.price)}</div>
        </TableHead>
      ))}
    </TableRow>
  </TableHeader>
  <TableBody>
    {/* Features comparison rows */}
  </TableBody>
</Table>
```

### View Toggle Component

**Location:** Inline no billing.tsx (Tab 2)

**Pattern:**
```tsx
<div className="flex items-center justify-end gap-2 mb-4">
  <Button
    variant={view === 'cards' ? 'default' : 'ghost'}
    size="sm"
    onClick={() => setView('cards')}
  >
    <LayoutGrid className="mr-2 h-4 w-4" />
    Cards
  </Button>
  <Button
    variant={view === 'table' ? 'default' : 'ghost'}
    size="sm"
    onClick={() => setView('table')}
    className="hidden lg:flex"
  >
    <Table className="mr-2 h-4 w-4" />
    Comparar
  </Button>
</div>
```

---

## Tab 3: Histórico (Billing History)

### Purpose
Consultar faturas, downloads e métodos de pagamento.

### Layout

Usa componente existente `BillingHistory` sem alterações.

**Enhancements futuros (opcional):**
```
{"features":["Payment methods section","Filtros por data/status","Export CSV","Download all invoices"]}
```

---

## Main Page Structure

### File: billing.tsx (Redesigned)

**Structure:**
```tsx
export default function BillingPage() {
  const [activeTab, setActiveTab] = React.useState("overview")
  const [planView, setPlanView] = React.useState<"cards" | "table">("cards")

  // ... existing hooks and logic

  return (
    <AppShell currentPath="/admin/billing" breadcrumb={["Administração", "Assinatura"]}>
      <div className="space-y-6">
        <PageHeader
          title="Assinatura e Cobrança"
          description="Gerencie seu plano e pagamentos"
        />

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* TAB 1: Overview */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatCard title="Plano Atual" value={currentPlan.name} icon={CreditCard} />
              <StatCard
                title="Próxima Cobrança"
                value={formattedNextBilling || "—"}
                icon={Calendar}
              />
              <StatCard
                title="Status"
                value={statusLabel}
                icon={CheckCircle}
                variant="success"
                badge
              />
              <StatCard
                title="Gasto Mensal"
                value={formatPrice(currentPlan.price)}
                icon={DollarSign}
              />
            </div>

            {/* Plan + Actions Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Plan Overview Card (2/3) */}
              <div className="lg:col-span-2">
                <PlanOverviewCard plan={currentPlan} subscription={subscription} />
              </div>

              {/* Quick Actions (1/3) */}
              <div>
                <QuickActions
                  currentPlan={currentPlan}
                  hasSubscription={!!subscription}
                  onUpgrade={() => setActiveTab("plans")}
                  onManage={handleManageSubscription}
                  loading={isMutating}
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Plans */}
          <TabsContent value="plans" className="space-y-6">
            {/* View Toggle (Desktop) */}
            <div className="flex items-center justify-end gap-2">
              <Button
                variant={planView === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPlanView('cards')}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Cards
              </Button>
              <Button
                variant={planView === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPlanView('table')}
                className="hidden lg:flex"
              >
                <TableIcon className="mr-2 h-4 w-4" />
                Comparar
              </Button>
            </div>

            {/* Plans Grid or Table */}
            {planView === 'cards' ? (
              <div className={gridClasses}>
                {displayPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isCurrent={plan.code === currentPlan?.code}
                    isRecommended={plan.code === "pro"}
                    onSelect={handleSelectPlan}
                    loading={isMutating}
                    spotlight={displayPlans.length === 1}
                  />
                ))}
              </div>
            ) : (
              <PlanComparisonTable
                plans={displayPlans}
                currentPlanCode={currentPlan?.code}
                onSelectPlan={handleSelectPlan}
                loading={isMutating}
              />
            )}
          </TabsContent>

          {/* TAB 3: History */}
          <TabsContent value="history">
            <BillingHistory
              invoices={billingInfo?.subscription ? mockInvoices : []}
              loading={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
```

---

## Component Summary

### New Components Required

**1. StatCard** (`components/features/billing/stat-card.tsx`)
- Purpose: Métrica individual (próxima cobrança, status)
- Props: title, value, icon, variant, badge
- Size: ~50 lines

**2. PlanOverviewCard** (`components/features/billing/plan-overview-card.tsx`)
- Purpose: Card compacto do plano atual (tab Overview)
- Props: plan, subscription
- Size: ~100 lines

**3. QuickActions** (`components/features/billing/quick-actions.tsx`)
- Purpose: Botões de ação rápida (Upgrade, Gerenciar)
- Props: currentPlan, hasSubscription, callbacks, loading
- Size: ~80 lines

**4. PlanComparisonTable** (`components/features/billing/plan-comparison-table.tsx`)
- Purpose: Tabela comparativa de planos (desktop)
- Props: plans, currentPlanCode, onSelectPlan, loading
- Size: ~150 lines

### Modified Components

**1. billing.tsx** (MAJOR REFACTOR)
- Add Tabs structure
- Reorganize content into 3 tabs
- Add state for activeTab and planView
- Integrate new components

**2. PlanCard** (NO CHANGES)
- Already updated with spotlight prop ✅

**3. CurrentPlanCard** (DEPRECATED in Tab 1, kept for Tab 2 if needed)
- Substituído por PlanOverviewCard na Tab 1
- Pode ser removido se não for usado

**4. BillingHistory** (NO CHANGES)
- Used as-is in Tab 3 ✅

---

## Mobile-First Implementation

### Breakpoint Strategy

**Mobile (320px-767px):**
```
{"tabs":"Full-width, 3 cols grid","statsCards":"2 cols grid","planOverview":"Full-width stack","actions":"Stack vertical","plansView":"Cards only (stack)","history":"Mobile table (já existe)"}
```

**Tablet (768px-1023px):**
```
{"tabs":"Inline flex (auto-width)","statsCards":"4 cols grid","planOverview":"2/3 + 1/3 layout","actions":"Sidebar card","plansView":"Cards 2 cols","history":"Desktop table"}
```

**Desktop (1024px+):**
```
{"tabs":"Inline flex","statsCards":"4 cols grid","planOverview":"2/3 + 1/3 layout","actions":"Sidebar card","plansView":"Cards 3 cols OR Table comparison","history":"Desktop table + filters"}
```

### Touch Targets

```
{"tabs":"h-11 minimum (44px)","buttons":"h-11 minimum","statCards":"p-4 minimum touch area","planCards":"Full card clickable (já existe)"}
```

---

## Animation & Motion

### Tab Transitions

```tsx
import { motion, AnimatePresence } from "framer-motion"

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
}

<TabsContent value="overview">
  <motion.div
    variants={tabVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    transition={{ duration: 0.2 }}
  >
    {/* Content */}
  </motion.div>
</TabsContent>
```

### Stats Cards Stagger

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

<motion.div
  className="grid grid-cols-2 md:grid-cols-4 gap-3"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {stats.map(stat => (
    <motion.div key={stat.title} variants={cardVariants}>
      <StatCard {...stat} />
    </motion.div>
  ))}
</motion.div>
```

---

## Visual Hierarchy

### Information Priority

**Tab 1 (Overview):**
```
{"priority":{"1":"Stats Cards (próxima cobrança, status) - primeira visual","2":"Plano atual - contexto","3":"Actions - CTA secundária"}}
```

**Tab 2 (Plans):**
```
{"priority":{"1":"Plano recomendado - destaque visual","2":"Plano atual - indicador visual","3":"Outros planos - exploração"}}
```

**Tab 3 (History):**
```
{"priority":{"1":"Invoices recentes - topo","2":"Filtros - secundário","3":"Empty state se não houver faturas"}}
```

---

## Accessibility

```
{"a11y":["Tab navigation com arrow keys (Radix built-in)","Focus visible em todos tabs","Keyboard Enter para selecionar plano","Screen reader: Anunciar tab ativa","Labels em todos buttons","ARIA labels nos StatCards","Color contrast WCAG AA em badges","Reduced motion support nas animations"]}
```

---

## Testing Scenarios

```
{"scenarios":[{"case":"Tab padrão (Overview)","expected":"Abre em Overview, stats cards visíveis, sem scroll necessário"},{"case":"Click em tab Planos","expected":"Transição suave, grid de planos adaptativo"},{"case":"1 plano disponível","expected":"Spotlight layout no plano (tab Plans)"},{"case":"3 planos disponíveis","expected":"Grid 3 cols (tab Plans)"},{"case":"Desktop: Toggle Cards/Table","expected":"Alterna entre views, table só em lg+"},{"case":"Mobile: Tabs scroll horizontal","expected":"TabsList scrollável se não couber"},{"case":"Empty history","expected":"EmptyState com ícone e mensagem"},{"case":"Keyboard navigation","expected":"Tab key navega corretamente, Enter ativa"}]}
```

---

## Dev Agent Instructions

```
{"implementation":{"priority":"Alta - redesign profissional completo","complexity":"Média-Alta - 4 componentes novos + refactor major","estimatedLOC":"~600 lines total","files":["apps/frontend/src/pages/billing.tsx (MAJOR REFACTOR)","apps/frontend/src/components/features/billing/stat-card.tsx (NEW)","apps/frontend/src/components/features/billing/plan-overview-card.tsx (NEW)","apps/frontend/src/components/features/billing/quick-actions.tsx (NEW)","apps/frontend/src/components/features/billing/plan-comparison-table.tsx (NEW)"],"steps":["Criar StatCard component","Criar PlanOverviewCard component","Criar QuickActions component","Criar PlanComparisonTable component (opcional para MVP)","Refatorar billing.tsx com Tabs structure","Integrar todos componentes nos tabs","Adicionar animations (Motion)","Testar responsividade (320px, 768px, 1024px)","Testar keyboard navigation","Verificar a11y"],"skillRequired":".claude/skills/ux-design/SKILL.md","mobileFirst":["Design começa em 320px","Tabs full-width mobile, inline desktop","Stats cards 2 cols mobile, 4 cols desktop","Actions stack mobile, sidebar desktop","Table comparison desktop-only (lg+)"],"dependencies":{"existing":["Tabs component (shadcn) ✅","PlanCard component ✅","BillingHistory component ✅"],"new":["StatCard","PlanOverviewCard","QuickActions","PlanComparisonTable (opcional MVP)"]},"mvp":{"phase1":"Tabs + StatCard + PlanOverviewCard + QuickActions (sem table comparison)","phase2":"PlanComparisonTable + View toggle"}}}
```

---

## Before/After Comparison

### BEFORE (Current)
```
Vertical stack:
┌─────────────────────┐
│ Page Header         │
├─────────────────────┤
│ CurrentPlanCard     │  ← Grande, muitos botões
│ (200px height)      │
├─────────────────────┤
│ Planos Disponíveis  │  ← Scroll necessário
│ - Cards grid        │
├─────────────────────┤
│ Histórico           │  ← Mais scroll
│ - Empty state       │
└─────────────────────┘

Problems:
- Scroll excessivo (500px+ height)
- Informação fragmentada
- Hierarquia confusa
- Espaço mal aproveitado
```

### AFTER (Proposed)
```
Tab-based:
┌─────────────────────┐
│ Page Header         │
├─────────────────────┤
│ [Tabs: Overview | Plans | History]
├─────────────────────┤
│ TAB CONTENT         │
│ (progressive)       │
│                     │
│ Overview:           │
│ - Stats (4 cards)   │  ← Informação crítica no topo
│ - Plan + Actions    │  ← Compacto, sem scroll
│                     │
└─────────────────────┘

Benefits:
- Informação organizada
- Sem scroll necessário (tab Overview)
- Hierarquia clara
- Progressive disclosure
- Desktop space otimizado
```

---

## Visual Examples (Text-Based)

### Tab 1: Overview (Mobile)
```
┌─────────────────────────────────┐
│ [Tab: Visão Geral]              │
├─────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐         │
│ │Próx Cobr│ │ Status  │         │ ← Stats 2 cols
│ │15 Jan   │ │✓ Ativa  │         │
│ └─────────┘ └─────────┘         │
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │ Seu Plano: Starter        │   │ ← Plan compacto
│ │ R$ 0,00/mês               │   │
│ │ • 3 workspaces            │   │
│ │ • Até 5 usuários          │   │
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │ [↑ Fazer Upgrade]         │   │ ← Actions stack
│ └───────────────────────────┘   │
│ ┌───────────────────────────┐   │
│ │ [⚙ Gerenciar]             │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

### Tab 1: Overview (Desktop)
```
┌───────────────────────────────────────────────────────┐
│ [Tab: Visão Geral | Planos | Histórico]              │
├───────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │
│ │Plano │ │Próx  │ │Status│ │Gasto │                 │ ← Stats 4 cols
│ │Start.│ │15Jan │ │✓Ativa│ │R$0,00│                 │
│ └──────┘ └──────┘ └──────┘ └──────┘                 │
├───────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────┐     │
│ │ Seu Plano: Starter      │ │ Ações           │     │ ← 2/3 + 1/3
│ │ R$ 0,00/mês             │ │                 │     │
│ │                         │ │ [↑ Upgrade]     │     │
│ │ • 3 workspaces          │ │ [⚙ Gerenciar]   │     │
│ │ • Até 5 usuários        │ │                 │     │
│ │ • Suporte por email     │ │                 │     │
│ │ • Integrações básicas   │ │                 │     │
│ └─────────────────────────┘ └─────────────────┘     │
└───────────────────────────────────────────────────────┘
```

### Tab 2: Plans (Cards View)
```
┌───────────────────────────────────────────────────────┐
│ [Tab: Planos]                    [Cards | Comparar]  │
├───────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│ │ Starter  │ │   Pro    │ │Enterprise│              │
│ │✓ Atual   │ │⭐Recomen.│ │          │              │
│ │ R$ 0,00  │ │ R$ 49,00 │ │R$ 199,00 │              │
│ └──────────┘ └──────────┘ └──────────┘              │
└───────────────────────────────────────────────────────┘
```

### Tab 2: Plans (Table View - Desktop)
```
┌───────────────────────────────────────────────────────┐
│ [Tab: Planos]                    [Cards | Comparar]  │
├───────────────────────────────────────────────────────┤
│ Recursos          │ Starter  │  Pro     │ Enterprise │
│───────────────────┼──────────┼──────────┼────────────│
│ Preço             │ R$ 0,00  │ R$ 49,00 │ R$ 199,00  │
│ Workspaces        │    3     │    10    │ Ilimitado  │
│ Usuários/Work     │    5     │    20    │ Ilimitado  │
│ Suporte           │  Email   │Prioritár.│ Dedicado   │
│                   │          │          │            │
│ [CTA]             │✓ Atual   │[Selecionar]│[Selecionar]│
└───────────────────────────────────────────────────────┘
```

---

## References

**Design System:** `docs/design-system/foundations.md`
**UX Skill:** `.claude/skills/ux-design/SKILL.md`
**Tabs Component:** `apps/frontend/src/components/ui/tabs.tsx` (Radix UI)
**shadcn Docs:** `.claude/skills/ux-design/shadcn-docs.md`
**Motion Docs:** `.claude/skills/ux-design/motion-dev-docs.md`

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12-24 | Initial professional redesign specification - Tab-based architecture, 4 new components, mobile-first |
| 1.1.0 | 2024-12-24 | Bug fixes: Added price loading from database + dynamic badges from API |

---

## Version 1.1.0 - Bug Fixes & Dynamic Badges (2024-12-24)

### Problems Fixed

**1. Preços não carregando (price: null)**
- API retornava `price: null` para todos os planos
- Backend tinha TODO comentário para fazer join com `plan_prices`
- Usuários viam R$ 0,00 em todos os planos

**2. Badges hardcoded**
- Badge "Recomendado" estava hardcoded para `plan.code === "pro"`
- Ignorava configuração `features.display.badge` do banco de dados
- Sem flexibilidade para mudar badges via admin

### Solutions Implemented

#### Backend: Plan Prices Join

**Files Modified:**
- [libs/app-database/src/interfaces/IPlanRepository.ts](../../libs/app-database/src/interfaces/IPlanRepository.ts)
- [libs/app-database/src/repositories/PlanRepository.ts](../../libs/app-database/src/repositories/PlanRepository.ts)
- [apps/backend/src/api/modules/billing/billing.service.ts](../../apps/backend/src/api/modules/billing/billing.service.ts)

**Changes:**
1. Created `PlanWithPrice` interface extending `Plan` with optional `currentPrice`
2. Implemented `findActiveWithCurrentPrices()` method with LEFT JOIN to `plan_prices`
3. Updated `getAvailablePlans()` to use new repository method
4. Prices now correctly returned:
   - STARTER: R$ 49,00 (4900 cents)
   - PROFESSIONAL: R$ 99,00 (9900 cents)
   - FREE: null (no price)

**Code Example:**
```typescript
// PlanRepository.ts
async findActiveWithCurrentPrices(): Promise<PlanWithPrice[]> {
  const results = await this.db
    .selectFrom('plans')
    .leftJoin('plan_prices', (join) =>
      join
        .onRef('plan_prices.plan_id', '=', 'plans.id')
        .on('plan_prices.is_current', '=', true)
    )
    .select([...])
    .execute();

  return results.map((row) => ({
    ...plan,
    currentPrice: row.price_id ? {
      amount: row.price_amount,
      currency: row.price_currency,
      // ... other fields
    } : undefined
  }));
}
```

#### Frontend: Dynamic Badges

**Files Modified:**
- [apps/frontend/src/pages/billing.tsx](../../apps/frontend/src/pages/billing.tsx)
- [apps/frontend/src/components/features/billing/plan-comparison-table.tsx](../../apps/frontend/src/components/features/billing/plan-comparison-table.tsx)

**Changes:**

1. **Extended DisplayPlan interface:**
```typescript
interface DisplayPlan {
  // ... existing fields
  badge?: "popular" | "new" | "best-value" | null
  highlighted?: boolean
  ctaText?: string
  ctaVariant?: "default" | "outline" | "secondary"
}
```

2. **Transform function now maps API display data:**
```typescript
function transformPlanToDisplay(plan: BillingPlan): DisplayPlan {
  return {
    // ... existing fields
    badge: plan.features.display?.badge || null,
    highlighted: plan.features.display?.highlighted || false,
    ctaText: plan.features.display?.ctaText || "Selecionar Plano",
    ctaVariant: plan.features.display?.ctaVariant || "outline",
  }
}
```

3. **PlanComparisonTable uses dynamic badges:**
```typescript
const getBadgeLabel = (badge?: "popular" | "new" | "best-value" | null) => {
  switch (badge) {
    case "popular": return "Mais Popular"
    case "best-value": return "Melhor Custo-Benefício"
    case "new": return "Novo"
    default: return null
  }
}

// In render:
{badgeLabel && !isCurrent && (
  <Badge variant="default" className="gap-1.5 bg-accent hover:bg-accent/90">
    <Sparkles className="h-3 w-3" />
    {badgeLabel}
  </Badge>
)}
```

4. **Price formatting fixed:**
```typescript
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price / 100) // Convert from cents to reais
}
```

### Database Configuration

Badges are configured in seed migration [20250101002_seed_default_plans.js](../../libs/app-database/migrations/20250101002_seed_default_plans.js):

```javascript
// STARTER Plan
features: {
  display: {
    badge: 'popular',
    highlighted: true,
    ctaText: 'Começar Agora',
    ctaVariant: 'default',
    comparisonLabel: 'Mais Popular',
  }
}

// PROFESSIONAL Plan
features: {
  display: {
    badge: 'best-value',
    highlighted: false,
    ctaText: 'Escalar Negócio',
    ctaVariant: 'default',
    comparisonLabel: 'Melhor Custo-Benefício',
  }
}
```

### Results

**Before:**
- ❌ All plans showing R$ 0,00
- ❌ "Recomendado" badge hardcoded to PRO plan
- ❌ No flexibility to change badges via admin

**After:**
- ✅ Correct prices from database (R$ 49,00 for STARTER, R$ 99,00 for PROFESSIONAL)
- ✅ Dynamic badges based on `features.display.badge`
- ✅ Highlighted plans based on `features.display.highlighted`
- ✅ Custom CTA texts per plan
- ✅ Better conversion with strategic badge placement

### Badge Labels Map

| API Value | Portuguese Label | Use Case |
|-----------|------------------|----------|
| `popular` | "Mais Popular" | Most chosen plan |
| `best-value` | "Melhor Custo-Benefício" | Best price/features ratio |
| `new` | "Novo" | Recently launched plan |
| `null` | (no badge) | Default state |

### Future Enhancements

- [ ] Admin panel to edit plan badges and highlights
- [ ] A/B testing for different badge strategies
- [ ] Conversion metrics per plan
- [ ] Tooltip support for highlighted features
