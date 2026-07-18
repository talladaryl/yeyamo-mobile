import { TouchableOpacity, Text, ActivityIndicator, type StyleProp, type ViewStyle } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';

type CTAButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function CTAButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: CTAButtonProps) {
  const colors = useThemeStore((state) => state.colors);
  const variantClasses = {
    primary: 'bg-[#EF4444]',
    secondary: '',
    outline: 'bg-transparent border',
  };

  const textClasses = {
    primary: 'text-white',
    secondary: '',
    outline: '',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} py-4 rounded-2xl items-center justify-center ${disabled ? 'opacity-50' : ''}`}
      style={[variant === 'primary' ? undefined : { backgroundColor: variant === 'secondary' ? colors.elevated : 'transparent', borderColor: colors.border }, style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className={`${textClasses[variant]} text-base font-semibold`} style={{ color: variant === 'primary' ? '#FFFFFF' : colors.text }}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
