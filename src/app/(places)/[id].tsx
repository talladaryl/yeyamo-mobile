import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import { InfoItem } from '@/components/ui/InfoItem';
import { CTAButton } from '@/components/ui/CTAButton';
import { mockPlaces } from '@/features/places/mockData';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  // Pour la démo, on prend le premier lieu
  const place = mockPlaces[0];

  if (!place) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center px-6">
        <Text className="text-[#EF4444] text-center">Lieu introuvable.</Text>
      </View>
    );
  }

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
                <Icon library="ionicons" name={place.is_saved ? 'bookmark' : 'bookmark-outline'} size={22} color="#FFFFFF" />
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
        <View className="relative">
          {place.cover_image_url ? (
            <Image
              source={{ uri: place.cover_image_url }}
              style={{ width: '100%', height: 400 }}
              contentFit="cover"
            />
          ) : (
            <View className="w-full h-96 bg-[#161616] items-center justify-center">
              <Icon library="ionicons" name="location" size={64} color="#52525B" />
            </View>
          )}
          
          {/* Image counter overlay */}
          <View className="absolute bottom-4 right-4 bg-black/70 px-3 py-1.5 rounded-full">
            <Text className="text-white text-sm font-medium">1/18</Text>
          </View>
        </View>

        {/* Place Info */}
        <View className="px-4 pt-5">
          {/* Title & Rating */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1 pr-3">
              <Text className="text-white text-2xl font-bold mb-1">{place.name}</Text>
              <View className="flex-row items-center gap-1">
                <Icon library="ionicons" name="star" size={16} color="#F59E0B" />
                <Text className="text-white text-sm font-medium">
                  {place.rating?.toFixed(1)}
                </Text>
                <Text className="text-[#A1A1AA] text-sm">({place.reviews_count} avis)</Text>
              </View>
            </View>
            
            <TouchableOpacity className="bg-[#EF4444] w-10 h-10 rounded-full items-center justify-center">
              <Icon library="ionicons" name="location" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* À propos */}
          <View className="mb-5">
            <Text className="text-white text-lg font-bold mb-3">À propos</Text>
            <Text className="text-white text-sm leading-6">
              {place.description}
            </Text>
            <TouchableOpacity className="mt-2">
              <Text className="text-[#EF4444] text-sm font-semibold">Voir plus</Text>
            </TouchableOpacity>
          </View>

          {/* Équipements */}
          {place.equipment && place.equipment.length > 0 && (
            <View className="mb-5">
              <Text className="text-white text-lg font-bold mb-4">Équipements</Text>
              <View className="flex-row flex-wrap">
                {place.equipment.map((item) => (
                  <View key={item.id} className="w-1/4 items-center mb-4">
                    <View className="w-14 h-14 bg-[#161616] rounded-2xl items-center justify-center mb-2">
                      <Icon 
                        library={item.iconLibrary} 
                        name={item.icon} 
                        size={24} 
                        color="#EF4444" 
                      />
                    </View>
                    <Text className="text-white text-xs text-center">{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Objectif Section */}
          <View className="border-t border-[#27272A] pt-5 mb-5">
            <Text className="text-white text-lg font-bold mb-3">OBJECTIF</Text>
            <Text className="text-white text-sm leading-6 mb-2">
              Proposer toutes les informations d'un lieu
            </Text>
            <Text className="text-white text-sm leading-6 mb-3">
              Pour aider l'utilisateur à décider.
            </Text>
            
            <Text className="text-white text-sm font-semibold mb-2">LIENS SUIVANTS :</Text>
            <View className="space-y-1">
              <Text className="text-[#A1A1AA] text-sm">• Carte (détails lieux)</Text>
              <Text className="text-[#A1A1AA] text-sm">• Photos / Gallerie</Text>
              <Text className="text-[#A1A1AA] text-sm">• Avis utilisateurs</Text>
              <Text className="text-[#A1A1AA] text-sm">• Tarifs détaillés</Text>
              <Text className="text-[#A1A1AA] text-sm">• Réservation</Text>
              <Text className="text-[#A1A1AA] text-sm">• Événements associés</Text>
            </View>
          </View>

          {/* Links Variants */}
          <View className="border-t border-[#27272A] pt-5 mb-5">
            <Text className="text-white text-lg font-bold mb-3">LIENS SUIVANTS</Text>
            <View className="space-y-1">
              <Text className="text-[#A1A1AA] text-sm">Détail événement : Sws, Événements, Lieux</Text>
              <Text className="text-[#A1A1AA] text-sm">Réservation : Avis, Llieux (Prix)</Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#27272A] px-4 py-4">
        <CTAButton
          title="Réserver"
          variant="primary"
          onPress={() => console.log('Book place')}
        />
        <View className="flex-row items-center justify-center mt-3 gap-4">
          <Text className="text-[#A1A1AA] text-sm">
            À partir de <Text className="text-white font-bold">{place.price_from?.toLocaleString()} {place.currency}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
