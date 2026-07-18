import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/features/auth/auth.store';
import { useOnboardingStore } from '@/features/onboarding/onboarding.store';

type AccountType = 'explorer' | 'developer';

export default function AccountTypeScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { setAccountType, completeOnboarding, setCurrentStep } = useOnboardingStore();
  const [submittingType, setSubmittingType] = useState<AccountType | null>(null);

  useEffect(() => setCurrentStep(4), [setCurrentStep]);

  const selectAccountType = async (type: AccountType) => {
    if (submittingType) return;
    setSubmittingType(type);
    setAccountType(type);
    await completeOnboarding();
    router.replace(isAuthenticated ? '/interests' : '/(auth)/login');
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(onboarding)/step3');
  };

  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="h-14 flex-row items-center px-5">
          <TouchableOpacity onPress={goBack} className="h-10 w-10 items-center justify-center rounded-full bg-white">
            <Icon name="chevron-back" size={24} color="#18181B" />
          </TouchableOpacity>
          <View className="ml-3 h-1.5 flex-1 overflow-hidden rounded-full bg-[#E4E4E7]">
            <View className="h-full w-full rounded-full bg-[#EF4444]" />
          </View>
          <Text className="ml-3 text-xs font-semibold text-[#71717A]">4/4</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <View className="mb-6 mt-5 items-center px-4">
            <Text className="text-center text-[28px] font-extrabold leading-8 text-[#18181B]">
              Choisissez votre{`\n`}expérience Yeyamo
            </Text>
            <Text className="mt-3 text-center text-sm leading-5 text-[#71717A]">
              Deux façons de profiter de tout ce que notre communauté vous offre.
            </Text>
          </View>

          <AccountChoiceCard
            type="explorer"
            title="Explorer Yeyamo"
            subtitle="Découvrez des lieux, rejoignez des activités et partagez vos expériences."
            icon="compass-outline"
            colors={['#FFF1F2', '#FFE4E6']}
            accent="#EF4444"
            isLoading={submittingType === 'explorer'}
            disabled={Boolean(submittingType)}
            onPress={() => selectAccountType('explorer')}
          />

          <AccountChoiceCard
            type="developer"
            title="Développer mon activité"
            subtitle="Présentez votre établissement, publiez du contenu et trouvez de nouveaux clients."
            icon="business-outline"
            colors={['#EFF6FF', '#DBEAFE']}
            accent="#2563EB"
            isLoading={submittingType === 'developer'}
            disabled={Boolean(submittingType)}
            onPress={() => selectAccountType('developer')}
          />

          <Text className="mt-5 text-center text-xs leading-5 text-[#A1A1AA]">
            Vous pourrez modifier votre type de compte plus tard dans les paramètres.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function AccountChoiceCard({
  title,
  subtitle,
  icon,
  colors,
  accent,
  isLoading,
  disabled,
  onPress,
}: {
  type: AccountType;
  title: string;
  subtitle: string;
  icon: string;
  colors: readonly [string, string];
  accent: string;
  isLoading: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85} className="mb-4 overflow-hidden rounded-[26px] border border-white">
      <LinearGradient colors={colors} className="min-h-52 p-5">
        <View className="flex-row items-start justify-between">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/80">
            <Icon name={icon} size={28} color={accent} />
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: accent }}>
            {isLoading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Icon name="arrow-forward" size={20} color="#FFFFFF" />}
          </View>
        </View>
        <View className="mt-auto pt-8">
          <Text className="text-xl font-extrabold" style={{ color: accent }}>{title}</Text>
          <Text className="mt-2 max-w-[86%] text-sm leading-5 text-[#52525B]">{subtitle}</Text>
          <View className="mt-4 flex-row items-center gap-4">
            <MiniBenefit icon="checkmark-circle" label="Profil personnalisé" color={accent} />
            <MiniBenefit icon="sparkles" label="Contenu adapté" color={accent} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function MiniBenefit({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <View className="flex-row items-center">
      <Icon name={icon} size={14} color={color} />
      <Text className="ml-1 text-[10px] font-medium text-[#71717A]">{label}</Text>
    </View>
  );
}
