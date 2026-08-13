import { useState } from 'react';
import { ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
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
};

export function CommentInput({
  onSubmit,
  placeholder = i18n.t('comments.placeholder'),
  autoFocus = false,
  avatarUrl,
  displayName = 'Vous',
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
    } catch {
      // The parent displays the transport error and keeps the draft visible.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="border-t px-4 py-3 flex-row items-end gap-3" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.borderSoft }}>
        <Avatar uri={avatarUrl} displayName={displayName} size={34} />
        <View className="flex-1 rounded-[22px] px-4 py-2.5 flex-row items-end gap-2" style={{ backgroundColor: colors.elevated }}>
          <BottomSheetTextInput
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            className="flex-1 text-sm"
            style={{ color: colors.text, minHeight: 22, maxHeight: 96, paddingVertical: 0 }}
            autoFocus={autoFocus}
            multiline
            maxLength={500}
            accessibilityLabel={i18n.t('comments.placeholder')}
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
  );
}
