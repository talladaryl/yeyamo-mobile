import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';

export default function AuthAccountTypeScreen() {
  const router = useRouter();

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
            className="w-10 h-10 rounded-full bg-[#161616] items-center justify-center"
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-[#A1A1AA] text-sm">Nouveau compte</Text>
        </View>

        <View className="mb-7">
          <Text className="text-white text-3xl font-bold leading-9 mb-3">
            Quel type de compte voulez-vous créer ?
          </Text>
          <Text className="text-[#A1A1AA] text-base leading-6">
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
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#161616] border border-[#27272A] rounded-2xl p-5"
      activeOpacity={0.85}
    >
      <View className="flex-row gap-4">
        <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: `${accent}22` }}>
          <Icon name={icon} size={28} color={accent} />
        </View>
        <View className="flex-1">
          <Text className="text-white text-xl font-bold">{title}</Text>
          <Text className="text-[#A1A1AA] text-sm leading-5 mt-2">{subtitle}</Text>
        </View>
      </View>

      <View className="gap-2 mt-5">
        {benefits.map((benefit) => (
          <View key={benefit} className="flex-row items-center gap-2">
            <Icon name="checkmark-circle" size={15} color="#22C55E" />
            <Text className="text-[#D4D4D8] text-xs flex-1">{benefit}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row items-center justify-between mt-5 pt-4 border-t border-[#27272A]">
        <Text className="text-[#A1A1AA] text-xs">Continuer</Text>
        <Icon name="arrow-forward" size={18} color={accent} />
      </View>
    </TouchableOpacity>
  );
}
