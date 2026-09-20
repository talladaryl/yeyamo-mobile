import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from './auth.api';
import { useAuthStore } from './auth.store';

const sessionsKey = ['auth', 'sessions'] as const;

export function useAuthSessions() {
  const backendSession = useAuthStore((state) => state.sessionMode === 'backend');
  return useQuery({ queryKey: sessionsKey, queryFn: authApi.sessions, enabled: backendSession });
}

export function useRevokeAuthSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.revokeSession,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: sessionsKey }),
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => authApi.changePassword(currentPassword, newPassword) });
}
