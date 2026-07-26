import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { adsApi, type AdTrackingInput } from './ads.api';

export const adKeys = {
  all: ['ads'] as const,
  tracking: () => [...adKeys.all, 'tracking'] as const,
};

export function useTrackAdImpression() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({ mutationKey: [...adKeys.tracking(), 'impression'], mutationFn: (input: AdTrackingInput) => isDemo ? Promise.resolve() : adsApi.trackImpression(input) });
}

export function useTrackAdClick() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({ mutationKey: [...adKeys.tracking(), 'click'], mutationFn: (input: AdTrackingInput) => isDemo ? Promise.resolve() : adsApi.trackClick(input) });
}
