import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useInterestsStore } from '@/features/interests/interests.store';
import { useThemeStore } from '@/features/theme/theme.store';

const INTERESTS = [
  { id: 'voyage', label: 'Voyages', description: 'Destinations et escapades', icon: 'airplane-outline', color: '#38BDF8' },
  { id: 'culture', label: 'Culture', description: 'Traditions et patrimoine', icon: 'color-palette-outline', color: '#A78BFA' },
  { id: 'gastronomie', label: 'Gastronomie', description: 'Cuisine et bonnes adresses', icon: 'restaurant-outline', color: '#F97316' },
  { id: 'musique', label: 'Musique', description: 'Concerts et découvertes', icon: 'musical-notes-outline', color: '#EC4899' },
  { id: 'nature', label: 'Nature', description: 'Paysages et plein air', icon: 'leaf-outline', color: '#22C55E' },
  { id: 'sport', label: 'Sport', description: 'Activités et compétitions', icon: 'football-outline', color: '#3B82F6' },
  { id: 'mode', label: 'Mode', description: 'Créateurs et tendances', icon: 'shirt-outline', color: '#F43F5E' },
  { id: 'art', label: 'Art', description: 'Expositions et créativité', icon: 'brush-outline', color: '#8B5CF6' },
  { id: 'sorties', label: 'Sorties', description: 'Événements et rencontres', icon: 'ticket-outline', color: '#EF4444' },
  { id: 'hebergements', label: 'Hébergements', description: 'Hôtels et lieux uniques', icon: 'bed-outline', color: '#14B8A6' },
  { id: 'histoire', label: 'Histoire', description: 'Récits et lieux historiques', icon: 'library-outline', color: '#D97706' },
  { id: 'photographie', label: 'Photographie', description: 'Spots et inspirations', icon: 'camera-outline', color: '#6366F1' },
] as const;

export default function InterestsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const selectedInterestIds = useInterestsStore((state) => state.selectedInterestIds);
  const toggleInterest = useInterestsStore((state) => state.toggleInterest);
  const saveInterests = useInterestsStore((state) => state.saveInterests);
  const [isSaving, setIsSaving] = useState(false);
  const canContinue = selectedInterestIds.length >= 3;

  const handleContinue = async () => {
    if (!canContinue || isSaving) return;
    setIsSaving(true);
    try {
      await saveInterests();
      router.replace('/(tabs)');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeScreen style={{ backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 130 }}
      >
        <View className="mb-7">
          <View className="mb-5 h-12 w-12 items-center justify-center rounded-2xl bg-[#EF4444]/15">
            <Icon name="sparkles" size={24} color={colors.primary} />
          </View>
          <Text className="text-3xl font-extrabold leading-9" style={{ color: colors.text }}>
            Qu’est-ce qui vous{`\n`}fait vibrer ?
          </Text>
          <Text className="mt-3 text-base leading-6" style={{ color: colors.textSecondary }}>
            Choisissez au moins 3 centres d’intérêt. Votre fil Yeyamo sera adapté à vos envies.
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-between gap-y-3">
          {INTERESTS.map((interest) => {
            const selected = selectedInterestIds.includes(interest.id);
            return (
              <TouchableOpacity
                key={interest.id}
                onPress={() => toggleInterest(interest.id)}
                activeOpacity={0.8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                className="min-h-32 w-[48%] rounded-2xl border p-4"
                style={{
                  backgroundColor: selected ? `${interest.color}18` : colors.card,
                  borderColor: selected ? interest.color : colors.border,
                }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${interest.color}22` }}>
                    <Icon name={interest.icon} size={22} color={interest.color} />
                  </View>
                  <View
                    className="h-6 w-6 items-center justify-center rounded-full border"
                    style={{ backgroundColor: selected ? interest.color : 'transparent', borderColor: selected ? interest.color : colors.textMuted }}
                  >
                    {selected ? <Icon name="checkmark" size={14} color="#FFFFFF" /> : null}
                  </View>
                </View>
                <Text className="mt-3 text-sm font-bold" style={{ color: colors.text }}>{interest.label}</Text>
                <Text className="mt-1 text-[11px] leading-4" style={{ color: colors.textSecondary }}>{interest.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t px-5 pb-6 pt-4"
        style={{ backgroundColor: colors.background, borderColor: colors.border }}
      >
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-semibold" style={{ color: canContinue ? colors.text : colors.textSecondary }}>
            {selectedInterestIds.length} sélectionné{selectedInterestIds.length > 1 ? 's' : ''}
          </Text>
          <Text className="text-xs" style={{ color: colors.textMuted }}>Minimum 3</Text>
        </View>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!canContinue || isSaving}
          activeOpacity={0.85}
          className="h-14 flex-row items-center justify-center rounded-2xl"
          style={{ backgroundColor: canContinue ? colors.primary : colors.elevated }}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text className="text-base font-bold" style={{ color: canContinue ? '#FFFFFF' : colors.textMuted }}>
                Personnaliser mon expérience
              </Text>
              <Icon name="arrow-forward" size={20} color={canContinue ? '#FFFFFF' : colors.textMuted} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}
