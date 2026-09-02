import { SafeAreaView } from 'react-native-safe-area-context';
import type { StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';

interface SafeScreenProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function SafeScreen({ children, className = '', style }: SafeScreenProps) {
  const backgroundColor = useThemeStore((state) => state.colors.background);

  return (
    <SafeAreaView
      className={`flex-1 ${className}`}
      edges={['top']}
      style={[{ backgroundColor }, style]}
    >
      {children}
    </SafeAreaView>
  );
}
