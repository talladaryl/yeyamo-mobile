import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { CreationOptionCard } from '@/components/create/CreationOptionCard';
import type { CreationOption } from '@/features/create/types';

const creationOptions: CreationOption[] = [
  {
    id: 'publication',
    title: 'Créer une publication',
    description: 'Partagez une photo, une vidéo ou un texte',
    icon: 'phone-portrait',
    iconLibrary: 'ionicons',
    color: '#EF4444',
  },
  {
    id: 'story',
    title: 'Créer une story',
    description: 'Partagez un moment qui disparaît après 24h',
    icon: 'book',
    iconLibrary: 'ionicons',
    color: '#F59E0B',
  },
  {
    id: 'event',
    title: 'Créer une sortie',
    description: 'Invitez la communauté à une activité',
    icon: 'calendar',
    iconLibrary: 'ionicons',
    color: '#10B981',
  },
  {
    id: 'place',
    title: 'Suggérer un lieu',
    description: 'Proposez un lieu à découvrir sur Yeyamo',
    icon: 'location',
    iconLibrary: 'ionicons',
    color: '#3B82F6',
  },
];

export default function CreateChoiceScreen() {
  const router = useRouter();

  const handleOptionPress = (optionId: string) => {
    switch (optionId) {
      case 'publication':
        router.push('/(create)/publication');
        break;
      case 'story':
        router.push('/(create)/story');
        break;
      case 'event':
        router.push('/(create)/event');
        break;
      case 'place':
        router.push('/(create)/suggest-place-step1');
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
          headerTitle: '',
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
            Que souhaitez-vous partager aujourd'hui ?
          </Text>
        </View>

        {/* Options */}
        <View className="pb-6">
          {creationOptions.map((option) => (
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
