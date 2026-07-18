import { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

type CommentInputProps = {
  onSubmit: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export function CommentInput({
  onSubmit,
  placeholder = 'Écrire un commentaire...',
  autoFocus = false,
}: CommentInputProps) {
  const [text, setText] = useState('');
  const colors = useThemeStore((state) => state.colors);

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <View className="border-t px-4 py-3 flex-row items-end gap-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <View className="flex-1 rounded-[22px] px-4 py-2.5 flex-row items-end gap-2" style={{ backgroundColor: colors.elevated }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            className="flex-1 text-sm"
            style={{ color: colors.text, minHeight: 22, maxHeight: 96, paddingVertical: 0 }}
            autoFocus={autoFocus}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity activeOpacity={0.7}>
            <Icon library="ionicons" name="happy-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!text.trim()}
          activeOpacity={0.7}
        >
          <Icon
            library="ionicons"
            name="send"
            size={24}
            color={text.trim() ? '#EF4444' : '#52525B'}
          />
        </TouchableOpacity>
    </View>
  );
}
