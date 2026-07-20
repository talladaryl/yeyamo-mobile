import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { CreationOptionCard } from '@/components/create/CreationOptionCard';
import { useAuth } from '@/features/auth/useAuth';
import { useThemeStore } from '@/features/theme/theme.store';
import type { PartnerCreationOption, PartnerCreationType } from '@/features/partner/types';

const OPTIONS: PartnerCreationOption[] = [
  { id: 'publication', title: 'Créer une publication', description: 'Partagez une photo, une vidéo ou un carrousel', icon: 'images-outline', iconLibrary: 'ionicons', color: '#E60012' },
  { id: 'story', title: 'Créer une story', description: 'Publiez un moment éphémère visible pendant 24 h', icon: 'radio-button-on-outline', iconLibrary: 'ionicons', color: '#2563EB' },
  { id: 'place', title: 'Ajouter un lieu', description: 'Référencez votre établissement ou un nouveau lieu', icon: 'location-outline', iconLibrary: 'ionicons', color: '#E60012' },
  { id: 'event', title: 'Ajouter un événement', description: 'Annoncez une activité et gérez ses informations', icon: 'calendar-outline', iconLibrary: 'ionicons', color: '#F59E0B' },
  { id: 'offer', title: 'Créer une offre', description: 'Mettez en avant une promotion ou un package spécial', icon: 'pricetag-outline', iconLibrary: 'ionicons', color: '#16A34A' },
];

export default function PartnerChoiceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colors = useThemeStore((state) => state.colors);

  const open = (id: PartnerCreationType) => {
    const routes = {
      publication: '/(partner)/publication',
      story: '/(partner)/story',
      place: '/(partner)/add-place-step1',
      event: '/(partner)/add-event-step1',
      offer: '/(partner)/offer',
    } as const;
    router.push(routes[id]);
  };

  return (
    <SafeScreen>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <View className="rounded-full bg-[#FEE2E2] px-3 py-1.5"><Text className="text-xs font-extrabold text-[#E60012]">ESPACE PARTENAIRE</Text></View>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }} accessibilityLabel="Fermer">
          <Icon name="close" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
        <View className="pb-6 pt-3">
          <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Bonjour {user?.display_name?.split(' ')[0] ?? 'partenaire'} 👋</Text>
          <Text className="mt-2 text-3xl font-extrabold leading-9" style={{ color: colors.text }}>Que souhaitez-vous créer aujourd’hui ?</Text>
          <Text className="mt-2 text-sm leading-5" style={{ color: colors.textSecondary }}>Développez votre activité et faites rayonner vos offres sur Yeyamo.</Text>
        </View>
        {OPTIONS.map((option) => <CreationOptionCard key={option.id} option={option} onPress={() => open(option.id)} />)}
        <View className="mt-2 flex-row rounded-2xl bg-[#FEE2E2] p-4">
          <Icon name="shield-checkmark-outline" size={22} color="#E60012" />
          <Text className="ml-3 flex-1 text-xs leading-5 text-[#991B1B]">Les lieux, événements et offres sont vérifiés avant leur publication afin de protéger la communauté.</Text>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
