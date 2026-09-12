import { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '@/features/theme/theme.store';

export default function SplashScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const hasNavigated = useRef(false);

  const continueToOnboarding = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    router.replace('/(onboarding)/step1');
  }, [router]);

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1_050),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) continueToOnboarding();
    });

    return () => animation.stop();
  }, [continueToOnboarding, opacity, scale]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.screen}>
        <Animated.View
          accessibilityLabel="Yeyamo"
          accessibilityRole="image"
          style={[styles.logo, { opacity, transform: [{ scale }] }]}
        >
          <View style={styles.mark}>
            <Text style={styles.markLetter}>Y</Text>
          </View>
          <Text style={styles.wordmark}>Yeyamo</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Je découvre mon pays</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 52,
    backgroundColor: '#E02020',
  },
  markLetter: {
    color: '#FFFFFF',
    fontSize: 58,
    fontWeight: '800',
  },
  wordmark: {
    marginTop: 16,
    color: '#E02020',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -2,
  },
  tagline: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '600',
  },
});
