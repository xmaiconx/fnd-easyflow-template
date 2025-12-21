import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { UserListItem, UserDetails, ListUsersDto, UpdateUserStatusDto } from '../types/manager.types';

export const useManagerUsers = (filters: ListUsersDto) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['manager-users', filters],
    queryFn: async () => {
      const response = await api.get<UserListItem[]>('/manager/users', { params: filters });
      return response.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'inactive' }) =>
      api.patch<void>(`/manager/users/${userId}/status`, { status } as UpdateUserStatusDto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager-users'] });
      queryClient.invalidateQueries({ queryKey: ['user-details'] });
    },
  });

  return {
    users: data,
    isLoading,
    error,
    updateStatus: updateStatus.mutate,
    isUpdating: updateStatus.isPending,
  };
};

export const useUserDetails = (userId: string) => {
  return useQuery({
    queryKey: ['user-details', userId],
    queryFn: async () => {
      const response = await api.get<UserDetails>(`/manager/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
};
