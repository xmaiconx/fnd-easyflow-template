import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import type { PlanResponseDto } from '@/types/api/billing'

interface PlanCardProps {
  plan: PlanResponseDto
  currentPlanCode: string
  onSelectPlan: (planCode: string) => void
  isLoading?: boolean
  highlighted?: boolean
}

export function PlanCard({
  plan,
  currentPlanCode,
  onSelectPlan,
  isLoading,
  highlighted = false,
}: PlanCardProps) {
  const isCurrentPlan = plan.code === currentPlanCode
  const isFree = plan.code === 'FREE'

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD',
    }).format(amount / 100)
  }

  const getButtonText = () => {
    if (isCurrentPlan) return 'Plano Atual'
    if (isFree) return 'Plano Gratuito'

    // Compare plan codes to determine upgrade/downgrade
    const planOrder = { FREE: 0, STARTER: 1, PROFESSIONAL: 2 }
    const currentOrder = planOrder[currentPlanCode as keyof typeof planOrder] || 0
    const targetOrder = planOrder[plan.code as keyof typeof planOrder] || 0

    if (targetOrder > currentOrder) return 'Fazer Upgrade'
    return 'Selecionar Plano'
  }

  const getFeaturesList = () => {
    const features: string[] = []

    if (plan.features.limits.workspaces === -1) {
      features.push('Workspaces ilimitados')
    } else {
      features.push(`Até ${plan.features.limits.workspaces} workspace${plan.features.limits.workspaces > 1 ? 's' : ''}`)
    }

    if (plan.features.limits.usersPerWorkspace === -1) {
      features.push('Usuários ilimitados por workspace')
    } else {
      features.push(`Até ${plan.features.limits.usersPerWorkspace} usuário${plan.features.limits.usersPerWorkspace > 1 ? 's' : ''} por workspace`)
    }

    return features
  }

  return (
    <Card className={`relative ${highlighted ? 'border-primary shadow-lg' : ''}`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            Mais Popular
          </span>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price */}
        <div>
          {plan.price ? (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">
                {formatPrice(plan.price.amount, plan.price.currency)}
              </span>
              <span className="text-muted-foreground">/{plan.price.interval === 'month' ? 'mês' : 'ano'}</span>
            </div>
          ) : (
            <div className="text-4xl font-bold">Gratuito</div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Recursos inclusos:</h4>
          <ul className="space-y-2">
            {getFeaturesList().map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant={highlighted ? 'default' : 'outline'}
          className="w-full"
          onClick={() => onSelectPlan(plan.code)}
          disabled={isCurrentPlan || isFree || isLoading}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  )
}
