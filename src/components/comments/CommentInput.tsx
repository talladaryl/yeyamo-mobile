import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { useThemeStore } from '@/features/theme/theme.store';
import { i18n } from '@/i18n';

type CommentInputProps = {
  onSubmit: (text: string) => void | Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  avatarUrl?: string | null;
  displayName?: string;
  replyTargetName?: string | null;
  onCancelReply?: () => void;
};

/** A normal native TextInput is intentional: BottomSheetTextInput only keeps
 * focus while rendered by a Gorhom sheet and made the iOS composer unusable. */
export function CommentInput({
  onSubmit,
  placeholder = i18n.t('comments.placeholder'),
  autoFocus = false,
  avatarUrl,
  displayName = 'Vous',
  replyTargetName,
  onCancelReply,
}: CommentInputProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const colors = useThemeStore((state) => state.colors);

  const handleSubmit = async () => {
    const value = text.trim();
    if (!value || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(value);
      setText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return <View className="border-t px-3 pt-2" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.borderSoft }}>
    {replyTargetName ? <View className="mb-2 flex-row items-center justify-between rounded-xl px-3 py-2" style={{ backgroundColor: colors.elevated }}>
      <Text className="flex-1 text-xs font-semibold" style={{ color: colors.textSecondary }}>Réponse à {replyTargetName}</Text>
      <TouchableOpacity onPress={onCancelReply} accessibilityRole="button" accessibilityLabel="Annuler la réponse"><Text className="text-xs font-bold" style={{ color: colors.primary }}>Annuler</Text></TouchableOpacity>
    </View> : null}
    <View className="flex-row items-end gap-2 pb-2">
      <Avatar uri={avatarUrl} displayName={displayName} size={34} />
      <View className="min-h-12 flex-1 rounded-[22px] px-4 py-2" style={{ backgroundColor: colors.elevated }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={{ color: colors.text, minHeight: 24, maxHeight: 96, paddingVertical: 2 }}
          autoFocus={autoFocus}
          multiline
          maxLength={500}
          accessibilityLabel={replyTargetName ? `Répondre à ${replyTargetName}` : i18n.t('comments.placeholder')}
        />
      </View>
      <TouchableOpacity
        onPress={() => void handleSubmit()}
        disabled={!text.trim() || isSubmitting}
        activeOpacity={0.7}
        className="h-11 w-11 items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel={i18n.t('comments.send')}
      >
        {isSubmitting ? <ActivityIndicator size="small" color={colors.primary} /> : <Icon library="ionicons" name="send" size={24} color={text.trim() ? colors.primary : colors.textMuted} />}
      </TouchableOpacity>
    </View>
  </View>;
}
