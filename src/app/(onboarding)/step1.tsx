import React from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '@/features/onboarding/onboarding.store';

const { width, height } = Dimensions.get('window');

export default function Step1Screen() {
  const router = useRouter();
  const { nextStep, setCurrentStep } = useOnboardingStore();

  const handleNext = () => {
    nextStep();
    router.push('/(onboarding)/step2');
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  React.useEffect(() => {
    setCurrentStep(1);
  }, []);

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={4}
      onNext={handleNext}
      onSkip={handleSkip}
      title="Découvrez votre pays autrement"
      subtitle="Explorez des lieux uniques, des cultures riches et des lieux uniques vous attendant."
      backgroundColor="#0A0A0A"
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* Image immersive - Cascade */}
        <View 
          className="rounded-3xl overflow-hidden shadow-2xl mb-8"
          style={{ 
            width: width * 0.85, 
            height: height * 0.5,
          }}
        >
          <View className="flex-1 bg-gradient-to-b from-blue-400 to-green-500 items-center justify-center">
            {/* Simulation d'une cascade avec du texte pour le moment */}
            <View className="bg-white/20 rounded-2xl p-6 items-center">
              <Text className="text-white text-6xl mb-2">🏞️</Text>
              <Text className="text-white text-lg font-semibold">
                Cascade d'Ekom
              </Text>
              <Text className="text-white/80 text-sm text-center mt-2">
                Découvrez la beauté naturelle du Cameroun
              </Text>
            </View>
          </View>
        </View>

        {/* Indicateur "Passer" en haut */}
        <View className="absolute top-4 right-4">
          <Text className="text-[#A1A1AA] text-sm">Étape 1/4</Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}