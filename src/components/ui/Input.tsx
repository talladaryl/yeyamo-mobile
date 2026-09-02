import { View, Text, TextInput, type TextInputProps } from 'react-native';
import type { ReactNode } from 'react';
import { useThemeStore } from '@/features/theme/theme.store';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  leftIcon?: ReactNode;
}

export function Input({ label, error, containerClassName = '', leftIcon, ...props }: InputProps) {
  const colors = useThemeStore((state) => state.colors);

  return (
    <View className={`gap-1 ${containerClassName}`}>
      {label ? (
        <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>{label}</Text>
      ) : null}
      <View
        className="flex-row items-center rounded-xl border"
        style={{ backgroundColor: colors.surface, borderColor: error ? colors.primary : colors.borderSoft }}
      >
        {leftIcon ? <View className="pl-4">{leftIcon}</View> : null}
        <TextInput
          className="flex-1 px-4 py-3 text-base"
          style={{ color: colors.text }}
          placeholderTextColor={colors.textMuted}
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
