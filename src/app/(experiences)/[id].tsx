import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui/Icon';
import { InfoItem } from '@/components/ui/InfoItem';
import { CTAButton } from '@/components/ui/CTAButton';
import { mockExperiences } from '@/features/experiences/mockData';

export default function ExperienceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  // Pour la démo, on prend la première expérience
  const experience = mockExperiences[0];

  if (!experience) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center px-6">
        <Text className="text-[#EF4444] text-center">Expérience introuvable.</Text>
      </View>
    );
  }

  const difficultyColor = {
    facile: '#10B981',
    modérée: '#F59E0B',
    difficile: '#EF4444',
  };

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
                <Icon library="ionicons" name={experience.is_saved ? 'bookmark' : 'bookmark-outline'} size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity className="bg-black/60 w-10 h-10 rounded-full items-center justify-center">
                <Icon library="ionicons" name="share-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image with Gradient Overlay */}
        <View className="relative">
          <Image
            source={{ uri: experience.cover_image_url }}
            style={{ width: '100%', height: 500 }}
            contentFit="cover"
          />
          
          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(10, 10, 10, 0.9)']}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 200,
            }}
          />

          {/* Title overlay at bottom */}
          <View className="absolute bottom-0 left-0 right-0 px-4 pb-6">
            <View className="flex-row items-center justify-between mb-3">
              <View 
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: difficultyColor[experience.difficulty] }}
              >
                <Text className="text-white text-xs font-semibold capitalize">
                  {experience.availability === 'available' ? 'Disponible' : 'Limité'}
                </Text>
              </View>
              
              <View className="bg-black/60 px-3 py-1.5 rounded-full">
                <Text className="text-white text-sm font-medium">1/18</Text>
              </View>
            </View>

            <Text className="text-white text-3xl font-bold mb-2">
              {experience.title}
            </Text>
            <Text className="text-white text-base">{experience.location}</Text>
          </View>
        </View>

        {/* Info Cards */}
        <View className="px-4 py-6">
          <View className="flex-row justify-between mb-6">
            <InfoItem
              icon="time-outline"
              label="Durée"
              value={experience.duration_days ? `${experience.duration_days} jours` : `${experience.duration_hours}h`}
            />
            <InfoItem
              icon="analytics-outline"
              label="Difficulté"
              value={experience.difficulty.charAt(0).toUpperCase() + experience.difficulty.slice(1)}
            />
            <InfoItem
              icon="people-outline"
              label="Groupe"
              value={`${experience.group_size_min}-${experience.group_size_max} pers`}
            />
            <InfoItem
              icon="language-outline"
              label="Langues"
              value={experience.languages.length > 1 ? `${experience.languages.length} langues` : experience.languages[0]}
            />
          </View>

          {/* À propos */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-3">À propos</Text>
            <Text className="text-white text-sm leading-6">
              {experience.description}
            </Text>
          </View>

          {/* Inclus */}
          {experience.included_items.length > 0 && (
            <View className="mb-6">
              <Text className="text-white text-lg font-bold mb-4">Inclus</Text>
              <View className="flex-row flex-wrap">
                {experience.included_items.map((item) => (
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

          {/* Équipement fourni */}
          {experience.equipment_provided.length > 0 && (
            <View className="mb-6">
              <Text className="text-white text-lg font-bold mb-3">Équipement fourni</Text>
              <View className="space-y-2">
                {experience.equipment_provided.map((item, index) => (
                  <View key={index} className="flex-row items-center gap-2">
                    <Icon library="ionicons" name="checkmark-circle" size={18} color="#10B981" />
                    <Text className="text-white text-sm">{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Objectif Section */}
          <View className="border-t border-[#27272A] pt-6 mb-5">
            <Text className="text-white text-lg font-bold mb-3">OBJECTIF</Text>
            <Text className="text-white text-sm leading-6 mb-3">
              Informer en détail et permettre la réservation de l'expérience rapide.
            </Text>
            
            <Text className="text-white text-sm font-semibold mb-2">LIENS SUIVANTS :</Text>
            <View className="space-y-1">
              <Text className="text-[#A1A1AA] text-sm">• Durée / Difficulté / Groupe / Langue</Text>
              <Text className="text-[#A1A1AA] text-sm">• Détails (durée, groupe, etc.)</Text>
              <Text className="text-[#A1A1AA] text-sm">• Photo / Gallery</Text>
              <Text className="text-[#A1A1AA] text-sm">• Inclus / Non inclus</Text>
              <Text className="text-[#A1A1AA] text-sm">• Itinéraire / Plan d'accès</Text>
              <Text className="text-[#A1A1AA] text-sm">• Avis / Témoignages</Text>
              <Text className="text-[#A1A1AA] text-sm">• Prix de location / Réserver</Text>
            </View>
          </View>

          {/* Links Variants */}
          <View className="border-t border-[#27272A] pt-6 mb-5">
            <Text className="text-white text-lg font-bold mb-3">LIENS SUIVANTS</Text>
            <View className="space-y-1">
              <Text className="text-[#A1A1AA] text-sm">Réservation : Avis, Llieux (Prix)</Text>
              <Text className="text-[#A1A1AA] text-sm">Partenaire / Partager / Réserver</Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-28" />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#27272A] px-4 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-[#A1A1AA] text-xs">À partir de</Text>
            <Text className="text-white text-xl font-bold">
              {experience.price_from.toLocaleString()} {experience.currency}
            </Text>
          </View>
          <CTAButton
            title="Réserver"
            variant="primary"
            onPress={() => console.log('Book experience')}
            style={{ flex: 1, marginLeft: 16 }}
          />
        </View>
      </View>
    </View>
  );
}
