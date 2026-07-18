import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Icon } from '@/components/ui/Icon';
import { useOnboardingStore } from '@/features/onboarding/onboarding.store';

const experiences = [
  { title: 'Sortie à la plage de Kribi', meta: 'Sam. 18 mai · 15h00', icon: 'people', color: '#38BDF8' },
  { title: 'Festival Ngouon', meta: '24–26 mai · Foumban', icon: 'musical-notes', color: '#A78BFA' },
  { title: 'Hôtel La Falaise', meta: 'À partir de 25 000 FCFA', icon: 'bed', color: '#EF4444' },
] as const;

export default function Step3Screen() {
  const router = useRouter();
  const { nextStep, previousStep, setCurrentStep, completeOnboarding } = useOnboardingStore();

  useEffect(() => setCurrentStep(3), [setCurrentStep]);

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={4}
      onPrevious={() => {
        previousStep();
        router.back();
      }}
      onNext={() => {
        nextStep();
        router.push('/(onboarding)/account-type');
      }}
      onSkip={handleSkip}
      title="Vivez des expériences ensemble"
      subtitle="Rejoignez des activités, rencontrez la communauté et réservez vos prochaines expériences en toute simplicité."
    >
      <View className="mx-4 flex-1 overflow-hidden rounded-[28px] bg-[#FFEDD5]">
        <Image
          source="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200"
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={500}
        />
        <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.58)']} className="absolute inset-0" />
        <View className="absolute inset-x-4 top-5 gap-3">
          {experiences.map((experience, index) => (
            <View
              key={experience.title}
              className="flex-row items-center rounded-2xl border border-white/40 bg-white/90 p-3"
              style={{ marginLeft: index === 1 ? 28 : index === 2 ? 12 : 0 }}
            >
              <View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${experience.color}20` }}>
                <Icon name={experience.icon} size={21} color={experience.color} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-[#18181B]">{experience.title}</Text>
                <Text className="mt-1 text-[11px] text-[#71717A]">{experience.meta}</Text>
              </View>
              <Icon name={index === 2 ? 'arrow-forward-circle' : 'bookmark-outline'} size={20} color="#EF4444" />
            </View>
          ))}
        </View>
        <View className="absolute bottom-5 left-5 right-5 rounded-2xl bg-black/35 p-4">
          <Text className="text-xs font-semibold text-white/75">À plusieurs, c’est encore mieux</Text>
          <Text className="mt-1 text-base font-bold text-white">Sortez, rencontrez, réservez.</Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}
