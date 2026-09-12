import { useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useCreateVerifiedReview, type ReviewTargetType } from '@/features/reviews/reviews.api';
import { useThemeStore } from '@/features/theme/theme.store';

export function CreateVerifiedReviewSheet({ visible, targetType, targetId, onClose }: {
  visible: boolean;
  targetType: ReviewTargetType;
  targetId: string;
  onClose: () => void;
}) {
  const colors = useThemeStore((state) => state.colors);
  const create = useCreateVerifiedReview();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const submit = async () => {
    try {
      await create.mutateAsync({ targetType, targetId, rating, comment: comment.trim() || undefined });
      setComment('');
      Alert.alert('Avis publié', 'Votre avis vérifié est maintenant visible publiquement.', [{ text: 'OK', onPress: onClose }]);
    } catch (error) {
      Alert.alert('Avis impossible', error instanceof Error ? error.message : 'Votre éligibilité n’a pas pu être confirmée.');
    }
  };
  return <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <View className="flex-1 justify-end"><TouchableOpacity activeOpacity={1} onPress={onClose} className="absolute inset-0 bg-black/50" /><View className="max-h-[88%] rounded-t-3xl p-5" style={{ backgroundColor: colors.background }}><ScrollView keyboardShouldPersistTaps="handled"><View className="flex-row items-center"><Text className="flex-1 text-2xl font-extrabold" style={{ color: colors.text }}>Votre avis</Text><TouchableOpacity onPress={onClose} className="h-10 w-10 items-center justify-center"><Icon name="close" size={24} color={colors.text} /></TouchableOpacity></View><Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>Seuls les utilisateurs éligibles après une interaction vérifiée peuvent publier un avis.</Text><Text className="mt-7 text-sm font-bold" style={{ color: colors.text }}>Note</Text><View className="mt-3 flex-row">{[1, 2, 3, 4, 5].map((value) => <TouchableOpacity key={value} onPress={() => setRating(value)} className="mr-2 p-1" accessibilityLabel={`${value} étoile${value > 1 ? 's' : ''}`}><Icon name={value <= rating ? 'star' : 'star-outline'} size={35} color="#F59E0B" /></TouchableOpacity>)}</View><Text className="mt-7 text-sm font-bold" style={{ color: colors.text }}>Commentaire (facultatif)</Text><TextInput value={comment} onChangeText={setComment} multiline maxLength={5000} placeholder="Partagez votre expérience…" placeholderTextColor={colors.textMuted} className="mt-3 min-h-36 rounded-2xl border p-4" style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, textAlignVertical: 'top' }} /><Text className="mt-2 text-right text-xs" style={{ color: colors.textMuted }}>{comment.length}/5000</Text><View className="mt-7"><Button label="Publier l’avis vérifié" onPress={() => void submit()} isLoading={create.isPending} disabled={create.isPending} /></View></ScrollView></View>
  </View></Modal>;
}
