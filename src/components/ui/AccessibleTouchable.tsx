import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { ReactNode } from 'react';
import { TOUCH_TARGET } from '@/constants/accessibility';

interface AccessibleTouchableProps extends TouchableOpacityProps {
  children: ReactNode;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'search' | 'menu' | 'tab' | 'checkbox' | 'radio' | 'switch';
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
  minTouchSize?: number;
}

/**
 * TouchableOpacity accessible avec touch target minimum garanti
 * Conforme WCAG 2.1 Success Criterion 2.5.5 (Target Size - Level AAA)
 */
export function AccessibleTouchable({
  children,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  minTouchSize = TOUCH_TARGET.MIN_SIZE,
  style,
  ...props
}: AccessibleTouchableProps) {
  return (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      style={[
        {
          minWidth: minTouchSize,
          minHeight: minTouchSize,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
      activeOpacity={0.7}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

/**
 * Wrapper pour garantir la taille minimale d'un touch target
 */
export function TouchableWrapper({
  children,
  minSize = TOUCH_TARGET.MIN_SIZE,
}: {
  children: ReactNode;
  minSize?: number;
}) {
  return (
    <View
      style={{
        minWidth: minSize,
        minHeight: minSize,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {children}
    </View>
  );
}
