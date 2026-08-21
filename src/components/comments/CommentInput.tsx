import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View, TouchableOpacity } from 'react-native';
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
  const reactions = ['😂', '💪', '❤️', '😁', '🥰', '😮', '😉', '😅'];

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
    <View className="border-t pb-2 pt-1" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.borderSoft }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={{ gap: 18, paddingHorizontal: 18, paddingVertical: 8 }}>
        {reactions.map((reaction) => <TouchableOpacity key={reaction} onPress={() => setText((current) => `${current}${reaction}`)} activeOpacity={0.7}><Text className="text-2xl">{reaction}</Text></TouchableOpacity>)}
      </ScrollView>
      <View className="flex-row items-end gap-2 px-3">
        <Avatar uri={avatarUrl} displayName={displayName} size={34} />
        <View className="min-h-12 flex-1 rounded-[24px] px-4 py-3 flex-row items-end gap-2" style={{ backgroundColor: colors.elevated }}>
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
      <View className="mt-1 flex-row items-center gap-4 px-14">
        <TouchableOpacity className="h-8 w-8 items-center justify-center"><Icon name="image-outline" size={22} color={colors.text} /></TouchableOpacity>
        <TouchableOpacity className="h-8 w-8 items-center justify-center"><Icon name="happy-outline" size={22} color={colors.text} /></TouchableOpacity>
        <TouchableOpacity onPress={() => setText((current) => `${current}@`)} className="h-8 w-8 items-center justify-center"><Icon name="at" size={22} color={colors.text} /></TouchableOpacity>
        <TouchableOpacity className="h-8 w-8 items-center justify-center"><Icon name="mic-outline" size={23} color={colors.text} /></TouchableOpacity>
      </View>
    </View>
  );
}
