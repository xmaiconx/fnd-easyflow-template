import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ImpersonateDto, ImpersonateResponse } from '../types/manager.types';

export const useImpersonate = () => {
  const start = useMutation({
    mutationFn: (data: ImpersonateDto) =>
      api.post<ImpersonateResponse>('/manager/impersonate', data),
    onSuccess: (response) => {
      // Open frontend app in new tab with impersonation token
      const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';
      window.open(`${frontendUrl}?impersonateToken=${response.data.accessToken}`, '_blank');
    },
  });

  const end = useMutation({
    mutationFn: () => api.delete<void>('/manager/impersonate'),
  });

  return {
    start: start.mutate,
    end: end.mutate,
    isStarting: start.isPending,
    isEnding: end.isPending,
  };
};
