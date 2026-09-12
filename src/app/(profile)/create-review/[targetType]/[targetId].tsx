import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useCreateVerifiedReview, type ReviewTargetType } from '@/features/reviews/reviews.api';
import { useThemeStore } from '@/features/theme/theme.store';

const types: ReviewTargetType[] = ['PLACE', 'EXPERIENCE', 'EVENT', 'ARTISAN'];

export default function CreateReviewScreen() {
  const { targetType, targetId } = useLocalSearchParams<{ targetType: string; targetId: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const create = useCreateVerifiedReview();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const type = types.includes(targetType as ReviewTargetType) ? targetType as ReviewTargetType : null;
  const submit = async () => {
    if (!type || !targetId) return;
    try {
      await create.mutateAsync({ targetType: type, targetId, rating, comment: comment.trim() || undefined });
      Alert.alert('Avis publié', 'Votre avis vérifié est maintenant visible publiquement.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Avis impossible', error instanceof Error ? error.message : 'Votre éligibilité n’a pas pu être confirmée.');
    }
  };
  if (!type || !targetId) return <SafeScreen><View className="flex-1 items-center justify-center px-8"><Text style={{ color: colors.text }}>Cible d’avis invalide.</Text></View></SafeScreen>;
  return <SafeScreen><Stack.Screen options={{ title: 'Laisser un avis' }} /><ScrollView contentContainerStyle={{ padding: 20 }}><TouchableOpacity onPress={() => router.back()} className="mb-5 flex-row items-center"><Icon name="chevron-back" size={22} color={colors.text} /><Text className="ml-1 font-semibold" style={{ color: colors.text }}>Retour</Text></TouchableOpacity><Text className="text-2xl font-extrabold" style={{ color: colors.text }}>Votre avis</Text><Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>Seuls les utilisateurs éligibles après une interaction vérifiée peuvent publier un avis.</Text><Text className="mt-7 text-sm font-bold" style={{ color: colors.text }}>Note</Text><View className="mt-3 flex-row">{[1, 2, 3, 4, 5].map((value) => <TouchableOpacity key={value} onPress={() => setRating(value)} className="mr-2 p-1" accessibilityLabel={`${value} étoile${value > 1 ? 's' : ''}`}><Icon name={value <= rating ? 'star' : 'star-outline'} size={35} color="#F59E0B" /></TouchableOpacity>)}</View><Text className="mt-7 text-sm font-bold" style={{ color: colors.text }}>Commentaire (facultatif)</Text><TextInput value={comment} onChangeText={setComment} multiline maxLength={5000} placeholder="Partagez votre expérience…" placeholderTextColor={colors.textMuted} className="mt-3 min-h-36 rounded-2xl border p-4" style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, textAlignVertical: 'top' }} /><Text className="mt-2 text-right text-xs" style={{ color: colors.textMuted }}>{comment.length}/5000</Text><View className="mt-7"><Button label="Publier l’avis vérifié" onPress={() => void submit()} isLoading={create.isPending} disabled={create.isPending} /></View></ScrollView></SafeScreen>;
}
