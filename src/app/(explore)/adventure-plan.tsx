import { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/ViewStates';
import { Icon } from '@/components/ui/Icon';
import { useAdventureStore } from '@/features/explore/adventure.store';
import { useThemeStore } from '@/features/theme/theme.store';

function buildDays(startDate: string, endDate: string): string[] {
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
  const current = new Date(startYear, startMonth - 1, startDay, 12);
  const end = new Date(endYear, endMonth - 1, endDay, 12);
  const dates: string[] = [];
  while (current <= end) {
    dates.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12).toLocaleDateString('fr-FR', options);
}

const partyLabels = { SOLO: 'Solo', FAMILY: 'En famille', FRIENDS: 'Entre amis', COUPLE: 'En couple' } as const;

export default function AdventurePlanScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const colors = useThemeStore((state) => state.colors);
  const currentDraft = useAdventureStore((state) => state.draft);
  const savedPlans = useAdventureStore((state) => state.plans);
  const savePlan = useAdventureStore((state) => state.savePlan);
  const draft = planId ? savedPlans.find((plan) => plan.id === planId) : currentDraft;
  const clearDraft = useAdventureStore((state) => state.clearDraft);
  const days = useMemo(() => draft ? buildDays(draft.startDate, draft.endDate) : [], [draft]);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(days[0]);
  const [isSaving, setIsSaving] = useState(false);

  if (!draft || !selectedDate) {
    return <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}><Stack.Screen options={{ headerShown: false }} /><View className="flex-1 px-6"><EmptyState title="Aventure introuvable" message="Commencez une nouvelle aventure pour créer votre planning." icon={<Icon name="compass-outline" size={56} color={colors.textMuted} />} /><Button label="Créer une aventure" onPress={() => router.replace('/(explore)/adventure')} /></View></SafeAreaView>;
  }

  const selectedDayIndex = days.indexOf(selectedDate) + 1;
  const totalDays = days.length;
  const isSaved = savedPlans.some((plan) => plan.id === draft.id);
  const budgetDescription = draft.budgetTier === 'CUSTOM'
    ? `Maximum ${draft.maximumBudget?.toLocaleString('fr-FR') ?? '—'} ${draft.currencyCode ?? ''}`
    : draft.budgetTier === 'PREMIUM'
      ? `À partir de 50 000 ${draft.currencyCode ?? ''}`
      : `${draft.minimumBudget?.toLocaleString('fr-FR')} – ${draft.maximumBudget?.toLocaleString('fr-FR')} ${draft.currencyCode ?? ''}`;

  return (
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center border-b px-3 py-2" style={{ borderColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center" accessibilityRole="button" accessibilityLabel="Retour"><Icon name="chevron-back" size={26} color={colors.text} /></TouchableOpacity>
        <View className="ml-1 flex-1"><Text className="text-lg font-extrabold" style={{ color: colors.text }}>Mon aventure</Text><Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{draft.countryName} · {totalDays} {totalDays > 1 ? 'jours' : 'jour'}</Text></View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
        <View className="mx-4 mt-5 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <View className="flex-row items-start"><View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${colors.primary}18` }}><Icon name="calendar-outline" size={20} color={colors.primary} /></View><View className="ml-3 flex-1"><Text className="font-bold" style={{ color: colors.text }}>{formatDate(draft.startDate, { day: 'numeric', month: 'long' })} — {formatDate(draft.endDate, { day: 'numeric', month: 'long', year: 'numeric' })}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{draft.startTime} à {draft.endTime} · {partyLabels[draft.partyType]}</Text></View></View>
          <View className="mt-4 border-t pt-3" style={{ borderColor: colors.border }}><Text className="text-xs font-semibold" style={{ color: colors.text }}>{draft.interestLabels.join(' · ')}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{budgetDescription}</Text></View>
        </View>

        <Text className="mx-4 mb-3 mt-6 text-base font-extrabold" style={{ color: colors.text }}>Planning quotidien</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {days.map((day, index) => {
            const active = day === selectedDate;
            return <TouchableOpacity key={day} onPress={() => setSelectedDate(day)} className="mr-2 min-w-20 rounded-2xl border px-3 py-3" style={{ backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border }} accessibilityRole="tab" accessibilityState={{ selected: active }}><Text className="text-center text-[11px] font-bold" style={{ color: active ? '#FFFFFF' : colors.textSecondary }}>Jour {index + 1}</Text><Text className="mt-1 text-center text-xs font-bold" style={{ color: active ? '#FFFFFF' : colors.text }}>{formatDate(day, { day: 'numeric', month: 'short' })}</Text></TouchableOpacity>;
          })}
        </ScrollView>

        <View className="mx-4 mt-5 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Text className="text-base font-extrabold" style={{ color: colors.text }}>Jour {selectedDayIndex} · {formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          <View className="items-center px-3 py-8"><Icon name="sparkles-outline" size={42} color={colors.textMuted} /><Text className="mt-4 text-center text-lg font-semibold" style={{ color: colors.text }}>Suggestions en attente</Text><Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>Le backend ne fournit pas encore de propositions d’activités par journée. Votre configuration est conservée ici, sans afficher de fausses activités.</Text></View>
          <Text className="mt-3 text-xs leading-5" style={{ color: colors.textSecondary }}>Quand le contrat d’itinéraire sera disponible, chaque proposition réelle pourra être ignorée ou ouverte dans son écran de détail.</Text>
        </View>

        <View className="mx-4 mt-6 gap-3"><Button label="Modifier cette aventure" variant="secondary" onPress={() => router.replace('/(explore)/adventure')} /><Button label="Recommencer" variant="ghost" onPress={() => { clearDraft(); router.replace('/(explore)/adventure'); }} /></View>
      </ScrollView>
      <View className="border-t px-4 pb-4 pt-3" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
        <Button label={isSaved ? 'Planning enregistré' : 'Enregistrer le planning'} onPress={() => { if (isSaved || isSaving) return; setIsSaving(true); void savePlan(draft).then(() => Alert.alert('Planning enregistré', 'Vous pouvez le consulter à tout moment depuis votre profil.')).catch(() => Alert.alert('Enregistrement impossible', 'Le planning n’a pas pu être enregistré sur cet appareil.')).finally(() => setIsSaving(false)); }} isLoading={isSaving} disabled={isSaved || isSaving} />
        <TouchableOpacity onPress={() => router.push('/(profile)/plannings')} className="items-center py-2" accessibilityRole="link">
          <Text className="text-sm font-bold" style={{ color: colors.primary }}>Consulter mes plannings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
