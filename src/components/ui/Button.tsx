import type { ReactNode } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  accessibilityHint?: string;
  testID?: string;
}

const sizeStyles: Record<ButtonSize, { minHeight: number; horizontal: number; radius: number; fontSize: number }> = {
  sm: { minHeight: 40, horizontal: 14, radius: 10, fontSize: 13 },
  md: { minHeight: 48, horizontal: 18, radius: 12, fontSize: 15 },
  lg: { minHeight: 56, horizontal: 22, radius: 16, fontSize: 16 },
};

/** Single visual primitive for text actions. Icon-only actions remain ActionButton. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  style,
  fullWidth = true,
  leftIcon,
  rightIcon,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const colors = useThemeStore((state) => state.colors);
  const metrics = sizeStyles[size];
  const inactive = disabled || isLoading;
  const isPrimary = variant === 'primary' || variant === 'danger';
  const backgroundColor = isPrimary ? colors.primary : variant === 'secondary' ? colors.elevated : 'transparent';
  const borderWidth = variant === 'outline' ? 1 : 0;
  const textColor = isPrimary ? '#FFFFFF' : variant === 'outline' ? colors.primary : colors.text;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: isLoading }}
      testID={testID}
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.78}
      className={`flex-row items-center justify-center ${fullWidth ? 'w-full' : ''} ${className}`}
      style={[
        {
          minHeight: metrics.minHeight,
          paddingHorizontal: metrics.horizontal,
          borderRadius: metrics.radius,
          backgroundColor,
          borderColor: variant === 'outline' ? colors.border : 'transparent',
          borderWidth,
          opacity: inactive ? 0.5 : 1,
        },
        style,
      ]}
    >
      {isLoading ? <ActivityIndicator color={isPrimary ? '#FFFFFF' : colors.primary} /> : <>
        {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}
        <Text className="font-semibold" style={{ color: textColor, fontSize: metrics.fontSize }}>{label}</Text>
        {rightIcon ? <View className="ml-2">{rightIcon}</View> : null}
      </>}
    </TouchableOpacity>
  );
}
