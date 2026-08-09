import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { useCultureContents } from '../culture.hooks';
import type { CultureContentType } from '../culture.types';
import { CultureContentCard } from './CultureContentCard';

export function CultureListScreen({ title, type }: { title: string; type: CultureContentType }) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const contents = useCultureContents({ type, size: 30 });

  return (
    <SafeScreen>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2" accessibilityLabel="Retour">
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="ml-2 text-2xl font-extrabold" style={{ color: colors.text }}>{title}</Text>
      </View>
      {contents.isLoading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <FlatList
          data={contents.data?.content ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => <View className="mb-3"><CultureContentCard content={item} onPress={() => router.push(`/(explore)/culture/${item.id}`)} /></View>}
          ListEmptyComponent={<Text className="p-8 text-center" style={{ color: colors.textSecondary }}>Aucun contenu publié pour le moment.</Text>}
        />
      )}
    </SafeScreen>
  );
}
