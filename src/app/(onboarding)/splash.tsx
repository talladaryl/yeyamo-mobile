import React, { useEffect, useRef } from 'react';
import { View, Text, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(logoScale, {
            toValue: 1.1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.timing(sloganOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Transition automatique vers step1
    const timer = setTimeout(() => {
      router.replace('/(onboarding)/step1');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View 
      className="flex-1 items-center justify-center"
      style={{
        backgroundColor: '#EF4444'
      }}
    >
      {/* Logo YEYAMO */}
      <Animated.View 
        style={[
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
            marginBottom: height * 0.1,
          }
        ]}
        className="items-center"
      >
        <View className="bg-white rounded-full w-32 h-32 items-center justify-center mb-6 shadow-lg">
          <View className="w-20 h-20 rounded-full border-4 border-[#EF4444] items-center justify-center">
            <Text className="text-[#EF4444] text-2xl font-bold">Y</Text>
          </View>
        </View>
        
        <Text className="text-white text-4xl font-extrabold tracking-wider">
          Yeyamo
        </Text>
      </Animated.View>

      {/* Slogan */}
      <Animated.View 
        style={[
          { opacity: sloganOpacity },
          { position: 'absolute', bottom: 80, paddingHorizontal: 32 }
        ]}
      >
        <Text className="text-white/90 text-lg text-center font-medium">
          Yeyamo, je découvre{'\n'}mon pays
        </Text>
      </Animated.View>
    </View>
  );
}