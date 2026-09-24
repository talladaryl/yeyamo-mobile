import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { EmptyState, LoadingState } from '@/components/ui/ViewStates';
import { Icon } from '@/components/ui/Icon';
import { useAdventurePlan, useCreateAdventurePlan, useSkipAdventureRecommendation } from '@/features/explore/adventure.hooks';
import { useAdventureStore } from '@/features/explore/adventure.store';
import type { AdventureAvailabilityStatus, AdventureCriteria, AdventureDay, AdventureRecommendation } from '@/features/explore/adventure.types';
import { useThemeStore } from '@/features/theme/theme.store';

const partyLabels = { SOLO: 'Solo', FAMILY: 'En famille', FRIENDS: 'Entre amis', COUPLE: 'En couple' } as const;

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12).toLocaleDateString('fr-FR', options);
}

function formatBudget(criteria: AdventureCriteria) {
  const currency = criteria.currencyCode ?? '';
  if (criteria.budgetTier === 'CUSTOM') return `Maximum ${criteria.maximumAmount?.toLocaleString('fr-FR') ?? '—'} ${currency}`;
  if (criteria.budgetTier === 'PREMIUM') return `À partir de ${criteria.minimumAmount?.toLocaleString('fr-FR') ?? '—'} ${currency}`;
  if (criteria.minimumAmount != null || criteria.maximumAmount != null) return `${criteria.minimumAmount?.toLocaleString('fr-FR') ?? '—'} – ${criteria.maximumAmount?.toLocaleString('fr-FR') ?? '—'} ${currency}`;
  return 'Budget non précisé';
}

function availabilityLabel(status: AdventureAvailabilityStatus) {
  if (status === 'CONFIRMED') return 'Disponibilité confirmée';
  if (status === 'UNAVAILABLE') return 'Indisponible';
  if (status === 'CANCELLED') return 'Annulée';
  return 'Disponibilité à confirmer';
}

export default function AdventurePlanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ planId?: string | string[] }>();
  const planId = typeof params.planId === 'string' ? params.planId : undefined;
  const colors = useThemeStore((state) => state.colors);
  const previewDraft = useAdventureStore((state) => state.previewDraft);
  const clearPreviewDraft = useAdventureStore((state) => state.clearPreviewDraft);
  const savedPlan = useAdventurePlan(planId);
  const createPlan = useCreateAdventurePlan();
  const skipRecommendation = useSkipAdventureRecommendation(planId);
  const criteria = planId ? savedPlan.data?.criteria : previewDraft?.preview.normalizedCriteria;
  const days = planId ? savedPlan.data?.days : previewDraft?.preview.days;
  const [selectedDate, setSelectedDate] = useState<string>();

  useEffect(() => {
    if (days?.length && (!selectedDate || !days.some((day) => day.date === selectedDate))) setSelectedDate(days[0].date);
  }, [days, selectedDate]);

  const selectedDay = useMemo(() => days?.find((day) => day.date === selectedDate), [days, selectedDate]);
  const isPreview = !planId;

  const savePreview = async () => {
    if (!previewDraft || createPlan.isPending) return;
    try {
      const saved = await createPlan.mutateAsync(previewDraft.request);
      clearPreviewDraft();
      router.replace({ pathname: '/(explore)/adventure-plan', params: { planId: saved.id } });
    } catch {
      Alert.alert('Enregistrement impossible', 'Le planning n’a pas pu être enregistré. Réessayez.');
    }
  };

  const skip = (recommendation: AdventureRecommendation) => {
    if (!planId || skipRecommendation.isPending) return;
    Alert.alert('Ignorer cette proposition ?', 'Nous chercherons une alternative compatible. Il est possible qu’aucune alternative ne soit disponible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Ignorer',
        style: 'destructive',
        onPress: () => {
          void skipRecommendation.mutateAsync(recommendation.recommendationId).then((result) => {
            if (!result.replacement) Alert.alert('Aucune alternative', 'Aucune autre proposition compatible n’est disponible pour le moment.');
          }).catch(() => Alert.alert('Action impossible', 'La proposition n’a pas pu être ignorée. Réessayez.'));
        },
      },
    ]);
  };

  if (planId && savedPlan.isPending) {
    return <SafeAreaView className="flex-1" edges={['top', 'bottom']} style={{ backgroundColor: colors.background }}><Stack.Screen options={{ headerShown: false }} /><LoadingState label="Chargement du planning…" /></SafeAreaView>;
  }

  if (!criteria || !days || !selectedDay) {
    const unavailableMessage = planId && savedPlan.isError
      ? 'Ce planning est introuvable ou vous n’y avez plus accès.'
      : 'Commencez une nouvelle aventure pour créer votre planning.';
    return <SafeAreaView className="flex-1" edges={['top', 'bottom']} style={{ backgroundColor: colors.background }}><Stack.Screen options={{ headerShown: false }} /><View className="flex-1 px-6"><EmptyState title="Aventure introuvable" message={unavailableMessage} icon={<Icon name="compass-outline" size={56} color={colors.textMuted} />} /><Button label="Créer une aventure" onPress={() => router.replace('/(explore)/adventure')} /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView className="flex-1" edges={['top', 'bottom']} style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center border-b px-3 py-2" style={{ borderColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center" accessibilityRole="button" accessibilityLabel="Retour"><Icon name="chevron-back" size={26} color={colors.text} /></TouchableOpacity>
        <View className="ml-1 flex-1"><Text className="text-lg font-extrabold" style={{ color: colors.text }}>{isPreview ? 'Aperçu de mon aventure' : 'Mon aventure'}</Text><Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{criteria.countryCode} · {days.length} {days.length > 1 ? 'jours' : 'jour'}</Text></View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
        <View className="mx-4 mt-5 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <View className="flex-row items-start"><View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${colors.primary}18` }}><Icon name="calendar-outline" size={20} color={colors.primary} /></View><View className="ml-3 flex-1"><Text className="font-bold" style={{ color: colors.text }}>{formatDate(criteria.startDate, { day: 'numeric', month: 'long' })} — {formatDate(criteria.endDate, { day: 'numeric', month: 'long', year: 'numeric' })}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{criteria.startTime ?? 'Heure libre'} à {criteria.endTime ?? 'heure libre'} · {partyLabels[criteria.partyType]}</Text></View></View>
          <View className="mt-4 border-t pt-3" style={{ borderColor: colors.border }}><Text className="text-xs font-semibold" style={{ color: colors.text }}>{isPreview ? previewDraft?.interestLabels.join(' · ') || 'Tous les intérêts' : criteria.interestCodes.join(' · ') || 'Tous les intérêts'}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{formatBudget(criteria)}</Text></View>
        </View>

        {isPreview && previewDraft?.preview.warnings.length ? <View className="mx-4 mt-4 rounded-2xl border p-4" style={{ backgroundColor: colors.elevated, borderColor: colors.border }}><Text className="font-bold" style={{ color: colors.text }}>À noter</Text>{previewDraft.preview.warnings.map((warning) => <Text key={warning} className="mt-1 text-sm" style={{ color: colors.textSecondary }}>• {warning}</Text>)}</View> : null}
        {isPreview && previewDraft?.preview.noResultsReason ? <View className="mx-4 mt-4 rounded-2xl border p-4" style={{ backgroundColor: colors.elevated, borderColor: colors.border }}><Text className="text-sm" style={{ color: colors.textSecondary }}>{previewDraft.preview.noResultsReason}</Text></View> : null}

        <Text className="mx-4 mb-3 mt-6 text-base font-extrabold" style={{ color: colors.text }}>Planning quotidien</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {days.map((day, index) => {
            const active = day.date === selectedDate;
            return <TouchableOpacity key={day.date} onPress={() => setSelectedDate(day.date)} className="mr-2 min-w-20 rounded-2xl border px-3 py-3" style={{ backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border }} accessibilityRole="tab" accessibilityState={{ selected: active }}><Text className="text-center text-[11px] font-bold" style={{ color: active ? '#FFFFFF' : colors.textSecondary }}>Jour {index + 1}</Text><Text className="mt-1 text-center text-xs font-bold" style={{ color: active ? '#FFFFFF' : colors.text }}>{formatDate(day.date, { day: 'numeric', month: 'short' })}</Text></TouchableOpacity>;
          })}
        </ScrollView>

        <DayRecommendations day={selectedDay} isPreview={isPreview} onSkip={skip} isSkipping={skipRecommendation.isPending} />
      </ScrollView>
      <View className="border-t px-4 pb-4 pt-3" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
        {isPreview ? <Button label="Enregistrer le planning" onPress={() => void savePreview()} isLoading={createPlan.isPending} disabled={createPlan.isPending} /> : <Button label="Planning enregistré" disabled />}
        <TouchableOpacity onPress={() => router.push('/(profile)/plannings')} className="items-center py-2" accessibilityRole="link"><Text className="text-sm font-bold" style={{ color: colors.primary }}>Consulter mes plannings</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function DayRecommendations({ day, isPreview, onSkip, isSkipping }: { day: AdventureDay; isPreview: boolean; onSkip: (recommendation: AdventureRecommendation) => void; isSkipping: boolean }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mx-4 mt-5 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
    <Text className="text-base font-extrabold capitalize" style={{ color: colors.text }}>Jour {day.position} · {formatDate(day.date, { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
    {!day.items.length ? <View className="items-center px-3 py-8"><Icon name="compass-outline" size={42} color={colors.textMuted} /><Text className="mt-4 text-center text-lg font-semibold" style={{ color: colors.text }}>Aucune proposition pour ce jour</Text><Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>Aucune activité compatible n’a été trouvée avec cette configuration.</Text></View> : day.items.map((recommendation) => <View key={recommendation.recommendationId} className="mt-4 rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.surface }}><View className="flex-row"><View className="h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${colors.primary}18` }}><Icon name="sparkles-outline" size={18} color={colors.primary} /></View><View className="ml-3 flex-1"><Text className="font-bold" style={{ color: colors.text }}>{recommendation.title}</Text>{recommendation.locationLabel ? <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{recommendation.locationLabel}</Text> : null}<Text className="mt-1 text-xs" style={{ color: recommendation.availabilityStatus === 'UNAVAILABLE' || recommendation.availabilityStatus === 'CANCELLED' ? colors.primary : colors.textSecondary }}>{availabilityLabel(recommendation.availabilityStatus)}</Text>{recommendation.price != null ? <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{recommendation.price.toLocaleString('fr-FR')} {recommendation.currencyCode ?? ''}</Text> : null}</View></View>{!isPreview ? <TouchableOpacity disabled={isSkipping} onPress={() => onSkip(recommendation)} className="mt-3 self-start" accessibilityRole="button"><Text className="text-sm font-bold" style={{ color: isSkipping ? colors.textMuted : colors.primary }}>Ignorer cette proposition</Text></TouchableOpacity> : null}</View>)}</View>;
}
