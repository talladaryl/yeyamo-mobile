import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { UserReviewCard } from '@/components/profile/UserReviewCard';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/ViewStates';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useUserReviews } from '@/features/profile/useProfile';
import { reviewsApi } from '@/features/reviews/reviews.api';
import { useAuthStore } from '@/features/auth/auth.store';
import { useThemeStore } from '@/features/theme/theme.store';

export default function ReviewsScreen() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors); const { data: reviews, isLoading, isError, refetch } = useUserReviews(); const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const remove = (reviewId: string) => Alert.alert('Supprimer cet avis ?', 'Cette action retire votre avis public.', [{ text: 'Annuler', style: 'cancel' }, { text: 'Supprimer', style: 'destructive', onPress: () => void reviewsApi.remove(reviewId).then(() => refetch()).catch((error) => Alert.alert('Suppression impossible', error instanceof Error ? error.message : 'Réessayez plus tard.')) }]);
  return <SafeScreen><Header title="Mes avis" onBack={() => router.back()} />{isLoading ? <LoadingState /> : isError ? <ErrorState title="Avis indisponibles" retry={() => void refetch()} /> : reviews?.length ? <FlatList data={reviews} keyExtractor={(item) => item.id.toString()} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} renderItem={({ item }) => <UserReviewCard review={item} onPress={() => router.push(`/(places)/${item.place.id}`)} onDelete={isDemo ? undefined : () => remove(String(item.id))} />} /> : <EmptyState title="Aucun avis" message="Partagez votre expérience en laissant des avis" icon={<Ionicons name="star-outline" size={64} color={colors.textMuted} />} />}{<View className="absolute bottom-6 left-4 right-4"><Button label="Choisir un lieu à évaluer" onPress={() => router.push('/(explore)/places')} leftIcon={<Ionicons name="create-outline" size={20} color="#FFFFFF" />} /></View>}</SafeScreen>;
}

function Header({ title, onBack }: { title: string; onBack: () => void }) { const colors = useThemeStore((state) => state.colors); return <View className="flex-row items-center justify-between border-b px-4 py-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={onBack} className="-ml-2 p-2" accessibilityRole="button" accessibilityLabel="Retour"><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="text-xl font-bold" style={{ color: colors.text }}>{title}</Text><View className="w-10" /></View>; }
