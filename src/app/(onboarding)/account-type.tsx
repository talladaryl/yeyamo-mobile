import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/features/auth/auth.store';
import { authService } from '@/features/auth/auth.service';
import { useOnboardingStore } from '@/features/onboarding/onboarding.store';
import { useThemeStore } from '@/features/theme/theme.store';

type AccountType = 'explorer' | 'developer';

export default function AccountTypeScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { hasCompletedLaunchFlow, setAccountType, completeOnboarding, setCurrentStep } = useOnboardingStore();
  const [submittingType, setSubmittingType] = useState<AccountType | null>(null);

  useEffect(() => setCurrentStep(4), [setCurrentStep]);

  useEffect(() => {
    if (hasCompletedLaunchFlow && !submittingType) {
      router.replace(isAuthenticated ? '/(tabs)' : '/(auth)/login');
    }
  }, [hasCompletedLaunchFlow, isAuthenticated, router, submittingType]);

  const selectAccountType = async (type: AccountType) => {
    if (submittingType) return;
    setSubmittingType(type);

    // A demo session can still be persisted when the launch onboarding is
    // shown again. Clear it before starting a new account journey so the root
    // navigator cannot redirect both choices to the partner dashboard.
    if (isAuthenticated) {
      await authService.logout();
    }

    setAccountType(type);
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(onboarding)/step3');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="h-14 flex-row items-center px-5">
          <TouchableOpacity onPress={goBack} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.card }}>
            <Icon name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View className="ml-3 h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: colors.border }}>
            <View className="h-full w-full rounded-full bg-[#EF4444]" />
          </View>
          <Text className="ml-3 text-xs font-semibold" style={{ color: colors.textMuted }}>4/4</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 40 }}>
          <View className="mb-7 mt-5 items-center px-5">
            <Text className="text-center text-[28px] font-extrabold leading-8" style={{ color: colors.text }}>
              Choisissez votre{`\n`}expérience Yeyamo
            </Text>
            <Text className="mt-3 text-center text-sm leading-5" style={{ color: colors.textSecondary }}>
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
            benefits={['Découvrir des lieux uniques', 'Partager avec la communauté']}
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
            benefits={['Présenter votre établissement', 'Piloter votre activité']}
            isLoading={submittingType === 'developer'}
            disabled={Boolean(submittingType)}
            onPress={() => selectAccountType('developer')}
          />

          <Text className="mt-5 text-center text-xs leading-5" style={{ color: colors.textSecondary }}>
            Vous pourrez modifier votre type de compte plus tard dans les paramètres.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function AccountChoiceCard({
  type,
  title,
  subtitle,
  icon,
  colors,
  accent,
  benefits,
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
  benefits: [string, string];
  isLoading: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const theme = useThemeStore();
  const isExplorer = type === 'explorer';
  const gradientColors: readonly [string, string] = theme.resolvedTheme === 'dark'
    ? isExplorer ? ['#211316', '#171719'] : ['#111D32', '#171719']
    : colors;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.88}
      className="mb-4 overflow-hidden rounded-[28px] border"
      style={{
        borderColor: `${accent}55`,
        shadowColor: accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: theme.resolvedTheme === 'dark' ? 0.16 : 0.12,
        shadowRadius: 18,
        elevation: 4,
      }}
    >
      <LinearGradient colors={gradientColors} className="min-h-64 p-6">
        <View className="absolute -right-10 -top-12 h-40 w-40 rounded-full" style={{ backgroundColor: `${accent}12` }} />
        <View className="absolute -bottom-16 right-12 h-32 w-32 rounded-full" style={{ backgroundColor: `${accent}0D` }} />
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-16 w-16 items-center justify-center rounded-[22px] border" style={{ backgroundColor: theme.colors.card, borderColor: `${accent}35` }}>
              <Icon name={icon} size={31} color={accent} />
            </View>
            <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: `${accent}18` }}>
              <Text className="text-[11px] font-bold uppercase tracking-wide" style={{ color: accent }}>
                {isExplorer ? 'Pour découvrir' : 'Pour les pros'}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-7 px-1">
          <Text className="text-[22px] font-extrabold" style={{ color: theme.colors.text }}>{title}</Text>
          <Text className="mt-3 pr-3 text-sm leading-6" style={{ color: theme.colors.textSecondary }}>{subtitle}</Text>
          <View className="mt-5 gap-3">
            {benefits.map((benefit) => (
              <MiniBenefit key={benefit} icon="checkmark-circle" label={benefit} color={accent} />
            ))}
          </View>
          <View className="mt-6 flex-row items-center justify-between border-t pt-5" style={{ borderColor: `${accent}28` }}>
            <Text className="text-sm font-bold" style={{ color: accent }}>Choisir ce parcours</Text>
            <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: accent }}>
              {isLoading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Icon name="arrow-forward" size={20} color="#FFFFFF" />}
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function MiniBenefit({ icon, label, color }: { icon: string; label: string; color: string }) {
  const textColor = useThemeStore((state) => state.colors.textMuted);
  return (
    <View className="flex-row items-center">
      <Icon name={icon} size={16} color={color} />
      <Text className="ml-2 text-xs font-medium" style={{ color: textColor }}>{label}</Text>
    </View>
  );
}
