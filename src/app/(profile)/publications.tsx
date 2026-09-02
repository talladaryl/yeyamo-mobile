import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PublicationGrid } from '@/components/profile/PublicationGrid';
import { useUserPublications } from '@/features/profile/useProfile';
import { useThemeStore } from '@/features/theme/theme.store';
import { resolveResourceRoute } from '@/utils/resource-route';

export default function PublicationsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { data: publications, isLoading } = useUserPublications();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
      <View className="border-b px-4 py-3" style={{ borderColor: colors.borderSoft }}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2" accessibilityLabel="Retour">
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>Mes publications</Text>
          <TouchableOpacity onPress={() => router.push('/(profile)/favorites')} className="p-2" accessibilityLabel="Voir les contenus enregistrés">
            <Ionicons name="bookmark-outline" size={23} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-12">
            <Text style={{ color: colors.textSecondary }}>Chargement…</Text>
          </View>
        ) : publications?.length ? (
          <PublicationGrid
            publications={publications}
            onPressPublication={(id) => {
              const route = resolveResourceRoute({ type: 'post', id });
              if (route.href) router.push(route.href as never);
            }}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-8 py-12">
            <Ionicons name="images-outline" size={64} color={colors.textMuted} />
            <Text className="mt-4 text-center text-lg font-semibold" style={{ color: colors.text }}>Aucune publication</Text>
            <Text className="mt-2 text-center" style={{ color: colors.textSecondary }}>Partagez vos moments pour qu'ils apparaissent ici.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
