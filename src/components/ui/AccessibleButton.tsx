import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TOUCH_TARGET, A11Y_LABELS } from '@/constants/accessibility';

interface AccessibleButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityHint?: string;
  testID?: string;
}

/**
 * Bouton accessible avec labels ARIA, touch target minimum et états
 */
export function AccessibleButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityHint,
  testID,
}: AccessibleButtonProps) {
  const getVariantStyles = () => {
    const base = 'rounded-xl px-6 py-3 flex-row items-center justify-center';
    
    switch (variant) {
      case 'primary':
        return `${base} bg-[#EF4444]`;
      case 'secondary':
        return `${base} bg-[#27272A]`;
      case 'outline':
        return `${base} bg-transparent border-2 border-[#EF4444]`;
      case 'ghost':
        return `${base} bg-transparent`;
      case 'danger':
        return `${base} bg-[#DC2626]`;
      default:
        return base;
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'outline':
        return 'text-[#EF4444] font-semibold text-base';
      case 'ghost':
        return 'text-white font-semibold text-base';
      default:
        return 'text-white font-semibold text-base';
    }
  };

  const isDisabled = disabled || loading;

  // Label accessible avec état
  const accessibilityLabel = loading
    ? `${label}, ${A11Y_LABELS.LOADING}`
    : label;

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={`${getVariantStyles()} ${fullWidth ? 'w-full' : ''}`}
      style={{
        minHeight: TOUCH_TARGET.MIN_SIZE,
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={20}
              color={variant === 'outline' ? '#EF4444' : '#FFFFFF'}
              style={{ marginRight: 8 }}
              importantForAccessibility="no"
              accessible={false}
            />
          )}
          <Text className={getTextStyles()}>{label}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={20}
              color={variant === 'outline' ? '#EF4444' : '#FFFFFF'}
              style={{ marginLeft: 8 }}
              importantForAccessibility="no"
              accessible={false}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
