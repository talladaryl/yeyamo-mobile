import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import type { Campaign, CampaignStatus } from '@/features/campaigns/types';

const STATUS: Record<CampaignStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Brouillon', color: '#71717A' },
  PENDING_REVIEW: { label: 'En attente', color: '#F59E0B' },
  APPROVED: { label: 'Approuvée', color: '#22C55E' },
  ACTIVE: { label: 'Active', color: '#22C55E' },
  PAUSED: { label: 'En pause', color: '#F59E0B' },
  COMPLETED: { label: 'Terminée', color: '#7C3AED' },
  REJECTED: { label: 'Rejetée', color: '#EF4444' },
  BUDGET_EXHAUSTED: { label: 'Budget épuisé', color: '#EF4444' },
};

const money = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export function CampaignCard({ campaign, onPress }: { campaign: Campaign; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  const status = STATUS[campaign.status];
  const progress = campaign.totalBudget > 0 ? Math.min(100, (campaign.amountSpent / campaign.totalBudget) * 100) : 0;
  const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
  const performanceAvailable = campaign.performanceAvailable !== false;
  const remainingAmount = Math.max(0, campaign.totalBudget - campaign.amountSpent);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="mb-4 overflow-hidden rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      <Image source={{ uri: campaign.visualUrl }} style={{ width: '100%', height: 132 }} contentFit="cover" transition={150} />
      <View className="p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text className="text-base font-extrabold" numberOfLines={1} style={{ color: colors.text }}>{campaign.name}</Text>
            <View className="mt-1 flex-row items-center gap-1">
              <Icon name="megaphone-outline" size={13} color={colors.textSecondary} />
              <Text className="flex-1 text-xs" numberOfLines={1} style={{ color: colors.textSecondary }}>{campaign.promotedContent}</Text>
            </View>
          </View>
          <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: `${status.color}20` }}>
            <Text className="text-[10px] font-bold" style={{ color: status.color }}>{status.label}</Text>
          </View>
        </View>

        <View className="mt-4 flex-row justify-between">
          <Text className="text-xs" style={{ color: colors.textSecondary }}>Dépensé</Text>
          <Text className="text-xs font-bold" style={{ color: colors.text }}>{money.format(campaign.amountSpent)} / {money.format(campaign.totalBudget)} FCFA</Text>
        </View>
        <View className="mt-2 h-2 overflow-hidden rounded-full" style={{ backgroundColor: colors.elevated }}>
          <View className="h-full rounded-full bg-[#EF4444]" style={{ width: `${progress}%` }} />
        </View>
        <Text className="mt-1 text-[10px]" style={{ color: colors.textMuted }}>Restant : {money.format(remainingAmount)} FCFA</Text>

        <View className="mt-4 flex-row justify-between">
          <Metric label="Impressions" value={performanceAvailable ? money.format(campaign.impressions) : '—'} />
          <Metric label="Clics" value={performanceAvailable ? money.format(campaign.clicks) : '—'} />
          <Metric label="CTR" value={performanceAvailable ? `${ctr.toFixed(1)} %` : '—'} />
        </View>
        <Text className="mt-4 text-[11px]" style={{ color: colors.textMuted }}>
          {shortDate.format(new Date(campaign.startsAt))} — {shortDate.format(new Date(campaign.endsAt))}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View>
      <Text className="text-[10px]" style={{ color: colors.textMuted }}>{label}</Text>
      <Text className="mt-0.5 text-xs font-bold" style={{ color: colors.text }}>{value}</Text>
    </View>
  );
}
