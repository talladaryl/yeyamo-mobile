import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/features/onboarding/onboarding.store';
import { Icon } from '@/components/ui/Icon';

type AccountType = 'explorer' | 'developer';

export default function AccountTypeScreen() {
  const router = useRouter();
  const { selectedAccountType, setAccountType, completeOnboarding, setCurrentStep } = useOnboardingStore();

  const handleAccountTypeSelect = async (type: AccountType) => {
    setAccountType(type);
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  React.useEffect(() => {
    setCurrentStep(4);
  }, []);

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-5 py-3">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#161616] items-center justify-center"
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-[#A1A1AA] text-sm">Étape 4/4</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 pt-4 pb-8"
        >
          <View className="mb-7">
            <Text className="text-white text-3xl font-bold leading-9 mb-3">
              Choisissez votre profil
            </Text>
            <Text className="text-[#A1A1AA] text-base leading-6">
              Nous adaptons l'expérience selon votre objectif. Vous pourrez toujours modifier ce choix plus tard.
            </Text>
          </View>

          <View className="gap-4">
            <AccountChoiceCard
              title="Explorateur"
              subtitle="Découvrir des lieux, suivre des tendances, enregistrer des favoris et partager vos expériences."
              icon="map-outline"
              accent="#EF4444"
              selected={selectedAccountType === 'explorer'}
              benefits={['Feed découverte', 'Favoris et collections', 'Messages et communauté']}
              onPress={() => handleAccountTypeSelect('explorer')}
            />

            <AccountChoiceCard
              title="Partenaire"
              subtitle="Présenter votre établissement, publier du contenu et accéder aux outils de gestion."
              icon="business-outline"
              accent="#7C3AED"
              selected={selectedAccountType === 'developer'}
              benefits={['Profil professionnel', 'Tableau de bord', 'Lieux, événements et statistiques']}
              onPress={() => handleAccountTypeSelect('developer')}
            />
          </View>

          <Text className="text-[#71717A] text-xs leading-5 text-center mt-6">
            Ce choix sert uniquement à préparer l'expérience frontend. Aucune donnée backend n'est encore envoyée.
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
  accent,
  selected,
  benefits,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  selected: boolean;
  benefits: string[];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-2xl p-5 border ${selected ? 'bg-[#1F1F1F]' : 'bg-[#161616]'}`}
      style={{ borderColor: selected ? accent : '#27272A' }}
      activeOpacity={0.85}
    >
      <View className="flex-row items-start gap-4">
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center"
          style={{ backgroundColor: `${accent}22` }}
        >
          <Icon name={icon} size={28} color={accent} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-white text-xl font-bold">{title}</Text>
            <View
              className="w-6 h-6 rounded-full border items-center justify-center"
              style={{ borderColor: selected ? accent : '#52525B' }}
            >
              {selected ? <Icon name="checkmark" size={14} color={accent} /> : null}
            </View>
          </View>

          <Text className="text-[#A1A1AA] text-sm leading-5 mt-2">{subtitle}</Text>

          <View className="gap-2 mt-4">
            {benefits.map((benefit) => (
              <View key={benefit} className="flex-row items-center gap-2">
                <Icon name="checkmark-circle" size={15} color="#22C55E" />
                <Text className="text-[#D4D4D8] text-xs flex-1">{benefit}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-5 pt-4 border-t border-[#27272A]">
        <Text className="text-[#A1A1AA] text-xs">
          Continuer comme {title.toLowerCase()}
        </Text>
        <Icon name="arrow-forward" size={18} color={accent} />
      </View>
    </TouchableOpacity>
  );
}
