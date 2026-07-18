import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { CreationOptionCard } from '@/components/create/CreationOptionCard';
import type { PartnerCreationOption } from '@/features/partner/types';

const partnerCreationOptions: PartnerCreationOption[] = [
  {
    id: 'publication',
    title: 'Créer une publication',
    description: 'Partagez une photo, vidéo ou texte avec vos clients',
    icon: 'phone-portrait',
    iconLibrary: 'ionicons',
    color: '#EF4444',
  },
  {
    id: 'story',
    title: 'Créer une story',
    description: 'Partagez un moment éphémère avec votre audience',
    icon: 'book',
    iconLibrary: 'ionicons',
    color: '#F59E0B',
  },
  {
    id: 'place',
    title: 'Ajouter un lieu',
    description: 'Ajoutez un nouvel établissement pour votre activité',
    icon: 'business',
    iconLibrary: 'ionicons',
    color: '#10B981',
  },
  {
    id: 'event',
    title: 'Ajouter un événement',
    description: 'Annoncez un événement pour attirer plus de monde',
    icon: 'calendar',
    iconLibrary: 'ionicons',
    color: '#3B82F6',
  },
  {
    id: 'offer',
    title: 'Créer une offre',
    description: 'Proposez une offre ou un package spécial',
    icon: 'gift',
    iconLibrary: 'ionicons',
    color: '#8B5CF6',
  },
];

export default function PartnerChoiceScreen() {
  const router = useRouter();

  const handleOptionPress = (optionId: string) => {
    switch (optionId) {
      case 'publication':
        router.push('/(partner)/publication');
        break;
      case 'story':
        router.push('/(partner)/story');
        break;
      case 'place':
        router.push('/(partner)/add-place-step1');
        break;
      case 'event':
        router.push('/(partner)/add-event-step1');
        break;
      case 'offer':
        // TODO: Implement offer creation
        console.log('Offer creation coming soon');
        break;
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          presentation: 'modal',
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Créer',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => null,
        }}
      />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="pt-4 pb-6">
          <Text className="text-[#18181B] dark:text-white text-2xl font-bold mb-2">
            Bonjour
          </Text>
          <Text className="text-[#18181B] dark:text-white text-2xl font-bold">
            Que souhaitez-vous créer aujourd'hui ?
          </Text>
        </View>

        {/* Options */}
        <View className="pb-6">
          {partnerCreationOptions.map((option) => (
            <CreationOptionCard
              key={option.id}
              option={option}
              onPress={() => handleOptionPress(option.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Close Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute bottom-8 left-1/2 -ml-6 w-12 h-12 bg-[#F4F4F5] dark:bg-[#27272A] rounded-full items-center justify-center"
        activeOpacity={0.7}
      >
        <Icon library="ionicons" name="close" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
