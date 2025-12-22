"use client"

import * as React from "react"
import { toast } from "sonner"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { CurrentPlanCard } from "@/components/features/billing/current-plan-card"
import { PlanCard } from "@/components/features/billing/plan-card"
import { BillingHistory, type Invoice } from "@/components/features/billing/billing-history"

interface Plan {
  id: string
  code: string
  name: string
  price: number
  features: string[]
}

interface Subscription {
  id: string
  status: "active" | "canceled" | "past_due"
  currentPeriodEnd: string
}

// Mock Data
const mockPlans: Plan[] = [
  {
    id: "1",
    code: "free",
    name: "Free",
    price: 0,
    features: [
      "1 workspace",
      "Até 5 usuários",
      "Suporte básico por email",
      "1 GB de armazenamento",
    ],
  },
  {
    id: "2",
    code: "pro",
    name: "Pro",
    price: 29,
    features: [
      "5 workspaces",
      "Até 20 usuários",
      "Suporte prioritário",
      "Analytics avançado",
      "10 GB de armazenamento",
      "Integrações premium",
    ],
  },
  {
    id: "3",
    code: "enterprise",
    name: "Enterprise",
    price: 99,
    features: [
      "Workspaces ilimitados",
      "Usuários ilimitados",
      "Suporte 24/7",
      "Integrações customizadas",
      "SLA garantido",
      "100 GB de armazenamento",
      "Gerente de conta dedicado",
      "Treinamento personalizado",
    ],
  },
]

const mockInvoices: Invoice[] = [
  {
    id: "1",
    date: "2025-12-01T00:00:00Z",
    amount: 29,
    status: "paid",
    invoiceUrl: "#",
  },
  {
    id: "2",
    date: "2025-11-01T00:00:00Z",
    amount: 29,
    status: "paid",
    invoiceUrl: "#",
  },
  {
    id: "3",
    date: "2025-10-01T00:00:00Z",
    amount: 29,
    status: "paid",
    invoiceUrl: "#",
  },
]

export default function BillingPage() {
  const [loading, setLoading] = React.useState(false)
  const [currentPlanId, setCurrentPlanId] = React.useState("1") // Free plan by default

  // Mock current subscription
  const currentPlan = mockPlans.find((p) => p.id === currentPlanId) || mockPlans[0]
  const subscription: Subscription | undefined =
    currentPlanId !== "1"
      ? {
          id: "sub_1",
          status: "active",
          currentPeriodEnd: "2026-01-21T00:00:00Z",
        }
      : undefined

  const handleSelectPlan = async (plan: Plan) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock: Create checkout session or change plan
      toast.success(`Redirecionando para checkout do plano ${plan.name}...`, {
        description: "Você será redirecionado para o Stripe em instantes.",
      })

      // In real app: window.location.href = checkoutUrl
      setCurrentPlanId(plan.id)
    } catch (error) {
      toast.error("Erro ao processar solicitação", {
        description: "Tente novamente em alguns instantes.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Redirecionando para portal de gerenciamento...", {
        description: "Você será redirecionado para o portal do Stripe.",
      })

      // In real app: window.location.href = portalUrl
    } catch (error) {
      toast.error("Erro ao abrir portal", {
        description: "Tente novamente em alguns instantes.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell currentPath="/admin/billing" breadcrumb={["Administração", "Assinatura"]}>
      <div className="space-y-6">
        <PageHeader
          title="Assinatura e Cobrança"
          description="Gerencie seu plano e pagamentos"
        />

        {/* Current Plan */}
        <CurrentPlanCard
          plan={currentPlan}
          subscription={subscription}
          onManage={handleManageSubscription}
        />

        {/* Available Plans */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Planos Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {mockPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={plan.id === currentPlanId}
                isRecommended={plan.code === "pro"}
                onSelect={handleSelectPlan}
                loading={loading}
              />
            ))}
          </div>
        </div>

        {/* Billing History */}
        <BillingHistory
          invoices={currentPlanId !== "1" ? mockInvoices : []}
          loading={false}
        />
      </div>
    </AppShell>
  )
}
