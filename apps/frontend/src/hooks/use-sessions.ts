import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Session } from '@/types/api/auth.types'

// Session API functions
const sessionApi = {
  getSessions: (): Promise<Session[]> =>
    api.get('/auth/sessions').then((res) => res.data),

  revokeSession: (sessionId: string): Promise<{ message: string }> =>
    api.delete(`/auth/sessions/${sessionId}`).then((res) => res.data),
}

// Custom hooks
export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: sessionApi.getSessions,
  })
}

export const useRevokeSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessionApi.revokeSession,
    onSuccess: () => {
      // Invalidate and refetch sessions
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}
