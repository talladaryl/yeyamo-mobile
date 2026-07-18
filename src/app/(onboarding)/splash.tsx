import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/features/theme/theme.store';
import { AnimatedYeyamoLogo } from '@/components/onboarding/AnimatedYeyamoLogo';

export default function SplashScreen() {
  const router = useRouter();
  const { colors, resolvedTheme } = useThemeStore();
  const scale = useRef(new Animated.Value(0.82)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const hasNavigated = useRef(false);

  const continueToOnboarding = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    router.replace('/(onboarding)/step1');
  };

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, damping: 10, stiffness: 90, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 750, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 750, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.035, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ).start();
    });

    const timer = setTimeout(continueToOnboarding, 30_000);
    return () => clearTimeout(timer);
  }, [opacity, scale, translateY]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <LinearGradient
        colors={resolvedTheme === 'dark' ? ['#0A0A0A', '#111111', '#2A1113'] : ['#FFFFFF', '#FFFFFF', '#FFF1F2']}
        locations={[0, 0.62, 1]}
        className="absolute inset-0"
      />
      <View className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#EF4444]/10" />
      <View className="absolute -bottom-40 right-[-70px] h-80 w-80 rounded-full bg-[#EF4444]/15" />
      <View className="absolute left-8 top-20 h-3 w-3 rounded-full bg-[#EF4444]/20" />
      <View className="absolute right-12 top-32 h-5 w-5 rounded-full bg-[#EF4444]/10" />

      <SafeAreaView className="flex-1 items-center justify-center px-8">
        <TouchableOpacity onPress={continueToOnboarding} activeOpacity={0.9} accessibilityLabel="Commencer l’onboarding">
          <Animated.View
            className="items-center"
            style={{ opacity, transform: [{ scale }, { translateY }] }}
          >
            <AnimatedYeyamoLogo />
          </Animated.View>
        </TouchableOpacity>

        <View className="absolute bottom-10 items-center">
          <View className="h-1 w-12 overflow-hidden rounded-full" style={{ backgroundColor: colors.border }}>
            <Animated.View className="h-full w-full rounded-full bg-[#EF4444]" style={{ opacity }} />
          </View>
          <Text className="mt-3 text-xs" style={{ color: colors.textSecondary }}>Touchez pour continuer</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
