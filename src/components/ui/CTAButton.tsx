import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

type CTAButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
};

export function CTAButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
}: CTAButtonProps) {
  const variantClasses = {
    primary: 'bg-[#EF4444]',
    secondary: 'bg-[#27272A]',
    outline: 'bg-transparent border border-[#27272A]',
  };

  const textClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-white',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} py-4 rounded-2xl items-center justify-center ${disabled ? 'opacity-50' : ''}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className={`${textClasses[variant]} text-base font-semibold`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
