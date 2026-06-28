import React from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '@/features/onboarding/onboarding.store';

const { width, height } = Dimensions.get('window');

export default function Step2Screen() {
  const router = useRouter();
  const { nextStep, previousStep, setCurrentStep } = useOnboardingStore();

  const handleNext = () => {
    nextStep();
    router.push('/(onboarding)/step3');
  };

  const handlePrevious = () => {
    previousStep();
    router.back();
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  React.useEffect(() => {
    setCurrentStep(2);
  }, []);

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={4}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSkip={handleSkip}
      title="Partagez vos découvertes"
      subtitle="Publiez, inspirez, échangez et faites grandir la communauté YEYAMO."
      backgroundColor="#0A0A0A"
    >
      <View className="flex-1 px-6">
        {/* Interface type réseau social */}
        <View 
          className="bg-[#161616] rounded-2xl overflow-hidden"
          style={{ 
            width: width * 0.85, 
            height: height * 0.55,
            alignSelf: 'center',
            marginTop: 20
          }}
        >
          {/* Header du post */}
          <View className="flex-row items-center p-4 border-b border-[#27272A]">
            <View className="w-10 h-10 rounded-full bg-[#7C3AED] items-center justify-center mr-3">
              <Text className="text-white font-semibold">👤</Text>
            </View>
            <View>
              <Text className="text-white font-semibold">Sarah M.</Text>
              <Text className="text-[#A1A1AA] text-xs">Il y a 2h • Douala</Text>
            </View>
          </View>

          {/* Contenu vidéo vertical */}
          <View className="flex-1 bg-gradient-to-b from-orange-400 to-pink-500 items-center justify-center">
            <View className="absolute top-4 right-4 bg-black/50 rounded-full px-2 py-1">
              <Text className="text-white text-xs">▶️ 0:45</Text>
            </View>
            
            <View className="bg-white/20 rounded-xl p-4 items-center">
              <Text className="text-white text-4xl mb-2">🎥</Text>
              <Text className="text-white font-semibold text-center">
                Festival Ngoun Yaoundé
              </Text>
              <Text className="text-white/80 text-sm text-center mt-1">
                Ambiance incroyable !
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row items-center justify-around py-3 border-t border-[#27272A]">
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-white mr-1">❤️</Text>
              <Text className="text-[#A1A1AA] text-sm">124</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-white mr-1">💬</Text>
              <Text className="text-[#A1A1AA] text-sm">32</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-white mr-1">📤</Text>
              <Text className="text-[#A1A1AA] text-sm">Partager</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
}