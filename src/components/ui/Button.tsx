import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

const variantClasses: Record<Variant, { container: string; text: string }> = {
  primary: { container: 'bg-[#EF4444]', text: 'text-white font-semibold' },
  outline: {
    container: 'border border-[#EF4444] bg-transparent',
    text: 'text-[#EF4444] font-semibold',
  },
  ghost: { container: 'bg-transparent', text: 'text-[#A1A1AA]' },
  danger: { container: 'bg-[#EF4444]', text: 'text-white font-semibold' },
};

const sizeClasses: Record<Size, { container: string; text: string }> = {
  sm: { container: 'px-4 py-2 rounded-lg', text: 'text-sm' },
  md: { container: 'px-6 py-3 rounded-xl', text: 'text-base' },
  lg: { container: 'px-8 py-4 rounded-xl', text: 'text-lg' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  const vc = variantClasses[variant];
  const sc = sizeClasses[size];
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      className={`flex-row items-center justify-center ${vc.container} ${sc.container} ${isDisabled ? 'opacity-50' : ''} ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text className={`${vc.text} ${sc.text}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
