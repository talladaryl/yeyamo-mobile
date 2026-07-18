// ÉCRAN 3 - Mes favoris
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FavoritePlaceCard } from '@/components/profile/FavoritePlaceCard';
import { useUserFavorites } from '@/features/profile/useProfile';

export default function FavoritesScreen() {
  const router = useRouter();
  const { data: favorites, isLoading } = useUserFavorites();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-[#18181B] dark:text-white text-xl font-bold">Mes favoris</Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste des favoris */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#52525B] dark:text-[#A1A1AA]">Chargement...</Text>
        </View>
      ) : favorites && favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <FavoritePlaceCard
              place={item}
              onPress={() => router.push(`/(places)/${item.id}`)}
            />
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="heart-outline" size={64} color="#52525B" />
          <Text className="text-[#18181B] dark:text-white text-lg font-semibold mt-4 text-center">
            Aucun favori
          </Text>
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-center mt-2">
            Ajoutez des lieux à vos favoris pour les retrouver facilement
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
