import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useThemeStore } from '@/features/theme/theme.store';

export function AnimatedProgressBar({ value, color = '#EF4444', height = 10, label }: { value: number; color?: string; height?: number; label?: string }) {
  const colors = useThemeStore((state) => state.colors);
  const progress = useSharedValue(0);
  const normalized = Math.max(0, Math.min(value, 100));
  useEffect(() => { progress.value = withTiming(normalized, { duration: 850, easing: Easing.out(Easing.cubic) }); }, [normalized, progress]);
  const style = useAnimatedStyle(() => ({ width: `${progress.value}%` }));
  return (
    <View>
      {label ? <View className="mb-2 flex-row justify-between"><Text className="text-xs" style={{ color: colors.textSecondary }}>{label}</Text><Text className="text-xs font-bold" style={{ color: colors.text }}>{Math.round(normalized)}%</Text></View> : null}
      <View className="overflow-hidden rounded-full" style={{ height, backgroundColor: colors.elevated }}><Animated.View className="h-full rounded-full" style={[{ backgroundColor: color }, style]} /></View>
    </View>
  );
}
