# Design Improvement: Billing Adaptive Layout

**Type:** UX Enhancement | **Date:** 2024-12-24 | **Target:** `/admin/billing`

Melhoria de UX para a página de billing que adapta o layout baseado na quantidade de planos disponíveis (1, 2 ou 3+ planos). Atualmente o grid é fixo em 3 colunas no desktop, causando má distribuição visual quando há menos planos.

**Princípios aplicados:** Mobile-first, progressive enhancement, layout fluido, hierarquia visual clara.

**Skill Reference:** .claude/skills/ux-design/SKILL.md

---

## Spec (Token-Efficient)

### Context
{"page":"apps/frontend/src/pages/billing.tsx","components":["plan-card.tsx","current-plan-card.tsx"],"currentIssue":"Grid fixo 3 cols independente de quantidade de planos","solution":"Layout adaptativo baseado em displayPlans.length","stack":"React+TailwindV3+Motion+shadcn","designSystem":"docs/design-system/foundations.md"}

### Problem Analysis
{"currentBehavior":"Grid sempre `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (linha 120)","issues":{"1plan":"Card pequeno em espaço grande, visual desproporcional","2plans":"Espaço vazio na 3ª coluna em lg+, assimetria visual","3plans":"Layout atual funciona bem"},"userImpact":"Percepção de interface 'vazia' ou mal planejada quando SaaS tem poucos planos"}

### Adaptive Layout Strategy

**1 Plano Disponível (Spotlight Layout):**
```
{"mobile":"Full-width card, padding lateral 4","tablet":"Centralizado, max-w-md (448px)","desktop":"Centralizado, max-w-lg (512px)","visual":["Border primary/50","Shadow-lg","Subtle glow effect","Scale animation on mount"],"cta":"Botão destacado, maior (h-12)"}
```

**Estrutura visual (desktop):**
```
┌────────────────────────────────────────┐
│                                        │
│         [Espaço vazio lateral]         │
│    ┌──────────────────────────┐       │
│    │                          │       │
│    │     ÚNICO PLANO          │       │
│    │   (centralizado, large)  │       │
│    │                          │       │
│    └──────────────────────────┘       │
│         [Espaço vazio lateral]         │
│                                        │
└────────────────────────────────────────┘
```

**2 Planos Disponíveis (Comparison Layout):**
```
{"mobile":"Stack vertical, gap-6","tablet":"2 cols lado a lado, gap-6","desktop":"2 cols, max-w-4xl centralizado, gap-8","visual":["Plano recomendado destacado (se aplicável)","Altura equalizada (h-full)","Hover scale 1.03"],"comparison":"Layout incentiva comparação direta"}
```

**Estrutura visual (desktop):**
```
┌────────────────────────────────────────┐
│     [Espaço]                  [Espaço] │
│  ┌─────────────┐  ┌─────────────┐     │
│  │   PLANO 1   │  │   PLANO 2   │     │
│  │             │  │ (Recomend.) │     │
│  │             │  │             │     │
│  └─────────────┘  └─────────────┘     │
│     [Espaço]                  [Espaço] │
└────────────────────────────────────────┘
```

**3+ Planos Disponíveis (Grid Layout):**
```
{"mobile":"Stack vertical, gap-4","tablet":"2 cols, gap-6","desktop":"3 cols, gap-6","visual":"Layout atual mantido","note":"Funciona bem para 3-4 planos comuns em SaaS"}
```

**Estrutura visual (desktop):**
```
┌────────────────────────────────────────┐
│ ┌──────┐  ┌──────┐  ┌──────┐          │
│ │ FREE │  │  PRO │  │ ENTER│          │
│ │      │  │(Rec.)│  │PRISE │          │
│ │      │  │      │  │      │          │
│ └──────┘  └──────┘  └──────┘          │
└────────────────────────────────────────┘
```

### Implementation Details

**File:** `apps/frontend/src/pages/billing.tsx`

**Changes Required:**
```
{"line":120,"current":"<div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6\">","new":"Dynamic className based on displayPlans.length"}
```

**Code Pattern:**
```tsx
// Calcular classes dinâmicas
const gridClasses = React.useMemo(() => {
  const count = displayPlans.length

  if (count === 1) {
    return "flex justify-center"
  }

  if (count === 2) {
    return "grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto"
  }

  return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
}, [displayPlans.length])

// Aplicar no JSX (linha 120)
<div className={gridClasses}>
  {displayPlans.map((plan) => (
    <PlanCard
      key={plan.id}
      plan={plan}
      isCurrent={plan.code === currentPlan?.code}
      isRecommended={plan.code === "pro"}
      onSelect={handleSelectPlan}
      loading={isMutating}
      // Passar prop adicional para 1 plano
      spotlight={displayPlans.length === 1}
    />
  ))}
</div>
```

**Componente PlanCard Enhancement (Opcional):**
```
{"file":"apps/frontend/src/components/features/billing/plan-card.tsx","changes":{"newProp":"spotlight?: boolean","conditionalStyles":"Aplicar max-w-lg quando spotlight=true","animation":"Scale maior no mount se spotlight (1.05)"}}
```

**Props Addition:**
```tsx
interface PlanCardProps {
  // ... existing props
  spotlight?: boolean  // NEW: Destaque visual quando é o único plano
}

// No component
<Card
  className={cn(
    "group relative transition-all h-full flex flex-col",
    !isCurrent && "hover:shadow-lg hover:border-primary/50 cursor-pointer",
    isCurrent && "border-primary/50 shadow-md",
    isRecommended && "border-accent/50",
    spotlight && "max-w-lg shadow-xl border-primary/60 bg-gradient-to-br from-card to-card/80",
    className
  )}
>
```

### Animation Enhancements

**Staggered Entry (Para 2+ planos):**
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.div
  className={gridClasses}
  variants={container}
  initial="hidden"
  animate="show"
>
  {displayPlans.map((plan) => (
    <motion.div key={plan.id} variants={cardVariant}>
      <PlanCard {...props} />
    </motion.div>
  ))}
</motion.div>
```

**Spotlight Glow (Para 1 plano):**
```tsx
// Adicionar ao PlanCard quando spotlight=true
{spotlight && (
  <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent opacity-50 pointer-events-none" />
)}
```

### Empty State

**Se displayPlans.length === 0:**
```tsx
{displayPlans.length === 0 ? (
  <EmptyState
    icon={CreditCard}
    title="Nenhum plano disponível"
    description="Entre em contato com o suporte para mais informações"
  />
) : (
  // Grid adaptativo
)}
```

### Mobile Considerations
```
{"mobile":{"touchTargets":"CTA buttons já h-11 (44px) ✅","fontSize":"Títulos já text-xl md:text-2xl ✅","spacing":"Gap mínimo 4 (16px) entre cards ✅","scroll":"Vertical scroll natural em stack ✅"},"responsive":{"breakpoints":"md:768px (2 cols se 2+ planos), lg:1024px (3 cols se 3+)","container":"max-w constrained para 1-2 planos, full para 3+"}}
```

### Visual Hierarchy

**1 Plano:**
```
{"emphasis":"Alto - único foco visual","size":"Maior (max-w-lg)","animation":"Entrada dramática (scale 1.05)","cta":"Botão primary destacado"}
```

**2 Planos:**
```
{"emphasis":"Comparativo - lado a lado","size":"Médio (equalizado, h-full)","recommended":"Badge + border accent mais proeminente","cta":"Recommended tem bg-accent"}
```

**3+ Planos:**
```
{"emphasis":"Varredura - grid exploratório","size":"Padrão (cards compactos)","recommended":"Badge + hover effect","cta":"Padrão outline/primary"}
```

### Accessibility
```
{"a11y":["Ordem de tab lógica (esquerda→direita)","Focus visible em cards clicáveis ✅","Keyboard navigation: Enter para selecionar","Screen reader: Anunciar quantidade de planos disponíveis","Reduced motion: Desabilitar stagger se prefers-reduced-motion"]}
```

### Testing Scenarios
```
{"scenarios":[{"case":"1 plano disponível","expected":"Card centralizado, max-w-lg, shadow-xl, glow effect"},{"case":"2 planos disponíveis","expected":"2 cols em md+, max-w-4xl container, equalizado"},{"case":"3 planos disponíveis","expected":"3 cols em lg+, grid padrão"},{"case":"4+ planos","expected":"Grid 3 cols com wrap natural"},{"case":"0 planos (edge case)","expected":"EmptyState com mensagem"}]}
```

### Dev Agent Instructions
```
{"implementation":{"priority":"Alta - melhoria visual impactante","complexity":"Baixa - apenas ajuste de classes","files":["apps/frontend/src/pages/billing.tsx (linha 120)","apps/frontend/src/components/features/billing/plan-card.tsx (opcional: prop spotlight)"],"steps":["Adicionar useMemo para calcular gridClasses baseado em displayPlans.length","Aplicar className dinâmico no container (linha 120)","(Opcional) Adicionar prop spotlight no PlanCard","(Opcional) Adicionar stagger animation com Motion","Testar visualmente com 1, 2 e 3 planos","Verificar mobile (320px)"],"skillRequired":".claude/skills/ux-design/SKILL.md","mobileFirst":["Sempre 1 col em mobile","Layout adaptativo afeta apenas md+ (tablet/desktop)","Touch targets já adequados (44px)"]},"testing":{"manual":"Testar com 1, 2, 3 planos via mock data","responsive":"320px, 768px, 1024px, 1280px","a11y":"Tab navigation, keyboard Enter, screen reader","motion":"Verificar prefers-reduced-motion"}}
```

---

## Visual Examples (Text-Based)

### Current Layout (3 cols fixo) - Problema
```
Desktop com 1 plano:
┌─────┬─────┬─────┐
│PLAN │     │     │  ← Muito espaço vazio
└─────┴─────┴─────┘

Desktop com 2 planos:
┌─────┬─────┬─────┐
│PLAN1│PLAN2│     │  ← Assimetria visual
└─────┴─────┴─────┘
```

### Proposed Layout (Adaptativo) - Solução
```
Desktop com 1 plano:
   ┌─────────┐
   │  PLAN   │  ← Centralizado, destaque
   │(spotlight)│
   └─────────┘

Desktop com 2 planos:
  ┌──────┬──────┐
  │PLAN1 │PLAN2 │  ← Balanceado, comparação
  └──────┴──────┘

Desktop com 3 planos:
┌─────┬─────┬─────┐
│PLAN1│PLAN2│PLAN3│  ← Grid tradicional
└─────┴─────┴─────┘
```

---

## References

**Design System:** `docs/design-system/foundations.md`
**UX Skill:** `.claude/skills/ux-design/SKILL.md`
**Tailwind Docs:** `.claude/skills/ux-design/tailwind-v3-docs.md`
**Motion Docs:** `.claude/skills/ux-design/motion-dev-docs.md`

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12-24 | Initial specification - Adaptive layout for 1, 2, 3+ plans |
