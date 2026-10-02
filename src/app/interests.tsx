import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useInterestsStore } from '@/features/interests/interests.store';
import { useThemeStore } from '@/features/theme/theme.store';
import { useCategories } from '@/features/explore/useExplore';

const COLORS = ['#38BDF8', '#A78BFA', '#F97316', '#EC4899', '#22C55E', '#3B82F6'];

export default function InterestsScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const editing = mode === 'edit';
  const colors = useThemeStore((state) => state.colors);
  const categories = useCategories();
  const queryClient = useQueryClient();
  const selected = useInterestsStore((state) => state.selectedInterestIds);
  const toggle = useInterestsStore((state) => state.toggleInterest);
  const save = useInterestsStore((state) => state.saveInterests);
  const [saving, setSaving] = useState(false);
  const canContinue = selected.length >= 3;

  const submit = async () => {
    if (!canContinue || saving) return;
    setSaving(true);
    try {
      await save(true);
      await queryClient.invalidateQueries({ queryKey: ['feed'], refetchType: 'active' });
      if (editing && router.canGoBack()) router.back(); else router.replace('/(tabs)');
    } catch {
      Alert.alert('Enregistrement impossible', 'Votre sélection est conservée. Réessayez lorsque la connexion est disponible.');
    } finally { setSaving(false); }
  };

  return <SafeScreen style={{ backgroundColor: colors.background }}>
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 130 }}>
      <View className="mb-7"><View className="mb-5 h-12 w-12 items-center justify-center rounded-2xl bg-[#EF4444]/15"><Icon name="sparkles" size={24} color={colors.primary} /></View>
        <Text className="text-3xl font-extrabold" style={{ color: colors.text }}>{editing ? 'Vos centres d’intérêt' : 'Qu’est-ce qui vous fait vibrer ?'}</Text>
        <Text className="mt-3 text-base leading-6" style={{ color: colors.textSecondary }}>Choisissez au moins 3 catégories. Elles améliorent vos recommandations sans masquer tout le reste.</Text>
      </View>
      {categories.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {categories.isError ? <TouchableOpacity onPress={() => void categories.refetch()}><Text style={{ color: colors.primary }}>Catégories indisponibles. Réessayer</Text></TouchableOpacity> : null}
      <View className="flex-row flex-wrap justify-between gap-y-3">{(categories.data ?? []).map((interest, index) => {
        const active = selected.includes(interest.id); const color = COLORS[index % COLORS.length];
        return <TouchableOpacity key={interest.id} onPress={() => toggle(interest.id)} accessibilityRole="checkbox" accessibilityState={{ checked: active }} className="min-h-28 w-[48%] rounded-2xl border p-4" style={{ backgroundColor: active ? `${color}18` : colors.card, borderColor: active ? color : colors.border }}>
          <View className="flex-row items-start justify-between"><View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}22` }}><Icon name={interest.icon || 'sparkles-outline'} size={22} color={color} /></View><View className="h-6 w-6 items-center justify-center rounded-full border" style={{ backgroundColor: active ? color : 'transparent', borderColor: active ? color : colors.textMuted }}>{active ? <Icon name="checkmark" size={14} color="#FFFFFF" /> : null}</View></View>
          <Text className="mt-3 text-sm font-bold" style={{ color: colors.text }}>{interest.label}</Text>
        </TouchableOpacity>;
      })}</View>
    </ScrollView>
    <View className="absolute bottom-0 left-0 right-0 border-t px-5 pb-6 pt-4" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
      <Text className="mb-3 text-sm font-semibold" style={{ color: canContinue ? colors.text : colors.textSecondary }}>{selected.length} sélectionné{selected.length > 1 ? 's' : ''} · Minimum 3</Text>
      <TouchableOpacity onPress={() => void submit()} disabled={!canContinue || saving || categories.isError} className="h-14 flex-row items-center justify-center rounded-2xl" style={{ backgroundColor: canContinue ? colors.primary : colors.elevated }}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-base font-bold" style={{ color: canContinue ? '#FFFFFF' : colors.textMuted }}>{editing ? 'Enregistrer' : 'Personnaliser mon expérience'}</Text>}</TouchableOpacity>
    </View>
  </SafeScreen>;
}
