import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import { InfoItem } from '@/components/ui/InfoItem';
import { CTAButton } from '@/components/ui/CTAButton';
import { mockEvents } from '@/features/events/mockData';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  // Pour la démo, on prend le premier événement
  const event = mockEvents[0];

  if (!event) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center px-6">
        <Text className="text-[#EF4444] text-center">Événement introuvable.</Text>
      </View>
    );
  }

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTransparent: true,
          headerTintColor: '#FFFFFF',
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              className="ml-4 bg-black/60 w-10 h-10 rounded-full items-center justify-center"
            >
              <Icon library="ionicons" name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View className="flex-row gap-3 mr-4">
              <TouchableOpacity className="bg-black/60 w-10 h-10 rounded-full items-center justify-center">
                <Icon library="ionicons" name={event.is_saved ? 'bookmark' : 'bookmark-outline'} size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity className="bg-black/60 w-10 h-10 rounded-full items-center justify-center">
                <Icon library="ionicons" name="share-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        {event.cover_image_url ? (
          <Image
            source={{ uri: event.cover_image_url }}
            style={{ width: '100%', height: 320 }}
            contentFit="cover"
          />
        ) : (
          <View className="w-full h-80 bg-[#161616] items-center justify-center">
            <Icon library="ionicons" name="calendar" size={64} color="#52525B" />
          </View>
        )}

        {/* Event Info Card */}
        <View className="px-4 pt-5">
          {/* Date Badge */}
          <View className="bg-[#EF4444] self-start px-4 py-2 rounded-lg mb-4">
            <Text className="text-white text-2xl font-bold">{startDate.getDate()}</Text>
            <Text className="text-white text-xs uppercase">{startDate.toLocaleDateString('fr-FR', { month: 'short' })}</Text>
          </View>

          {/* Title */}
          <Text className="text-white text-2xl font-bold mb-4">{event.title}</Text>

          {/* Event Details */}
          <View className="space-y-3 mb-5">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-[#161616] rounded-full items-center justify-center">
                <Icon library="ionicons" name="calendar-outline" size={18} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-sm">
                  {startDate.getDate()} - {endDate.getDate()} {endDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-[#161616] rounded-full items-center justify-center">
                <Icon library="ionicons" name="time-outline" size={18} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-sm">
                  {event.start_time} - {event.end_time}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-[#161616] rounded-full items-center justify-center">
                <Icon library="ionicons" name="location-outline" size={18} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-sm">{event.location}</Text>
              </View>
            </View>
          </View>

          {/* À propos */}
          <View className="mb-5">
            <Text className="text-white text-lg font-bold mb-3">À propos</Text>
            <Text className="text-white text-sm leading-6">
              {event.description}
            </Text>
          </View>

          {/* Programme */}
          {event.program && event.program.length > 0 && (
            <View className="mb-5">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white text-lg font-bold">Programme</Text>
                <TouchableOpacity>
                  <Text className="text-[#EF4444] text-sm font-semibold">Voir plus</Text>
                </TouchableOpacity>
              </View>
              
              <View className="space-y-3">
                {event.program.map((item, index) => (
                  <View key={index} className="bg-[#161616] rounded-xl p-4">
                    <Text className="text-white text-base font-semibold mb-1">{item.date}</Text>
                    <Text className="text-white text-sm mb-1">{item.title}</Text>
                    {item.description && (
                      <Text className="text-[#A1A1AA] text-xs">{item.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Objectif Section */}
          <View className="border-t border-[#27272A] pt-5 mb-5">
            <Text className="text-white text-lg font-bold mb-3">OBJECTIF</Text>
            <Text className="text-white text-sm leading-6 mb-3">
              Donner tous les détails d'un événement et permettre à l'utilisateur de réserver.
            </Text>
            
            <Text className="text-white text-sm font-semibold mb-2">LIENS SUIVANTS :</Text>
            <View className="space-y-1">
              <Text className="text-[#A1A1AA] text-sm">• Image couverture</Text>
              <Text className="text-[#A1A1AA] text-sm">• Titre, heure, lieu</Text>
              <Text className="text-[#A1A1AA] text-sm">• À propos / Description</Text>
              <Text className="text-[#A1A1AA] text-sm">• Programme / Activités</Text>
              <Text className="text-[#A1A1AA] text-sm">• Bouton participer / Réserver</Text>
            </View>
          </View>

          {/* Links Variants */}
          <View className="border-t border-[#27272A] pt-5 mb-5">
            <Text className="text-white text-lg font-bold mb-3">LIENS SUIVANTS</Text>
            <View className="space-y-1">
              <Text className="text-[#A1A1AA] text-sm">Détail événement : Partenaire, Lieu, Partager / Réserver</Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#27272A] px-4 py-4">
        <CTAButton
          title="Participer"
          variant="primary"
          onPress={() => console.log('Participate in event')}
        />
        <View className="flex-row items-center justify-center mt-2 gap-1">
          <Icon library="ionicons" name="people" size={16} color="#A1A1AA" />
          <Text className="text-[#A1A1AA] text-sm">
            {event.participants_count.toLocaleString()} participants
          </Text>
        </View>
      </View>
    </View>
  );
}
