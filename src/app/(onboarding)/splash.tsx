import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();
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

    const timer = setTimeout(continueToOnboarding, 3000);
    return () => clearTimeout(timer);
  }, [opacity, scale, translateY]);

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF', '#FFF1F2']}
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
            <Image
              source={require('../../../assets/logo.png')}
              style={{ width: 230, height: 180 }}
              contentFit="contain"
              transition={250}
            />
            <Text className="mt-2 text-center text-[15px] font-medium leading-6 text-[#52525B]">
              Yeyamo, je découvre{`\n`}mon pays
            </Text>
          </Animated.View>
        </TouchableOpacity>

        <View className="absolute bottom-10 items-center">
          <View className="h-1 w-12 overflow-hidden rounded-full bg-[#E4E4E7]">
            <Animated.View className="h-full w-full rounded-full bg-[#EF4444]" style={{ opacity }} />
          </View>
          <Text className="mt-3 text-xs text-[#A1A1AA]">Touchez pour continuer</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
