// ÉCRAN 6 - Mes avis
import { Alert, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { UserReviewCard } from '@/components/profile/UserReviewCard';
import { useUserReviews } from '@/features/profile/useProfile';
import { useThemeStore } from '@/features/theme/theme.store';
import { reviewsApi } from '@/features/reviews/reviews.api';
import { useAuthStore } from '@/features/auth/auth.store';

export default function ReviewsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { data: reviews, isLoading, refetch } = useUserReviews();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);

  const remove = (reviewId: string) => {
    Alert.alert('Supprimer cet avis ?', 'Cette action retire votre avis public.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => void reviewsApi.remove(reviewId).then(() => refetch()).catch((error) => Alert.alert('Suppression impossible', error instanceof Error ? error.message : 'Réessayez plus tard.')) },
    ]);
  };

  const handleWriteReview = () => {
    router.push('/(explore)/places');
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#18181B] dark:text-white">Mes avis</Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Liste des avis */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#52525B] dark:text-[#A1A1AA]">Chargement...</Text>
        </View>
      ) : reviews && reviews.length > 0 ? (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <UserReviewCard
              review={item}
              onPress={() => router.push(`/(places)/${item.place.id}`)}
              onDelete={isDemo ? undefined : () => remove(String(item.id))}
            />
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="star-outline" size={64} color="#52525B" />
          <Text className="mt-4 text-center text-lg font-semibold text-[#18181B] dark:text-white">
            Aucun avis
          </Text>
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-center mt-2">
            Partagez votre expérience en laissant des avis
          </Text>
        </View>
      )}

      {/* Bouton flottant */}
      <View className="absolute bottom-6 left-0 right-0 px-4">
        <TouchableOpacity
          onPress={handleWriteReview}
          className="bg-[#EF4444] py-4 rounded-xl flex-row items-center justify-center shadow-lg"
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={24} color="#FFFFFF" />
          <Text className="text-white font-bold text-base ml-2">Choisir un lieu à évaluer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
