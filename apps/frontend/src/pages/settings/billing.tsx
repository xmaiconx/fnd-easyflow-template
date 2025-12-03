import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, AlertCircle } from 'lucide-react'
import { useWorkspace } from '@/hooks/use-workspace'
import { useBilling } from '@/hooks/useBilling'
import { CurrentPlan, PlanCard } from '@/components/billing'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function BillingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentWorkspace } = useWorkspace()

  const {
    plans,
    isLoadingPlans,
    plansError,
    billingInfo,
    isLoadingBillingInfo,
    billingInfoError,
    startUpgrade,
    isCreatingCheckout,
    openPortal,
    isCreatingPortal,
    refreshBillingInfo,
  } = useBilling(currentWorkspace?.id)

  // Handle return from Stripe (success or cancel)
  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (success === 'true') {
      toast.success('Pagamento aprovado!', {
        description: 'Seu plano foi atualizado com sucesso. As novas funcionalidades já estão disponíveis.',
        duration: 5000,
      })

      // Refresh billing info after successful payment
      refreshBillingInfo()

      // Clean up URL params
      setSearchParams({})
    } else if (canceled === 'true') {
      toast.info('Pagamento cancelado', {
        description: 'Você cancelou o processo de pagamento. Seu plano continua o mesmo.',
        duration: 5000,
      })

      // Clean up URL params
      setSearchParams({})
    }
  }, [searchParams, setSearchParams, refreshBillingInfo])

  // Loading state
  if (isLoadingBillingInfo || isLoadingPlans) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Carregando informações de cobrança...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (billingInfoError || plansError) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar informações</AlertTitle>
          <AlertDescription>
            {billingInfoError
              ? 'Não foi possível carregar as informações de cobrança do workspace.'
              : 'Não foi possível carregar os planos disponíveis.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // No workspace selected
  if (!currentWorkspace) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhum workspace selecionado</AlertTitle>
          <AlertDescription>
            Selecione um workspace para gerenciar seu plano e assinatura.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleSelectPlan = (planCode: string) => {
    if (!currentWorkspace?.id) return

    // Don't allow selecting FREE plan
    if (planCode === 'FREE') {
      toast.error('Não é possível selecionar o plano gratuito')
      return
    }

    // Don't allow selecting current plan
    if (planCode === billingInfo?.plan.code) {
      toast.info('Você já está neste plano')
      return
    }

    // Start upgrade flow
    startUpgrade(currentWorkspace.id, planCode)
  }

  const handleManageSubscription = () => {
    if (!currentWorkspace?.id) return
    openPortal(currentWorkspace.id)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Planos e Cobrança</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie seu plano e assinatura do workspace <strong>{currentWorkspace.name}</strong>
        </p>
      </div>

      {/* Current Plan */}
      {billingInfo && (
        <CurrentPlan
          billingInfo={billingInfo}
          onManageSubscription={handleManageSubscription}
          isLoading={isCreatingPortal}
        />
      )}

      {/* Available Plans */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Planos Disponíveis</h2>
          <p className="text-muted-foreground mt-1">
            Escolha o plano ideal para o seu workspace
          </p>
        </div>

        {plans && plans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.code}
                plan={plan}
                currentPlanCode={billingInfo?.plan.code || 'FREE'}
                onSelectPlan={handleSelectPlan}
                isLoading={isCreatingCheckout}
                highlighted={plan.code === 'STARTER'}
              />
            ))}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Nenhum plano disponível</AlertTitle>
            <AlertDescription>
              Não há planos disponíveis no momento. Entre em contato com o suporte.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Information Notes */}
      <div className="bg-muted rounded-lg p-6 space-y-3">
        <h3 className="font-semibold">Informações Importantes</h3>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li>As cobranças são processadas pela Stripe, uma plataforma segura de pagamentos</li>
          <li>Você pode cancelar ou alterar seu plano a qualquer momento</li>
          <li>Ao fazer downgrade, você mantém acesso aos recursos do plano anterior até o fim do período pago</li>
          <li>Os limites são aplicados apenas para criação de novos recursos, não bloqueando os existentes</li>
        </ul>
      </div>
    </div>
  )
}
