import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { useOnboardingStore } from '@/features/onboarding/onboarding.store';

export default function Step2Screen() {
  const router = useRouter();
  const { nextStep, previousStep, setCurrentStep, completeOnboarding } = useOnboardingStore();

  useEffect(() => setCurrentStep(2), [setCurrentStep]);

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={3}
      onPrevious={() => {
        previousStep();
        router.back();
      }}
      onNext={() => {
        nextStep();
        router.push('/(onboarding)/step3');
      }}
      onSkip={handleSkip}
      title="Partagez vos découvertes"
      subtitle="Publiez, inspirez, échangez et faites grandir une communauté passionnée par le Cameroun."
    >
      <View className="mx-4 flex-1 overflow-hidden rounded-[28px] bg-[#DBEAFE]">
        <Image
          source="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200"
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={500}
        />
        <LinearGradient colors={['rgba(0,0,0,0.12)', 'transparent', 'rgba(0,0,0,0.5)']} className="absolute inset-0" />
        <View className="absolute left-4 top-4 flex-row items-center rounded-full bg-black/35 py-2 pl-2 pr-4">
          <Avatar uri="https://i.pravatar.cc/150?img=47" displayName="Sarah M." size={34} />
          <View className="ml-2">
            <Text className="text-xs font-bold text-white">Sarah M.</Text>
            <Text className="text-[10px] text-white/75">Kribi · il y a 2 h</Text>
          </View>
        </View>
        <View className="absolute bottom-5 right-4 items-center gap-4">
          <SocialMetric icon="heart" value="12,5K" />
          <SocialMetric icon="chatbubble" value="487" />
          <SocialMetric icon="paper-plane" value="302" />
          <SocialMetric icon="bookmark" value="" />
        </View>
        <View className="absolute bottom-5 left-5 right-20">
          <Text className="text-sm font-bold text-white">Un week-end inoubliable à Kribi 🌊</Text>
          <Text className="mt-1 text-xs leading-5 text-white/80">Découvrez, filmez et partagez les plus beaux endroits de votre pays.</Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}

function SocialMetric({ icon, value }: { icon: string; value: string }) {
  return (
    <View className="items-center">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-black/35">
        <Icon name={icon} size={20} color="#FFFFFF" />
      </View>
      {value ? <Text className="mt-1 text-[10px] font-semibold text-white">{value}</Text> : null}
    </View>
  );
}
