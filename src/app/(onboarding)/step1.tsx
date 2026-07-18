import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Icon } from '@/components/ui/Icon';
import { useOnboardingStore } from '@/features/onboarding/onboarding.store';

export default function Step1Screen() {
  const router = useRouter();
  const { nextStep, setCurrentStep, completeOnboarding } = useOnboardingStore();

  useEffect(() => setCurrentStep(1), [setCurrentStep]);

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={4}
      onNext={() => {
        nextStep();
        router.push('/(onboarding)/step2');
      }}
      onSkip={handleSkip}
      title="Découvrez votre pays autrement"
      subtitle="Des paysages incroyables, des cultures riches et des lieux uniques vous attendent partout au Cameroun."
    >
      <View className="mx-4 flex-1 overflow-hidden rounded-[28px] bg-[#D1FAE5]">
        <Image
          source="https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200"
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={500}
        />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.58)']} className="absolute inset-0" />
        <View className="absolute bottom-5 left-5 right-5 flex-row items-center rounded-2xl bg-black/35 p-4">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <Icon name="location" size={22} color="#FFFFFF" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-xs text-white/75">À découvrir</Text>
            <Text className="mt-0.5 text-base font-bold text-white">Chutes d’Ekom Nkam</Text>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
}
