import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/features/onboarding/onboarding.store';

const { width, height } = Dimensions.get('window');

export default function AccountTypeScreen() {
  const router = useRouter();
  const { selectedAccountType, setAccountType, completeOnboarding, setCurrentStep } = useOnboardingStore();

  const handleAccountTypeSelect = async (type: 'explorer' | 'developer') => {
    setAccountType(type);
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  React.useEffect(() => {
    setCurrentStep(4);
  }, []);

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      <SafeAreaView className="flex-1">
        {/* Header avec bouton retour */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <Text className="text-[#52525B] text-lg">←</Text>
          </TouchableOpacity>
        </View>

        {/* Contenu principal */}
        <View className="flex-1 px-6">
          {/* Titre */}
          <View className="mb-12">
            <Text className="text-[#18181B] text-2xl font-bold mb-3">
              Choisissez votre{'\n'}expérience YEYAMO
            </Text>
            <Text className="text-[#71717A] text-base leading-6">
              Deux façons de profiter de tous nos contenus offres, une expérience optimisée.
            </Text>
          </View>

          {/* Cartes de choix */}
          <View className="gap-4">
            {/* Carte Explorer */}
            <TouchableOpacity
              onPress={() => handleAccountTypeSelect('explorer')}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#E4E4E7]"
              style={{ height: height * 0.25 }}
            >
              <View className="flex-1 justify-between">
                {/* Icône et titre */}
                <View>
                  <View className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl items-center justify-center mb-4">
                    <Text className="text-white text-2xl">🗺️</Text>
                  </View>
                  <Text className="text-[#18181B] text-xl font-bold mb-2">
                    Explorer YEYAMO
                  </Text>
                  <Text className="text-[#71717A] text-sm leading-5">
                    Découvrez des lieux, partagez vos expériences, connectez-vous avec la communauté et vivez des expériences.
                  </Text>
                </View>

                {/* Avantages */}
                <View className="space-y-2">
                  <View className="flex-row items-center">
                    <Text className="text-green-500 mr-2">✓</Text>
                    <Text className="text-[#71717A] text-xs">Accès gratuit à tous nos contenus</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-green-500 mr-2">✓</Text>
                    <Text className="text-[#71717A] text-xs">Communauté active</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Carte Développer */}
            <TouchableOpacity
              onPress={() => handleAccountTypeSelect('developer')}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#E4E4E7]"
              style={{ height: height * 0.25 }}
            >
              <View className="flex-1 justify-between">
                {/* Icône et titre */}
                <View>
                  <View className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl items-center justify-center mb-4">
                    <Text className="text-white text-2xl">🏢</Text>
                  </View>
                  <Text className="text-[#18181B] text-xl font-bold mb-2">
                    Développer{'\n'}mon activité
                  </Text>
                  <Text className="text-[#71717A] text-sm leading-5">
                    Présenter vos services, proposez des offres au monde et connectez-vous avec vos clients et partenaires.
                  </Text>
                </View>

                {/* Avantages */}
                <View className="space-y-2">
                  <View className="flex-row items-center">
                    <Text className="text-green-500 mr-2">✓</Text>
                    <Text className="text-[#71717A] text-xs">Outils de gestion avancés</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-green-500 mr-2">✓</Text>
                    <Text className="text-[#71717A] text-xs">Analyses et insights</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation simple et intuitive */}
        <View className="px-6 pb-8">
          <Text className="text-[#A1A1AA] text-xs text-center">
            Navigation simple et intuitive
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}