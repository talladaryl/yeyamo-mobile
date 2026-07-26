import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { campaignsService } from './campaigns.service';
import type { AnalyticsPeriod, CampaignFilter, CreateCampaignInput } from './types';

export const campaignKeys = {
  all: ['partner', 'campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters: CampaignFilter) => [...campaignKeys.lists(), filters] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
  analytics: (id: string, period?: AnalyticsPeriod) => [...campaignKeys.all, 'analytics', id, ...(period ? [period] : [])] as const,
};

function useDemo() {
  return useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
}

export function usePartnerCampaigns(filters: CampaignFilter) {
  const isDemo = useDemo();
  return useQuery({ queryKey: campaignKeys.list(filters), queryFn: () => campaignsService.list(filters, isDemo) });
}

export function useCampaign(id: string) {
  const isDemo = useDemo();
  return useQuery({ queryKey: campaignKeys.detail(id), queryFn: () => campaignsService.detail(id, isDemo), enabled: Boolean(id) });
}

export const usePartnerCampaign = useCampaign;

export function useCampaignAnalytics(id: string, period: AnalyticsPeriod) {
  const isDemo = useDemo();
  return useQuery({ queryKey: campaignKeys.analytics(id, period), queryFn: () => campaignsService.analytics(id, period, isDemo), enabled: Boolean(id) });
}

export function useCreateCampaign() {
  const client = useQueryClient();
  const isDemo = useDemo();
  return useMutation({ mutationFn: (input: CreateCampaignInput) => campaignsService.create(input, isDemo), onSuccess: () => client.invalidateQueries({ queryKey: campaignKeys.lists() }) });
}

function useCampaignStatusMutation(action: (id: string, isDemo: boolean) => ReturnType<typeof campaignsService.pause>) {
  const client = useQueryClient();
  const isDemo = useDemo();
  return useMutation({
    mutationFn: (id: string) => action(id, isDemo),
    onSuccess: (campaign) => {
      client.setQueryData(campaignKeys.detail(campaign.id), campaign);
      client.invalidateQueries({ queryKey: campaignKeys.lists() });
      client.invalidateQueries({ queryKey: campaignKeys.analytics(campaign.id) });
    },
  });
}

export function usePauseCampaign() { return useCampaignStatusMutation(campaignsService.pause); }
export function useResumeCampaign() { return useCampaignStatusMutation(campaignsService.resume); }
export function useSubmitCampaign() { return useCampaignStatusMutation(campaignsService.submit); }
