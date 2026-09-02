import axios from 'axios';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { FilterChips } from '@/components/partner-dashboard/PartnerPage';
import { CampaignListSkeleton } from '@/components/partner-dashboard/campaigns/CampaignListSkeleton';
import {
  useCampaign,
  useCampaignAnalytics,
  useCancelCampaign,
  usePauseCampaign,
  useResumeCampaign,
  useSubmitCampaign,
} from '@/features/campaigns/useCampaigns';
import { useThemeStore } from '@/features/theme/theme.store';
import type { AnalyticsPeriod, Campaign, CampaignStatus } from '@/features/campaigns/types';

const PERIODS = ['7 jours', '30 jours', 'Toute période'] as const;
const PERIOD_VALUES: Record<(typeof PERIODS)[number], AnalyticsPeriod> = {
  '7 jours': '7D',
  '30 jours': '30D',
  'Toute période': 'ALL',
};
const STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: 'Brouillon', PENDING_REVIEW: 'En attente', APPROVED: 'Approuvée', ACTIVE: 'Active',
  PAUSED: 'En pause', COMPLETED: 'Terminée', REJECTED: 'Rejetée', BUDGET_EXHAUSTED: 'Budget épuisé',
};
const compact = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 });
const money = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

export default function CampaignDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('7 jours');
  const campaignQuery = useCampaign(id);
  const analyticsQuery = useCampaignAnalytics(id, PERIOD_VALUES[period]);
  const pause = usePauseCampaign();
  const resume = useResumeCampaign();
  const submit = useSubmitCampaign();
  const cancel = useCancelCampaign();
  const campaign = campaignQuery.data;
  const analytics = analyticsQuery.data;
  const pending = pause.isPending || resume.isPending || submit.isPending || cancel.isPending;
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/(partner-dashboard)/campaigns');

  if (campaignQuery.isLoading) return <SafeScreen><CampaignListSkeleton /></SafeScreen>;

  if (!campaign) {
    return <SafeScreen><Header title="Campagne" subtitle="Introuvable" onBack={goBack} /><View className="items-center px-6 py-20"><Icon name="alert-circle-outline" size={38} color="#EF4444" /><Text className="mt-3" style={{ color: colors.text }}>Impossible de charger cette campagne.</Text></View></SafeScreen>;
  }

  const remaining = Math.max(0, campaign.totalBudget - campaign.amountSpent);
  const progress = campaign.totalBudget ? Math.min(100, campaign.amountSpent / campaign.totalBudget * 100) : 0;
  const success = (message: string) => {
    Alert.alert('Campagne mise à jour', message);
    void campaignQuery.refetch();
    void analyticsQuery.refetch();
  };
  const failure = (error: unknown) => {
    const body = axios.isAxiosError(error)
      ? error.response?.data as { detail?: string; message?: string } | undefined
      : undefined;
    Alert.alert('Action impossible', body?.detail ?? body?.message
      ?? (error instanceof Error ? error.message : 'Une erreur est survenue.'));
  };
  const run = (mutation: typeof pause, message: string) =>
    mutation.mutate(id, { onSuccess: () => success(message), onError: failure });
  const confirmPause = () => Alert.alert(
    'Mettre en pause',
    'Confirmer la mise en pause de cette campagne ?',
    [
      { text: 'Retour', style: 'cancel' },
      { text: 'Mettre en pause', onPress: () => run(pause, 'La campagne est maintenant en pause.') },
    ],
  );
  const confirmCancel = () => Alert.alert(
    'Annuler la campagne',
    'Cette action applique les règles métier du backend et peut être définitive.',
    [
      { text: 'Retour', style: 'cancel' },
      { text: 'Annuler la campagne', style: 'destructive', onPress: () => run(cancel, 'La campagne a été annulée.') },
    ],
  );

  return (
    <SafeScreen>
      <Header title={campaign.name} subtitle={STATUS_LABELS[campaign.status]} onBack={goBack} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <ActionRow
          campaign={campaign}
          pending={pending}
          onPause={confirmPause}
          onResume={() => run(resume, 'La diffusion a repris.')}
          onSubmit={() => run(submit, 'La campagne a été soumise pour validation.')}
          onCancel={confirmCancel}
          onEdit={() => router.push('/(partner-dashboard)/campaign-create' as Href)}
        />

        <SectionTitle title="Budget" />
        <View className="rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <View className="flex-row justify-between">
            <BudgetMetric label="Total" value={campaign.totalBudget} />
            <BudgetMetric label="Dépensé" value={campaign.amountSpent} />
            <BudgetMetric label="Restant" value={remaining} />
          </View>
          <View className="mt-4 h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: colors.elevated }}><View className="h-full rounded-full bg-[#EF4444]" style={{ width: `${progress}%` }} /></View>
          <Text className="mt-2 text-right text-xs" style={{ color: colors.textSecondary }}>{progress.toFixed(0)} % utilisé</Text>
        </View>

        <SectionTitle title="Performances" />
        <View className="flex-row flex-wrap gap-3">
          {[
            ['Impressions', compact.format(analytics?.impressions ?? 0)], ['Portée', compact.format(analytics?.reach ?? 0)],
            ['Clics', compact.format(analytics?.clicks ?? 0)], ['CTR', `${(analytics?.ctr ?? 0).toFixed(2)} %`],
            ['Conversions', compact.format(analytics?.conversions ?? 0)], ['CPC', `${money.format(analytics?.cpc ?? 0)} F`],
            ['CPM', `${money.format(analytics?.cpm ?? 0)} F`], ['CPA', `${money.format(analytics?.cpa ?? 0)} F`],
          ].map(([label, value]) => <PerformanceCard key={label} label={label} value={value} />)}
        </View>

        <SectionTitle title="Évolution" />
        <FilterChips values={PERIODS} selected={period} onSelect={(value) => setPeriod(value as (typeof PERIODS)[number])} />
        <View className="rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          {analyticsQuery.isFetching ? <ActivityIndicator color="#EF4444" /> : <PerformanceChart points={analytics?.points ?? []} />}
          <View className="mt-4 flex-row justify-center gap-4"><Legend color="#EF4444" label="Impressions" /><Legend color="#7C3AED" label="Clics" /><Legend color="#22C55E" label="Conversions" /></View>
        </View>

        <SectionTitle title="Audience agrégée" />
        <AudienceBlock title="Villes" values={analytics?.cities ?? []} />
        <AudienceBlock title="Placements" values={analytics?.placements ?? []} />
        <AudienceBlock title="Appareils" values={analytics?.devices ?? []} />
      </ScrollView>
    </SafeScreen>
  );
}

function Header({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="flex-row items-center px-4 pb-3 pt-2"><TouchableOpacity onPress={onBack} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity><View className="min-w-0 flex-1"><Text numberOfLines={1} className="text-xl font-extrabold" style={{ color: colors.text }}>{title}</Text><Text className="text-xs font-semibold text-[#EF4444]">{subtitle}</Text></View><TouchableOpacity accessibilityLabel="Actions de la campagne" className="h-10 w-10 items-center justify-center"><Icon name="ellipsis-vertical" size={21} color={colors.text} /></TouchableOpacity></View>;
}

function ActionRow({ campaign, pending, onEdit, onSubmit, onPause, onResume, onCancel }: { campaign: Campaign; pending: boolean; onEdit: () => void; onSubmit: () => void; onPause: () => void; onResume: () => void; onCancel: () => void }) {
  if (campaign.status === 'COMPLETED') return null;
  return <View className="mt-2 flex-row gap-3">
    {(campaign.status === 'DRAFT' || campaign.status === 'REJECTED') ? <><View className="flex-1"><Button label="Modifier" variant="outline" onPress={onEdit} disabled={pending} /></View><View className="flex-1"><Button label={campaign.status === 'REJECTED' ? 'Soumettre à nouveau' : 'Soumettre'} onPress={onSubmit} isLoading={pending} /></View></> : null}
    {campaign.status === 'ACTIVE' ? <View className="flex-1"><Button label="Mettre en pause" variant="outline" onPress={onPause} isLoading={pending} /></View> : null}
    {campaign.status === 'PAUSED' ? <View className="flex-1"><Button label="Reprendre" onPress={onResume} isLoading={pending} /></View> : null}
    <View className="flex-1"><Button label="Annuler" variant="outline" onPress={onCancel} disabled={pending} /></View>
  </View>;
}

function SectionTitle({ title }: { title: string }) { const colors = useThemeStore((state) => state.colors); return <Text className="mb-3 mt-6 text-base font-extrabold" style={{ color: colors.text }}>{title}</Text>; }
function BudgetMetric({ label, value }: { label: string; value: number }) { const colors = useThemeStore((state) => state.colors); return <View><Text className="text-xs" style={{ color: colors.textSecondary }}>{label}</Text><Text className="mt-1 text-sm font-extrabold" style={{ color: colors.text }}>{money.format(value)} F</Text></View>; }
function PerformanceCard({ label, value }: { label: string; value: string }) { const colors = useThemeStore((state) => state.colors); return <View className="w-[48%] rounded-xl border p-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="text-xs" style={{ color: colors.textSecondary }}>{label}</Text><Text className="mt-1 text-lg font-extrabold" style={{ color: colors.text }}>{value}</Text></View>; }
function PerformanceChart({ points }: { points: Array<{ label: string; impressions: number; clicks: number; conversions: number }> }) { const colors = useThemeStore((state) => state.colors); const max = Math.max(1, ...points.map((point) => point.impressions)); return <View className="mt-3 h-44 flex-row items-end justify-between border-b" style={{ borderColor: colors.border }}>{points.map((point) => <View key={point.label} className="h-full flex-1 items-center justify-end"><View className="flex-row items-end gap-0.5"><View className="w-2 rounded-t bg-[#EF4444]" style={{ height: `${Math.max(3, point.impressions / max * 100)}%` }} /><View className="w-2 rounded-t bg-[#7C3AED]" style={{ height: `${Math.max(3, point.clicks / max * 100)}%` }} /><View className="w-2 rounded-t bg-[#22C55E]" style={{ height: `${Math.max(3, point.conversions / max * 100)}%` }} /></View><Text className="mt-1 text-[9px]" style={{ color: colors.textMuted }}>{point.label}</Text></View>)}</View>; }
function Legend({ color, label }: { color: string; label: string }) { const colors = useThemeStore((state) => state.colors); return <View className="flex-row items-center gap-1"><View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} /><Text className="text-[10px]" style={{ color: colors.textSecondary }}>{label}</Text></View>; }
function AudienceBlock({ title, values }: { title: string; values: Array<{ label: string; percentage: number }> }) { const colors = useThemeStore((state) => state.colors); return <View className="mb-3 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="mb-3 font-bold" style={{ color: colors.text }}>{title}</Text>{values.map((value) => <View key={value.label} className="mb-2"><View className="mb-1 flex-row justify-between"><Text className="text-xs" style={{ color: colors.textSecondary }}>{value.label}</Text><Text className="text-xs font-bold" style={{ color: colors.text }}>{value.percentage} %</Text></View><View className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: colors.elevated }}><View className="h-full rounded-full bg-[#EF4444]" style={{ width: `${value.percentage}%` }} /></View></View>)}</View>; }
