import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

type CultureCategory = {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: '/(explore)/proverbs' | '/(explore)/recipes' | '/(explore)/artisans' | '/(explore)/languages';
};

const CATEGORIES: CultureCategory[] = [
  { id: 'proverbs', title: 'Proverbes', description: 'Paroles, langues et sagesses', icon: 'chatbubble-ellipses-outline', route: '/(explore)/proverbs' },
  { id: 'cuisine', title: 'Cuisine', description: 'Recettes et savoir-faire culinaires', icon: 'restaurant-outline', route: '/(explore)/recipes' },
  { id: 'creators', title: 'Artistes & Créateurs', description: 'Art, artisanat et talents', icon: 'color-palette-outline', route: '/(explore)/artisans' },
  { id: 'languages', title: 'Langues & Culture', description: 'Langues, traditions et patrimoine', icon: 'language-outline', route: '/(explore)/languages' },
];

export default function CultureExplore() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  return (
    <SafeScreen>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center" accessibilityLabel="Retour">
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View className="ml-2 flex-1">
          <Text className="text-2xl font-extrabold" style={{ color: colors.text }}>Culture & Créateurs</Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>Choisissez un univers à découvrir.</Text>
        </View>
      </View>
      <FlatList
        data={CATEGORIES}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(item.route)}
            className="mb-3 flex-1 overflow-hidden rounded-3xl border"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
            accessibilityRole="button"
            accessibilityLabel={`Découvrir ${item.title}`}
            activeOpacity={0.84}
          >
            <View className="aspect-[4/3] items-center justify-center" style={{ backgroundColor: colors.elevated }}>
              <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: colors.accentSoft }}>
                <Icon name={item.icon} size={31} color={colors.primary} />
              </View>
            </View>
            <View className="min-h-24 p-3">
              <Text className="text-base font-extrabold" style={{ color: colors.text }} numberOfLines={2}>{item.title}</Text>
              <Text className="mt-1 text-xs leading-4" style={{ color: colors.textSecondary }} numberOfLines={2}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeScreen>
  );
}
