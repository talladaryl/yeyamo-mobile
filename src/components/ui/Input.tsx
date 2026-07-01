import { View, Text, TextInput, type TextInputProps } from 'react-native';
import type { ReactNode } from 'react';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  leftIcon?: ReactNode;
}

export function Input({ label, error, containerClassName = '', leftIcon, ...props }: InputProps) {
  return (
    <View className={`gap-1 ${containerClassName}`}>
      {label ? (
        <Text className="text-sm text-[#A1A1AA] font-medium">{label}</Text>
      ) : null}
      <View
        className={`bg-[#1F1F1F] rounded-xl border flex-row items-center ${
          error ? 'border border-[#EF4444]' : 'border border-[#27272A]'
        }`}
      >
        {leftIcon ? <View className="pl-4">{leftIcon}</View> : null}
        <TextInput
          className="flex-1 text-white px-4 py-3 text-base"
          placeholderTextColor="#52525B"
          autoCapitalize="none"
          {...props}
        />
      </View>
      {error ? (
        <Text className="text-xs text-[#EF4444]">{error}</Text>
      ) : null}
    </View>
  );
}
