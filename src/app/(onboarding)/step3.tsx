import React from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '@/features/onboarding/onboarding.store';

const { width, height } = Dimensions.get('window');

export default function Step3Screen() {
  const router = useRouter();
  const { nextStep, previousStep, setCurrentStep, completeOnboarding } = useOnboardingStore();

  const handleNext = () => {
    nextStep();
    router.push('/(onboarding)/account-type');
  };

  const handlePrevious = () => {
    previousStep();
    router.back();
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  React.useEffect(() => {
    setCurrentStep(3);
  }, []);

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={4}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSkip={handleSkip}
      title="Vivez des expériences ensemble"
      subtitle="Partagez plus des activités, découvrez des événements et rencontrez en toute sécurité."
      backgroundColor="#0A0A0A"
    >
      <View className="flex-1 px-6">
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={{ marginTop: 20 }}
        >
          {/* Carte d'activité 1 - Hôtel */}
          <View className="bg-[#161616] rounded-2xl p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 items-center justify-center mr-3">
                <Text className="text-white text-lg">🏨</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  Hôtel à Foumban
                </Text>
                <Text className="text-[#A1A1AA] text-sm">
                  Douala
                </Text>
              </View>
              <TouchableOpacity className="bg-[#EF4444] rounded-full px-4 py-2">
                <Text className="text-white text-sm font-semibold">Réserver</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center">
              <Text className="text-[#A1A1AA] text-xs">⭐ 4.8 • </Text>
              <Text className="text-[#A1A1AA] text-xs">2.5km • </Text>
              <Text className="text-[#A1A1AA] text-xs">À partir de 25,000 FCFA</Text>
            </View>
          </View>

          {/* Carte d'activité 2 - Événement */}
          <View className="bg-[#161616] rounded-2xl p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 items-center justify-center mr-3">
                <Text className="text-white text-lg">🎭</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  Festival Ngoun Yaoundé
                </Text>
                <Text className="text-[#A1A1AA] text-sm">
                  Yaoundé
                </Text>
              </View>
              <View className="bg-[#EF4444]/20 rounded-full px-3 py-1">
                <Text className="text-[#EF4444] text-xs font-semibold">2j restants</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Text className="text-[#A1A1AA] text-xs">🎪 Culturel • </Text>
              <Text className="text-[#A1A1AA] text-xs">15-17 Déc • </Text>
              <Text className="text-[#A1A1AA] text-xs">Gratuit</Text>
            </View>
          </View>

          {/* Carte d'activité 3 - Sortie */}
          <View className="bg-[#161616] rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 items-center justify-center mr-3">
                <Text className="text-white text-lg">🏃‍♀️</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  Sortie la plage
                </Text>
                <Text className="text-[#A1A1AA] text-sm">
                  de Kribi
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-[#EF4444] items-center justify-center mr-1">
                  <Text className="text-white text-xs">👤</Text>
                </View>
                <Text className="text-[#A1A1AA] text-xs">+3 autres</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Text className="text-[#A1A1AA] text-xs">⏰ Demain 14h • </Text>
              <Text className="text-[#A1A1AA] text-xs">4 participants • </Text>
              <Text className="text-[#A1A1AA] text-xs">Transport partagé</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </OnboardingLayout>
  );
}
