import { useState } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Icon } from '@/components/ui/Icon';

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

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View className="bg-[#161616] border-t border-[#27272A] px-4 py-3 flex-row items-center gap-3">
        <View className="flex-1 bg-[#0A0A0A] rounded-full px-4 py-2.5 flex-row items-center gap-2">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor="#52525B"
            className="flex-1 text-white text-sm"
            autoFocus={autoFocus}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity activeOpacity={0.7}>
            <Icon library="ionicons" name="happy-outline" size={22} color="#A1A1AA" />
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
    </KeyboardAvoidingView>
  );
}
