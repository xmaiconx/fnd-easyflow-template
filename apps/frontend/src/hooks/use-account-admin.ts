import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  AccountUser,
  AccountUserDetails,
  AccountInvite,
  CreateInviteDto,
  CreateInviteResponse,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  ListUsersFilters,
  ListInvitesFilters,
  AuditLog,
  AuditLogFilters,
} from '@/types'
import { toast } from 'sonner'

// Users
export function useAccountUsers(filters?: ListUsersFilters) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: async () => {
      const response = await api.get<AccountUser[]>('/admin/users', { params: filters })
      return response.data
    },
  })
}

export function useAccountUserDetails(userId: string, enabled = true) {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: async () => {
      const response = await api.get<AccountUserDetails>(`/admin/users/${userId}`)
      return response.data
    },
    enabled: enabled && !!userId,
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UpdateUserRoleDto['role'] }) => {
      await api.patch(`/admin/users/${userId}/role`, { role })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId] })
      toast.success('Permissão atualizada com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar permissão')
    },
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: UpdateUserStatusDto['status'] }) => {
      await api.patch(`/admin/users/${userId}/status`, { status })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId] })
      toast.success('Status atualizado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar status')
    },
  })
}

// Sessions
export function useRevokeSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(`/admin/sessions/${sessionId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('Sessão revogada com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao revogar sessão')
    },
  })
}

export function useRevokeAllUserSessions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/admin/sessions/${userId}/revoke-all`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('Todas as sessões foram revogadas')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao revogar sessões')
    },
  })
}

// Invites
export function useAccountInvites(filters?: ListInvitesFilters) {
  return useQuery({
    queryKey: ['admin', 'invites', filters],
    queryFn: async () => {
      const response = await api.get<AccountInvite[]>('/admin/invites', { params: filters })
      return response.data
    },
  })
}

export function useCreateInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateInviteDto) => {
      const response = await api.post<CreateInviteResponse>('/admin/invites', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invites'] })
      toast.success('Convite enviado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao enviar convite')
    },
  })
}

export function useResendInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inviteId: string) => {
      await api.patch(`/admin/invites/${inviteId}/resend`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invites'] })
      toast.success('Convite reenviado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao reenviar convite')
    },
  })
}

export function useCancelInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inviteId: string) => {
      await api.delete(`/admin/invites/${inviteId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invites'] })
      toast.success('Convite cancelado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar convite')
    },
  })
}

// Audit Logs
export function useAccountAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', filters],
    queryFn: async () => {
      const response = await api.get<AuditLog[]>('/admin/audit-logs', { params: filters })
      return response.data
    },
  })
}
