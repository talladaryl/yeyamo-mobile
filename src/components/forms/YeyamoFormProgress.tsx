import { useEffect, useRef } from 'react';
import { Animated, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';

type YeyamoFormProgressProps = {
  currentStep: number;
  totalSteps: number;
  label?: string;
  description?: string;
  showStepLabel?: boolean;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Shared progress indicator for multi-step forms only. */
export function YeyamoFormProgress({
  currentStep,
  totalSteps,
  label,
  description,
  showStepLabel = true,
  animated = true,
  style,
}: YeyamoFormProgressProps) {
  const colors = useThemeStore((state) => state.colors);
  const safeTotal = Math.max(1, totalSteps);
  const safeCurrent = Math.min(Math.max(1, currentStep), safeTotal);
  const progress = (safeCurrent / safeTotal) * 100;
  const width = useRef(new Animated.Value(animated ? 0 : progress)).current;

  useEffect(() => {
    if (!animated) {
      width.setValue(progress);
      return;
    }

    Animated.timing(width, {
      toValue: progress,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [animated, progress, width]);

  return (
    <View
      className="mb-6"
      style={style}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: safeTotal, now: safeCurrent }}
    >
      {label || description || showStepLabel ? (
        <View className="mb-2 flex-row items-start justify-between gap-3">
          <View className="flex-1">
            {label ? <Text className="text-sm font-extrabold" style={{ color: colors.text }}>{label}</Text> : null}
            {description ? <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{description}</Text> : null}
          </View>
          {showStepLabel ? <Text className="text-xs font-bold" style={{ color: colors.primary }}>Étape {safeCurrent}/{safeTotal}</Text> : null}
        </View>
      ) : null}
      <View className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: colors.elevated }}>
        <Animated.View className="h-full rounded-full" style={{ width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), backgroundColor: colors.primary }} />
      </View>
    </View>
  );
}
