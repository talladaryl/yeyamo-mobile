import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { CreationOptionCard } from '@/components/create/CreationOptionCard';
import { useAuthStore } from '@/features/auth/auth.store';
import { useCountryFeature } from '@/features/country/country.hooks';
import type { CreationOption } from '@/features/create/types';

const commonOptions: CreationOption[] = [
  { id: 'publication', title: 'Créer une publication', description: 'Partagez une photo, une vidéo ou un texte', icon: 'phone-portrait', iconLibrary: 'ionicons', color: '#EF4444' },
  { id: 'story', title: 'Créer une story', description: 'Partagez un moment qui disparaît après 24h', icon: 'book', iconLibrary: 'ionicons', color: '#F59E0B' },
  { id: 'event', title: 'Créer une sortie', description: 'Invitez la communauté à une activité', icon: 'calendar', iconLibrary: 'ionicons', color: '#10B981' },
  { id: 'place', title: 'Suggérer un lieu', description: 'Proposez un lieu à découvrir sur Yeyamo', icon: 'location', iconLibrary: 'ionicons', color: '#3B82F6' },
  { id: 'culture', title: 'Transmettre un savoir', description: 'Proposez un récit, une tradition ou une expression', icon: 'leaf', iconLibrary: 'ionicons', color: '#B45309' },
];
const artworkOption: CreationOption = { id: 'artwork', title: 'Ajouter une œuvre', description: 'Présentez une création de votre atelier', icon: 'color-palette', iconLibrary: 'ionicons', color: '#7C3AED' };

export default function CreateChoiceScreen() {
  const router = useRouter();
  const userType = useAuthStore((state) => state.user?.user_type);
  const cultureEnabled = useCountryFeature('cultureModuleEnabled');
  const commerceEnabled = useCountryFeature('artisanCommerceEnabled');
  const options = [...commonOptions.filter((option) => option.id !== 'culture' || cultureEnabled), ...(userType === 'partner' && commerceEnabled ? [artworkOption] : [])];
  const close = () => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)'); };
  const open = (id: CreationOption['id']) => {
    const routes: Partial<Record<CreationOption['id'], string>> = { publication: '/(create)/publication', story: '/(create)/story', event: '/(create)/event', place: '/(create)/suggest-place-step1', culture: '/(create)/culture-contribution', artwork: '/(create)/artwork/basic-information' };
    const route = routes[id]; if (route) router.push(route as never);
  };
  return <View className="flex-1 bg-white dark:bg-[#0A0A0A]"><Stack.Screen options={{ presentation: 'modal', headerShown: true, headerStyle: { backgroundColor: '#0A0A0A' }, headerTintColor: '#FFFFFF', headerTitle: '', headerLeft: () => null }} />
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}><View className="pt-4 pb-6"><Text className="mb-2 text-2xl font-bold text-[#18181B] dark:text-white">Bonjour</Text><Text className="text-2xl font-bold text-[#18181B] dark:text-white">Que souhaitez-vous partager aujourd’hui ?</Text></View><View className="pb-6">{options.map((option) => <CreationOptionCard key={option.id} option={option} onPress={() => open(option.id)} />)}</View></ScrollView>
    <TouchableOpacity onPress={close} className="absolute bottom-8 left-1/2 -ml-6 h-12 w-12 items-center justify-center rounded-full bg-[#F4F4F5] dark:bg-[#27272A]" activeOpacity={0.7}><Icon library="ionicons" name="close" size={24} color="#52525B" /></TouchableOpacity>
  </View>;
}
