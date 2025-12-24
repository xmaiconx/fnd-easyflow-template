"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { CurrentPlanCard } from "@/components/features/billing/current-plan-card"
import { PlanCard } from "@/components/features/billing/plan-card"
import { BillingHistory, type Invoice } from "@/components/features/billing/billing-history"
import { usePlans, useCurrentBillingInfo, useCreateCheckout, useCreatePortal } from "@/hooks/use-billing"
import { useAuthStore } from "@/stores/auth-store"
import type { BillingPlan } from "@/types"

interface DisplayPlan {
  id: string
  code: string
  name: string
  price: number
  features: string[]
}

function transformPlanToDisplay(plan: BillingPlan): DisplayPlan {
  const displayFeatures = plan.features.display?.displayFeatures || []
  const features = displayFeatures.length > 0
    ? displayFeatures.map((f) => f.text)
    : [
        `${plan.features.limits.workspaces === -1 ? 'Ilimitados' : plan.features.limits.workspaces} workspace${plan.features.limits.workspaces !== 1 ? 's' : ''}`,
        `Até ${plan.features.limits.usersPerWorkspace === -1 ? 'ilimitados' : plan.features.limits.usersPerWorkspace} usuários por workspace`,
      ]

  return {
    id: plan.code,
    code: plan.code,
    name: plan.name,
    price: plan.price?.amount || 0,
    features,
  }
}

export default function BillingPage() {
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)
  const { data: plans, isLoading: plansLoading } = usePlans()
  const { data: billingInfo, isLoading: billingLoading } = useCurrentBillingInfo()
  const createCheckout = useCreateCheckout()
  const createPortal = useCreatePortal()

  const displayPlans: DisplayPlan[] = React.useMemo(() => {
    if (!plans) return []
    return plans
      .map(transformPlanToDisplay)
      .sort((a, b) => {
        const order = { free: 0, pro: 1, enterprise: 2 }
        return (order[a.code as keyof typeof order] ?? 99) - (order[b.code as keyof typeof order] ?? 99)
      })
  }, [plans])

  const currentPlan = React.useMemo(() => {
    if (!billingInfo) return displayPlans[0]
    return displayPlans.find((p) => p.code === billingInfo.plan.code) || displayPlans[0]
  }, [billingInfo, displayPlans])

  const subscription = React.useMemo(() => {
    if (!billingInfo?.subscription) return undefined
    return {
      id: 'current',
      status: billingInfo.subscription.status as 'active' | 'canceled' | 'past_due',
      currentPeriodEnd: billingInfo.subscription.currentPeriodEnd,
    }
  }, [billingInfo])

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

  const handleSelectPlan = async (plan: DisplayPlan) => {
    if (!currentWorkspace) return
    createCheckout.mutate({
      workspaceId: currentWorkspace.id,
      planCode: plan.code,
    })
  }

  const handleManageSubscription = async () => {
    if (!currentWorkspace) return
    createPortal.mutate(currentWorkspace.id)
  }

  const isLoading = plansLoading || billingLoading
  const isMutating = createCheckout.isPending || createPortal.isPending

  // Mock invoices (seria integrado com API de invoices futuramente)
  const mockInvoices: Invoice[] = []

  if (isLoading) {
    return (
      <AppShell currentPath="/admin/billing" breadcrumb={["Administração", "Assinatura"]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell currentPath="/admin/billing" breadcrumb={["Administração", "Assinatura"]}>
      <div className="space-y-6">
        <PageHeader
          title="Assinatura e Cobrança"
          description="Gerencie seu plano e pagamentos"
        />

        {/* Current Plan */}
        {currentPlan && (
          <CurrentPlanCard
            plan={currentPlan}
            subscription={subscription}
            onManage={handleManageSubscription}
          />
        )}

        {/* Available Plans */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Planos Disponíveis</h2>
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
        </div>

        {/* Billing History */}
        <BillingHistory
          invoices={billingInfo?.subscription ? mockInvoices : []}
          loading={false}
        />
      </div>
    </AppShell>
  )
}
