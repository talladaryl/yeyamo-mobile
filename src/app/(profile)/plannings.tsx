import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/ViewStates';
import { Icon } from '@/components/ui/Icon';
import { useAdventurePlans, useDeleteAdventurePlan } from '@/features/explore/adventure.hooks';
import type { AdventurePlanSummary } from '@/features/explore/adventure.types';
import { useThemeStore } from '@/features/theme/theme.store';

const partyLabels = { SOLO: 'Solo', FAMILY: 'En famille', FRIENDS: 'Entre amis', COUPLE: 'En couple' } as const;

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PlanningsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const plansQuery = useAdventurePlans();
  const deletePlan = useDeleteAdventurePlan();
  const plans = plansQuery.data?.pages.flatMap((page) => page.content) ?? [];

  const removePlan = (plan: AdventurePlanSummary) => {
    Alert.alert('Supprimer ce planning ?', 'Cette action supprimera définitivement le planning enregistré.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => void deletePlan.mutateAsync(plan.id).catch(() => Alert.alert('Suppression impossible', 'Le planning n’a pas pu être supprimé. Réessayez.')) },
    ]);
  };

  return <SafeScreen>
    <View className="flex-row items-center border-b px-4 py-3" style={{ borderColor: colors.border }}>
      <TouchableOpacity onPress={() => router.back()} className="-ml-2 h-11 w-11 items-center justify-center" accessibilityRole="button" accessibilityLabel="Retour"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
      <View className="ml-2 flex-1"><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Gérer vos plannings</Text><Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>Vos aventures enregistrées</Text></View>
    </View>
    {plansQuery.isPending ? <LoadingState label="Chargement de vos plannings…" /> : null}
    {plansQuery.isError ? <ErrorState title="Chargement impossible" message="Vos plannings n’ont pas pu être récupérés." retry={() => void plansQuery.refetch()} /> : null}
    {!plansQuery.isPending && !plansQuery.isError && !plans.length ? <View className="flex-1 px-6"><EmptyState title="Aucun planning" message="Créez une aventure depuis Explorer pour la retrouver ici." icon={<Icon name="calendar-outline" size={56} color={colors.textMuted} />} /><Button label="Créer une aventure" onPress={() => router.replace('/(explore)/adventure')} /></View> : null}
    {plans.length ? <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 36 }} showsVerticalScrollIndicator={false}>{plans.map((plan) => <PlanCard key={plan.id} plan={plan} onOpen={() => router.push({ pathname: '/(explore)/adventure-plan', params: { planId: plan.id } })} onRemove={() => removePlan(plan)} deleting={deletePlan.isPending && deletePlan.variables === plan.id} />)}{plansQuery.hasNextPage ? <Button label="Charger plus" variant="secondary" onPress={() => void plansQuery.fetchNextPage()} isLoading={plansQuery.isFetchingNextPage} /> : null}</ScrollView> : null}
  </SafeScreen>;
}

function PlanCard({ plan, onOpen, onRemove, deleting }: { plan: AdventurePlanSummary; onOpen: () => void; onRemove: () => void; deleting: boolean }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mb-3 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
    <TouchableOpacity onPress={onOpen} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={`Ouvrir le planning du ${formatDate(plan.startDate)}`}>
      <View className="flex-row"><View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${colors.primary}18` }}><Icon name="calendar-outline" size={20} color={colors.primary} /></View><View className="ml-3 flex-1"><Text className="font-extrabold" style={{ color: colors.text }}>{plan.countryCode}</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{formatDate(plan.startDate)} — {formatDate(plan.endDate)}</Text><Text className="mt-1 text-xs" style={{ color: colors.textMuted }}>{partyLabels[plan.partyType]} · {plan.itemCount} {plan.itemCount > 1 ? 'propositions' : 'proposition'}</Text></View><Icon name="chevron-forward" size={20} color={colors.textMuted} /></View>
    </TouchableOpacity>
    <View className="mt-4 flex-row border-t pt-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={onOpen} className="mr-5" accessibilityRole="button"><Text className="text-sm font-bold" style={{ color: colors.primary }}>Voir le planning</Text></TouchableOpacity><TouchableOpacity disabled={deleting} onPress={onRemove} accessibilityRole="button"><Text className="text-sm font-bold" style={{ color: deleting ? colors.textMuted : colors.textSecondary }}>{deleting ? 'Suppression…' : 'Supprimer'}</Text></TouchableOpacity></View>
  </View>;
}
