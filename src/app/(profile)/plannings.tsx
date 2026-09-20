import { useEffect } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { EmptyState, LoadingState } from '@/components/ui/ViewStates';
import { Icon } from '@/components/ui/Icon';
import { useAdventureStore, type AdventureDraft } from '@/features/explore/adventure.store';
import { useThemeStore } from '@/features/theme/theme.store';

const partyLabels = { SOLO: 'Solo', FAMILY: 'En famille', FRIENDS: 'Entre amis', COUPLE: 'En couple' } as const;

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PlanningsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const plans = useAdventureStore((state) => state.plans);
  const hydrated = useAdventureStore((state) => state.plansHydrated);
  const hydratePlans = useAdventureStore((state) => state.hydratePlans);
  const removePlan = useAdventureStore((state) => state.removePlan);

  useEffect(() => { void hydratePlans(); }, [hydratePlans]);

  if (!hydrated) return <SafeScreen><LoadingState label="Chargement de vos plannings…" /></SafeScreen>;

  return <SafeScreen>
    <View className="flex-row items-center border-b px-4 py-3" style={{ borderColor: colors.border }}>
      <TouchableOpacity onPress={() => router.back()} className="-ml-2 h-11 w-11 items-center justify-center" accessibilityRole="button" accessibilityLabel="Retour"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
      <View className="ml-2 flex-1"><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Gérer vos plannings</Text><Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>Vos aventures créées sur cet appareil</Text></View>
    </View>
    {!plans.length ? <View className="flex-1 px-6"><EmptyState title="Aucun planning" message="Créez une aventure depuis Explorer pour retrouver son planning ici." icon={<Icon name="calendar-outline" size={56} color={colors.textMuted} />} /><Button label="Créer une aventure" onPress={() => router.replace('/(explore)/adventure')} /></View> : <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 36 }} showsVerticalScrollIndicator={false}>{plans.map((plan) => <PlanCard key={plan.id} plan={plan} onOpen={() => router.push({ pathname: '/(explore)/adventure-plan', params: { planId: plan.id } })} onRemove={() => Alert.alert('Supprimer ce planning ?', 'Cette action enlève uniquement le planning enregistré sur cet appareil.', [{ text: 'Annuler', style: 'cancel' }, { text: 'Supprimer', style: 'destructive', onPress: () => removePlan(plan.id) }])} />)}</ScrollView>}
  </SafeScreen>;
}

function PlanCard({ plan, onOpen, onRemove }: { plan: AdventureDraft; onOpen: () => void; onRemove: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mb-3 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
    <TouchableOpacity onPress={onOpen} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={`Ouvrir le planning du ${formatDate(plan.startDate)}`}>
      <View className="flex-row"><View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${colors.primary}18` }}><Icon name="calendar-outline" size={20} color={colors.primary} /></View><View className="ml-3 flex-1"><Text className="font-extrabold" style={{ color: colors.text }}>{plan.countryName}</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{formatDate(plan.startDate)} — {formatDate(plan.endDate)}</Text><Text className="mt-1 text-xs" style={{ color: colors.textMuted }}>{plan.startTime} à {plan.endTime} · {partyLabels[plan.partyType]}</Text></View><Icon name="chevron-forward" size={20} color={colors.textMuted} /></View>
    </TouchableOpacity>
    <View className="mt-4 flex-row border-t pt-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={onOpen} className="mr-5" accessibilityRole="button"><Text className="text-sm font-bold" style={{ color: colors.primary }}>Voir le planning</Text></TouchableOpacity><TouchableOpacity onPress={onRemove} accessibilityRole="button"><Text className="text-sm font-bold" style={{ color: colors.textSecondary }}>Supprimer</Text></TouchableOpacity></View>
  </View>;
}
