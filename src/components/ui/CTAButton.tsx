import type { StyleProp, ViewStyle } from 'react-native';
import { Button } from '@/components/ui/Button';

type CTAButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** @deprecated Use Button directly for new screens. Kept as a compatible facade. */
export function CTAButton({ title, onPress, variant = 'primary', loading, disabled, fullWidth, style }: CTAButtonProps) {
  return <Button label={title} onPress={onPress} variant={variant} size="lg" isLoading={loading} disabled={disabled} fullWidth={fullWidth} style={style} />;
}
