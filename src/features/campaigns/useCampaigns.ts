import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { campaignsApi } from './campaigns.api';
import type {
  CampaignAnalyticsFilters,
  CampaignListFilters,
} from './campaigns.api';
import { campaignsService } from './campaigns.service';
import { FEATURE_FLAGS } from '@/config/featureFlags';
import type {
  AnalyticsPeriod,
  CampaignFilter,
  CreateCampaignRequest,
  UpdateCampaignRequest,
} from './types';

type ListFilters = CampaignListFilters | CampaignFilter;
type AnalyticsFilters = CampaignAnalyticsFilters | AnalyticsPeriod;

export const campaignKeys = {
  all: ['partner', 'campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters: ListFilters) => [...campaignKeys.lists(), filters] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
  analytics: (id: string, filters?: AnalyticsFilters) =>
    [...campaignKeys.all, 'analytics', id, filters ?? {}] as const,
};

function useDemo() {
  return useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
}

export function usePartnerCampaigns(filters: ListFilters) {
  const isDemo = useDemo();
  return useQuery({
    queryKey: campaignKeys.list(filters),
    queryFn: () => isDemo && typeof filters === 'string'
      ? campaignsService.list(filters, true)
      : campaignsApi.getPartnerCampaigns(filters),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled: FEATURE_FLAGS.campaigns_enabled,
  });
}

export function useCampaign(id: string) {
  const isDemo = useDemo();
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => isDemo
      ? campaignsService.detail(id, true)
      : campaignsApi.getCampaign(id),
    enabled: FEATURE_FLAGS.campaigns_enabled && Boolean(id),
    staleTime: 30_000,
  });
}

export const usePartnerCampaign = useCampaign;

export function useCampaignAnalytics(id: string, filters: AnalyticsFilters) {
  const isDemo = useDemo();
  return useQuery({
    queryKey: campaignKeys.analytics(id, filters),
    queryFn: () => isDemo && typeof filters === 'string'
      ? campaignsService.analytics(id, filters, true)
      : campaignsApi.getCampaignAnalytics(id, filters),
    enabled: FEATURE_FLAGS.campaigns_enabled && Boolean(id),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useCreateCampaign() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCampaignRequest) => FEATURE_FLAGS.campaigns_enabled
      ? campaignsApi.createCampaign(payload) : Promise.reject({ code: 'FEATURE_DISABLED', message: 'Les campagnes sont désactivées.' }),
    onSuccess: (campaign) => {
      client.setQueryData(campaignKeys.detail(campaign.id), campaign);
      void client.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

export function useUpdateCampaign() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCampaignRequest }) => FEATURE_FLAGS.campaigns_enabled
      ? campaignsApi.updateCampaign(id, payload) : Promise.reject({ code: 'FEATURE_DISABLED', message: 'Les campagnes sont désactivées.' }),
    onSuccess: (campaign) => {
      client.setQueryData(campaignKeys.detail(campaign.id), campaign);
      void client.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

function useConfirmedTransition(
  action: (id: string) => Promise<Awaited<ReturnType<typeof campaignsApi.getCampaign>>>,
  invalidateAnalytics: boolean,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => FEATURE_FLAGS.campaigns_enabled ? action(id) : Promise.reject({ code: 'FEATURE_DISABLED', message: 'Les campagnes sont désactivées.' }),
    onSuccess: (campaign) => {
      client.setQueryData(campaignKeys.detail(campaign.id), campaign);
      void client.invalidateQueries({ queryKey: campaignKeys.lists() });
      if (invalidateAnalytics) {
        void client.invalidateQueries({
          queryKey: [...campaignKeys.all, 'analytics', campaign.id],
        });
      }
    },
  });
}

export function useSubmitCampaign() {
  return useConfirmedTransition(campaignsApi.submitCampaign, false);
}

export function usePauseCampaign() {
  return useConfirmedTransition(campaignsApi.pauseCampaign, true);
}

export function useResumeCampaign() {
  return useConfirmedTransition(campaignsApi.resumeCampaign, true);
}

export function useCancelCampaign() {
  return useConfirmedTransition(campaignsApi.cancelCampaign, true);
}
