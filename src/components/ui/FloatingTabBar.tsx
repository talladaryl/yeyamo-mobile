import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useThemeStore } from '@/features/theme/theme.store';
import { useFloatingNavigationStore } from '@/hooks/useFloatingNavigation';

function withAlpha(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((part) => `${part}${part}`).join('')
    : normalized;
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function ActiveTabBubble({ itemCount, width, activeIndex }: { itemCount: number; width: number; activeIndex: number }) {
  const colors = useThemeStore((state) => state.colors);
  const isScrolling = useFloatingNavigationStore((state) => state.isScrolling);
  const reducedMotion = useReducedMotion();
  const position = useSharedValue(activeIndex);
  const itemWidth = width > 0 ? width / itemCount : 0;
  const size = isScrolling ? 42 : 48;

  useEffect(() => {
    position.value = reducedMotion
      ? activeIndex
      : withSpring(activeIndex, { damping: 20, stiffness: 190, mass: 0.65 });
  }, [activeIndex, position, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: position.value * itemWidth + itemWidth / 2 - size / 2 },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: isScrolling ? 5 : 10,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: withAlpha(colors.surfaceGlassStrong, 0.58),
          borderWidth: 1,
          borderColor: withAlpha(colors.borderGlass, 0.9),
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.14,
          shadowRadius: 7,
          elevation: 3,
        },
        animatedStyle,
      ]}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 3,
          left: 8,
          right: 8,
          height: 8,
          borderRadius: 8,
          backgroundColor: withAlpha(colors.accent, 0.12),
        }}
      />
    </Animated.View>
  );
}

export function FloatingTabBarBackground() {
  const { colors, resolvedTheme } = useThemeStore();
  const isScrolling = useFloatingNavigationStore((state) => state.isScrolling);
  const activeIndex = useNavigationState((state) => state.index);
  const [width, setWidth] = useState(0);

  return (
    <View
      pointerEvents="none"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[
        StyleSheet.absoluteFillObject,
        {
          overflow: 'hidden',
          borderRadius: isScrolling ? 27 : 30,
          borderWidth: 1,
          borderColor: withAlpha(colors.borderGlass, 0.9),
          backgroundColor: withAlpha(colors.surfaceGlass, 0.38),
        },
      ]}
    >
      <BlurView
        intensity={24}
        tint={resolvedTheme === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: withAlpha(colors.surfaceGlassStrong, 0.4) }]}
      />
      <ActiveTabBubble itemCount={5} width={width} activeIndex={activeIndex} />
    </View>
  );
}
