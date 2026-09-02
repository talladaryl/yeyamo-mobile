import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';

const BRAND_RED = '#E02020';
const LETTERS = 'Yeyamo'.split('');
const BUILDINGS = [42, 58, 76, 52, 68];

export function AnimatedYeyamoLogo() {
  const globeScale = useRef(new Animated.Value(0.35)).current;
  const globeOpacity = useRef(new Animated.Value(0)).current;
  const orbit = useRef(new Animated.Value(0)).current;
  const constructionOpacity = useRef(new Animated.Value(1)).current;
  const finalLogoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const houseDrops = useMemo(() => BUILDINGS.map(() => new Animated.Value(-80)), []);
  const houseOpacities = useMemo(() => BUILDINGS.map(() => new Animated.Value(0)), []);
  const letterOpacities = useMemo(() => LETTERS.map(() => new Animated.Value(0)), []);
  const letterOffsets = useMemo(() => LETTERS.map(() => new Animated.Value(14)), []);

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.spring(globeScale, {
        toValue: 1,
        damping: 10,
        stiffness: 95,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(globeOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(orbit, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      ...houseDrops.map((value, index) =>
        Animated.sequence([
          Animated.delay(620 + index * 130),
          Animated.parallel([
            Animated.spring(value, {
              toValue: 0,
              damping: 8,
              stiffness: 150,
              useNativeDriver: true,
            }),
            Animated.timing(houseOpacities[index], {
              toValue: 1,
              duration: 180,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ),
      ...letterOpacities.map((value, index) =>
        Animated.sequence([
          Animated.delay(2050 + index * 125),
          Animated.parallel([
            Animated.timing(value, {
              toValue: 1,
              duration: 320,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.spring(letterOffsets[index], {
              toValue: 0,
              damping: 9,
              stiffness: 130,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ),
      Animated.sequence([
        Animated.delay(2920),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(3550),
        Animated.timing(finalLogoOpacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(3900),
        Animated.timing(constructionOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();
    return () => animation.stop();
  }, [constructionOpacity, finalLogoOpacity, globeOpacity, globeScale, houseDrops, houseOpacities, letterOffsets, letterOpacities, orbit, taglineOpacity]);

  const orbitRotation = orbit.interpolate({
    inputRange: [0, 1],
    outputRange: ['-35deg', '325deg'],
  });

  return (
    <View className="h-[360px] w-[320px] items-center justify-center">
      <Animated.View
        className="absolute h-[330px] w-[310px] items-center justify-center overflow-hidden rounded-[36px] border"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#F1D7D7',
          opacity: finalLogoOpacity,
          shadowColor: BRAND_RED,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          elevation: 8,
        }}
      >
        <Image
          source={require('../../../assets/logo1.jpeg')}
          style={{ width: 292, height: 252 }}
          contentFit="contain"
          transition={0}
        />
      </Animated.View>

      <Animated.View className="absolute inset-0 items-center justify-center" style={{ opacity: constructionOpacity }}>
        <View className="h-[225px] w-[250px] items-center justify-end">
          <Animated.View
            className="absolute bottom-4 h-[178px] w-[178px] items-center justify-center rounded-full border-[13px]"
            style={{
              borderColor: BRAND_RED,
              opacity: globeOpacity,
              transform: [{ scale: globeScale }],
              shadowColor: BRAND_RED,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.18,
              shadowRadius: 18,
            }}
          >
            <View className="h-[118px] w-[118px] rotate-[-18deg] rounded-full border-[5px] border-[#EF7772]" />
            <View className="absolute h-20 w-8 rotate-45 rounded-full bg-white" />
          </Animated.View>

          <View className="absolute bottom-[171px] flex-row items-end gap-1">
            {BUILDINGS.map((height, index) => (
              <Animated.View
                key={`${height}-${index}`}
                className="w-7 rounded-t-md border border-[#F59A96]"
                style={{
                  height,
                  backgroundColor: BRAND_RED,
                  opacity: houseOpacities[index],
                  transform: [{ translateY: houseDrops[index] }],
                }}
              >
                <View className="mt-2 items-center gap-1.5">
                  <View className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  <View className="h-1.5 w-1.5 rounded-full bg-white/70" />
                </View>
              </Animated.View>
            ))}
          </View>

          <Animated.View
            className="absolute bottom-0 h-[205px] w-[205px]"
            style={{ transform: [{ rotate: orbitRotation }] }}
          >
            <View className="absolute left-[82px] top-[-4px] h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-[#EF5B55] shadow-sm">
              <Icon name="walk" size={24} color="#FFFFFF" />
            </View>
          </Animated.View>
        </View>

        <View className="mt-3 h-16 flex-row items-center justify-center">
          {LETTERS.map((letter, index) => (
            <Animated.Text
              key={`${letter}-${index}`}
              className="text-[48px] font-extrabold"
              style={{
                color: BRAND_RED,
                opacity: letterOpacities[index],
                transform: [{ translateY: letterOffsets[index] }],
                letterSpacing: -3,
              }}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>

        <Animated.View style={{ opacity: taglineOpacity }}>
          <Text className="mt-1 text-center text-[14px] font-semibold" style={{ color: '#71717A' }}>
            Yeyamo, je découvre mon pays
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
