import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  BillingInfoResponseDto,
  PlanResponseDto,
  CreateCheckoutRequest,
  CreateCheckoutResponse,
  CreatePortalRequest,
  CreatePortalResponse,
} from '@/types/api/billing'

const BILLING_ENDPOINTS = {
  PLANS: '/billing/plans',
  WORKSPACE: (workspaceId: string) => `/billing/workspace/${workspaceId}`,
  CHECKOUT: '/billing/checkout',
  PORTAL: '/billing/portal',
} as const

const BILLING_QUERY_KEYS = {
  PLANS: ['billing', 'plans'],
  WORKSPACE: (workspaceId: string) => ['billing', 'workspace', workspaceId],
} as const

/**
 * Hook for billing management with TanStack Query
 * Manages plans, subscriptions, and Stripe integration
 */
export function useBilling(workspaceId?: string) {
  const queryClient = useQueryClient()

  // Query: Get all available plans
  const plansQuery = useQuery({
    queryKey: BILLING_QUERY_KEYS.PLANS,
    queryFn: async () => {
      const response = await api.get<PlanResponseDto[]>(BILLING_ENDPOINTS.PLANS)
      return response.data
    },
  })

  // Query: Get billing info for a specific workspace
  const billingInfoQuery = useQuery({
    queryKey: workspaceId ? BILLING_QUERY_KEYS.WORKSPACE(workspaceId) : ['billing-disabled'],
    queryFn: async () => {
      if (!workspaceId) throw new Error('Workspace ID is required')
      const response = await api.get<BillingInfoResponseDto>(
        BILLING_ENDPOINTS.WORKSPACE(workspaceId)
      )
      return response.data
    },
    enabled: !!workspaceId,
  })

  // Mutation: Create checkout session (redirects to Stripe)
  const createCheckoutMutation = useMutation({
    mutationFn: async (data: CreateCheckoutRequest) => {
      const response = await api.post<CreateCheckoutResponse>(BILLING_ENDPOINTS.CHECKOUT, data)
      return response.data
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl
    },
  })

  // Mutation: Create portal session (redirects to Stripe Portal)
  const createPortalMutation = useMutation({
    mutationFn: async (data: CreatePortalRequest) => {
      const response = await api.post<CreatePortalResponse>(BILLING_ENDPOINTS.PORTAL, data)
      return response.data
    },
    onSuccess: (data) => {
      // Redirect to Stripe Customer Portal
      window.location.href = data.portalUrl
    },
  })

  /**
   * Initiate upgrade flow - creates checkout session and redirects
   */
  const startUpgrade = (workspaceId: string, planCode: string) => {
    createCheckoutMutation.mutate({ workspaceId, planCode })
  }

  /**
   * Open Stripe Customer Portal for subscription management
   */
  const openPortal = (workspaceId: string) => {
    createPortalMutation.mutate({ workspaceId })
  }

  /**
   * Invalidate billing queries after successful payment
   * Call this when returning from Stripe with success
   */
  const refreshBillingInfo = () => {
    queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.PLANS })
    if (workspaceId) {
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.WORKSPACE(workspaceId) })
    }
  }

  return {
    // Queries
    plans: plansQuery.data,
    isLoadingPlans: plansQuery.isLoading,
    plansError: plansQuery.error,

    billingInfo: billingInfoQuery.data,
    isLoadingBillingInfo: billingInfoQuery.isLoading,
    billingInfoError: billingInfoQuery.error,

    // Mutations
    startUpgrade,
    isCreatingCheckout: createCheckoutMutation.isPending,
    checkoutError: createCheckoutMutation.error,

    openPortal,
    isCreatingPortal: createPortalMutation.isPending,
    portalError: createPortalMutation.error,

    // Utilities
    refreshBillingInfo,
  }
}
