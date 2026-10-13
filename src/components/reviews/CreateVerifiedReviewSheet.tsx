import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useCreateVerifiedReview, useReviewEligibility, type ReviewEligibilityReason, type ReviewTargetType } from '@/features/reviews/reviews.api';
import { useThemeStore } from '@/features/theme/theme.store';

export function CreateVerifiedReviewSheet({ visible, targetType, targetId, onClose }: {
  visible: boolean;
  targetType: ReviewTargetType;
  targetId: string;
  onClose: () => void;
}) {
  const colors = useThemeStore((state) => state.colors);
  const create = useCreateVerifiedReview();
  const eligibility = useReviewEligibility(targetType, targetId, visible);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submit = async () => {
    if (!eligibility.data?.eligible) return;
    try {
      await create.mutateAsync({ targetType, targetId, rating, comment: comment.trim() || undefined });
      setComment('');
      Alert.alert('Avis publié', 'Votre avis vérifié est maintenant visible publiquement.', [{ text: 'OK', onPress: onClose }]);
    } catch {
      Alert.alert('Avis impossible', 'Votre éligibilité a changé ou le service est momentanément indisponible. Réessayez.');
    }
  };

  const reason = eligibility.data && !eligibility.data.eligible ? eligibilityMessage(eligibility.data.reasonCode) : null;

  return <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <KeyboardAvoidingView className="flex-1 justify-end" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="absolute inset-0 bg-black/50" />
      <View className="max-h-[88%] rounded-t-3xl p-5" style={{ backgroundColor: colors.background }}>
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
          <View className="flex-row items-center"><Text className="flex-1 text-2xl font-extrabold" style={{ color: colors.text }}>Votre avis</Text><TouchableOpacity onPress={onClose} className="h-10 w-10 items-center justify-center"><Icon name="close" size={24} color={colors.text} /></TouchableOpacity></View>
          {eligibility.isLoading ? <View className="items-center py-10"><ActivityIndicator color={colors.primary} /><Text className="mt-3 text-sm" style={{ color: colors.textSecondary }}>Vérification de votre éligibilité…</Text></View> : null}
          {eligibility.isError ? <View className="py-8"><Text className="text-center text-sm" style={{ color: colors.textSecondary }}>Votre éligibilité ne peut pas être vérifiée actuellement.</Text><TouchableOpacity onPress={() => void eligibility.refetch()} className="mt-4 self-center rounded-xl border px-4 py-3" style={{ borderColor: colors.primary }}><Text className="font-bold" style={{ color: colors.primary }}>Réessayer</Text></TouchableOpacity></View> : null}
          {reason ? <View className="py-8"><Text className="text-center text-sm" style={{ color: colors.textSecondary }}>{reason}</Text></View> : null}
          {eligibility.data?.eligible ? <>
            <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>Seuls les utilisateurs éligibles après une interaction vérifiée peuvent publier un avis.</Text>
            <Text className="mt-7 text-sm font-bold" style={{ color: colors.text }}>Note</Text>
            <View className="mt-3 flex-row">{[1, 2, 3, 4, 5].map((value) => <TouchableOpacity key={value} onPress={() => setRating(value)} className="mr-2 p-1" accessibilityLabel={`${value} étoile${value > 1 ? 's' : ''}`}><Icon name={value <= rating ? 'star' : 'star-outline'} size={35} color="#F59E0B" /></TouchableOpacity>)}</View>
            <Text className="mt-7 text-sm font-bold" style={{ color: colors.text }}>Commentaire (facultatif)</Text>
            <TextInput value={comment} onChangeText={setComment} multiline maxLength={5000} placeholder="Partagez votre expérience…" placeholderTextColor={colors.textMuted} className="mt-3 min-h-36 rounded-2xl border p-4" style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, textAlignVertical: 'top' }} />
            <Text className="mt-2 text-right text-xs" style={{ color: colors.textMuted }}>{comment.length}/5000</Text>
            <View className="mt-7"><Button label="Publier l’avis vérifié" onPress={() => void submit()} isLoading={create.isPending} disabled={create.isPending} /></View>
          </> : null}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}

function eligibilityMessage(reason: ReviewEligibilityReason): string {
  const messages: Record<ReviewEligibilityReason, string> = {
    ELIGIBLE: '',
    EVENT_NOT_COMPLETED: 'Vous pourrez laisser un avis vérifié après la fin de cet événement.',
    REGISTRATION_NOT_CONFIRMED: 'Un avis vérifié nécessite une participation confirmée.',
    BOOKING_NOT_ELIGIBLE: 'Un avis vérifié nécessite une réservation terminée.',
    CHECKIN_REQUIRED: 'Un avis vérifié nécessite une visite confirmée.',
    VERIFICATION_NOT_SUPPORTED: 'Les avis vérifiés ne sont pas encore disponibles pour ce type de profil.',
    TARGET_NOT_FOUND: 'Ce contenu n’est plus disponible.',
  };
  return messages[reason] ?? 'Votre éligibilité n’a pas pu être confirmée.';
}
