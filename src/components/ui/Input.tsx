import type { ReactNode } from 'react';
import { Platform, View, Text, TextInput, type TextInputProps } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({ label, error, helperText, containerClassName = '', leftIcon, rightIcon, editable = true, ...props }: InputProps) {
  const colors = useThemeStore((state) => state.colors);
  const multiline = Boolean(props.multiline);

  return (
    <View className={`gap-1 ${containerClassName}`}>
      {label ? <Text className="text-sm font-medium" style={{ color: colors.textSecondary, lineHeight: 20 }}>{label}</Text> : null}
      <View
        className="flex-row items-center rounded-xl border"
        style={{ backgroundColor: editable ? colors.surface : colors.elevated, borderColor: error ? colors.primary : colors.borderSoft, opacity: editable ? 1 : 0.7 }}
      >
        {leftIcon ? <View className="pl-4">{leftIcon}</View> : null}
        <TextInput
          className="flex-1 px-4 text-base"
          style={{
            color: colors.text,
            minHeight: multiline ? 112 : 52,
            paddingVertical: multiline ? 12 : 0,
            lineHeight: 22,
            textAlignVertical: multiline ? 'top' : 'center',
            ...(Platform.OS === 'android' ? { includeFontPadding: true } : {}),
          }}
          placeholderTextColor={colors.textMuted}
          editable={editable}
          accessibilityLabel={label}
          accessibilityHint={helperText}
          {...props}
        />
        {rightIcon ? <View className="pr-4">{rightIcon}</View> : null}
      </View>
      {error ? <Text className="text-xs" style={{ color: colors.primary, lineHeight: 18 }}>{error}</Text> : null}
      {!error && helperText ? <Text className="text-xs" style={{ color: colors.textMuted, lineHeight: 18 }}>{helperText}</Text> : null}
    </View>
  );
}
