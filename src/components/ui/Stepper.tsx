import { Text, View } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

export function Stepper({ currentStep, totalSteps }: StepperProps) {
  const colors = useThemeStore((state) => state.colors);
  const safeTotal = Math.max(1, totalSteps);
  const safeCurrent = Math.min(Math.max(1, currentStep), safeTotal);
  const progress = Math.round((safeCurrent / safeTotal) * 100);
  return <View className="mb-6" accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: safeTotal, now: safeCurrent }}>
    <View className="mb-2 flex-row items-center justify-between">
      <Text className="text-sm font-extrabold" style={{ color: colors.text }}>Étape {safeCurrent} sur {safeTotal}</Text>
      <Text className="text-xs font-bold" style={{ color: colors.primary }}>{progress}%</Text>
    </View>
    <View className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: colors.elevated }}>
      <View className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: colors.primary }} />
    </View>
  </View>;
}
