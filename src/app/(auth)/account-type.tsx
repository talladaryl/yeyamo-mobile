import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

export default function AuthAccountTypeScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);

  return (
    <SafeScreen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerClassName="flex-grow px-5 py-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.elevated }}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>Nouveau compte</Text>
        </View>

        <View className="mb-7">
          <Text className="mb-3 text-3xl font-bold leading-9" style={{ color: colors.text }}>
            Quel type de compte voulez-vous créer ?
          </Text>
          <Text className="text-base leading-6" style={{ color: colors.textSecondary }}>
            Choisissez le parcours adapté. Explorateur pour découvrir et partager, Partenaire pour présenter une activité.
          </Text>
        </View>

        <View className="gap-4">
          <ChoiceCard
            title="Compte explorateur"
            subtitle="Pour découvrir des lieux, publier des expériences, suivre des tendances et discuter avec la communauté."
            icon="map-outline"
            accent="#EF4444"
            benefits={['Feed découverte', 'Favoris et collections', 'Messages et interactions']}
            onPress={() => router.push('/(auth)/register')}
          />

          <ChoiceCard
            title="Compte partenaire"
            subtitle="Pour inscrire un établissement, ajouter des médias, publier des offres et gérer votre présence."
            icon="business-outline"
            accent="#7C3AED"
            benefits={['Formulaire partenaire complet', 'Documents et galerie', 'Dashboard professionnel']}
            onPress={() => router.push('/(auth)/register-partner-multistep')}
          />
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

function ChoiceCard({
  title,
  subtitle,
  icon,
  accent,
  benefits,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  benefits: string[];
  onPress: () => void;
}) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-2xl border p-5"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
      activeOpacity={0.85}
    >
      <View className="flex-row gap-4">
        <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: `${accent}22` }}>
          <Icon name={icon} size={28} color={accent} />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold" style={{ color: colors.text }}>{title}</Text>
          <Text className="mt-2 text-sm leading-5" style={{ color: colors.textSecondary }}>{subtitle}</Text>
        </View>
      </View>

      <View className="gap-2 mt-5">
        {benefits.map((benefit) => (
          <View key={benefit} className="flex-row items-center gap-2">
            <Icon name="checkmark-circle" size={15} color="#22C55E" />
            <Text className="flex-1 text-xs" style={{ color: colors.textSecondary }}>{benefit}</Text>
          </View>
        ))}
      </View>

      <View className="mt-5 flex-row items-center justify-between border-t pt-4" style={{ borderColor: colors.border }}>
        <Text className="text-xs" style={{ color: colors.textSecondary }}>Continuer</Text>
        <Icon name="arrow-forward" size={18} color={accent} />
      </View>
    </TouchableOpacity>
  );
}
