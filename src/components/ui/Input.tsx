import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({ label, error, containerClassName = '', ...props }: InputProps) {
  return (
    <View className={`gap-1 ${containerClassName}`}>
      {label ? (
        <Text className="text-sm text-[#A1A1AA] font-medium">{label}</Text>
      ) : null}
      <TextInput
        className={`bg-[#1F1F1F] text-white rounded-xl px-4 py-3 text-base ${
          error ? 'border border-[#EF4444]' : 'border border-[#27272A]'
        }`}
        placeholderTextColor="#52525B"
        autoCapitalize="none"
        {...props}
      />
      {error ? (
        <Text className="text-xs text-[#EF4444]">{error}</Text>
      ) : null}
    </View>
  );
}
