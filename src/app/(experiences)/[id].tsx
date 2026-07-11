import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { mockExperiences } from '@/features/experiences/mockData';
import { useState } from 'react';

const { width } = Dimensions.get('window');

export default function ExperienceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  
  const experience = mockExperiences.find(e => e.id === Number(id)) || mockExperiences[0];

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
              className="ml-4 bg-black/50 w-10 h-10 rounded-full items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View className="flex-row gap-2 mr-4">
              <TouchableOpacity 
                onPress={() => setIsSaved(!isSaved)}
                className="bg-black/50 w-10 h-10 rounded-full items-center justify-center"
              >
                <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity className="bg-black/50 w-10 h-10 rounded-full items-center justify-center">
                <Ionicons name="share-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Image
          source={{ uri: experience.cover_image_url }}
          style={{ width, height: 240 }}
          contentFit="cover"
        />

        <View className="px-4">
          {/* Title & Category */}
          <Text className="text-white text-2xl font-bold mt-4 mb-2">{experience.title}</Text>
          <Text className="text-[#A1A1AA] text-sm mb-4">{experience.category} • {experience.location}</Text>

          {/* Rating */}
          <View className="flex-row items-center gap-1 mb-5">
            <Ionicons name="star" size={18} color="#F59E0B" />
            <Text className="text-white text-base font-semibold">{experience.rating?.toFixed(1)}</Text>
            <Text className="text-[#A1A1AA] text-sm">({experience.reviews_count} avis)</Text>
          </View>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap mb-5">
            <View className="w-1/2 mb-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="time-outline" size={20} color="#A1A1AA" />
                <View>
                  <Text className="text-[#A1A1AA] text-xs">Durée</Text>
                  <Text className="text-white text-sm font-semibold">{experience.duration_hours}h</Text>
                </View>
              </View>
            </View>

            <View className="w-1/2 mb-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="speedometer-outline" size={20} color="#A1A1AA" />
                <View>
                  <Text className="text-[#A1A1AA] text-xs">Niveau</Text>
                  <Text className="text-white text-sm font-semibold">{experience.difficulty_label || experience.difficulty}</Text>
                </View>
              </View>
            </View>

            <View className="w-1/2 mb-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="walk-outline" size={20} color="#A1A1AA" />
                <View>
                  <Text className="text-[#A1A1AA] text-xs">Distance</Text>
                  <Text className="text-white text-sm font-semibold">{experience.distance_km} km</Text>
                </View>
              </View>
            </View>

            <View className="w-1/2 mb-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="cash-outline" size={20} color="#A1A1AA" />
                <View>
                  <Text className="text-[#A1A1AA] text-xs">Dépôt requis</Text>
                  <Text className="text-white text-sm font-semibold">
                    {experience.required_deposit?.toLocaleString()} FCFA
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text className="text-white text-lg font-bold mb-3">À propos</Text>
            <Text className="text-[#A1A1AA] text-sm leading-6">{experience.description}</Text>
          </View>

          {/* Points forts */}
          {experience.highlights && experience.highlights.length > 0 && (
            <View className="mb-5">
              <Text className="text-white text-lg font-bold mb-3">Points forts</Text>
              {experience.highlights.map((highlight) => (
                <View key={highlight.id} className="flex-row items-start gap-2 mb-3">
                  <Ionicons name={highlight.icon as any} size={20} color="#10B981" />
                  <Text className="text-[#A1A1AA] text-sm flex-1">{highlight.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Avis Section */}
          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-lg font-bold">
                Avis ({experience.reviews_count})
              </Text>
              <TouchableOpacity onPress={() => router.push('/(profile)/reviews')}>
                <Text className="text-[#EF4444] text-sm font-semibold">Voir tout</Text>
              </TouchableOpacity>
            </View>

            {/* Overall Rating */}
            <View className="bg-[#161616] rounded-2xl p-4 mb-4">
              <View className="flex-row items-center gap-4">
                <View className="items-center">
                  <Text className="text-white text-4xl font-bold">{experience.rating?.toFixed(1)}</Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < Math.floor(experience.rating) ? 'star' : 'star-outline'}
                        size={14}
                        color={i < Math.floor(experience.rating) ? '#F59E0B' : '#52525B'}
                      />
                    ))}
                  </View>
                  <Text className="text-[#A1A1AA] text-xs mt-1">{experience.reviews_count} avis</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <View className="flex-1 h-2 bg-[#27272A] rounded-full overflow-hidden">
                      <View className="h-full bg-[#F59E0B]" style={{ width: '80%' }} />
                    </View>
                    <Text className="text-[#A1A1AA] text-xs w-6">5</Text>
                  </View>
                  <View className="flex-row items-center gap-2 mb-1">
                    <View className="flex-1 h-2 bg-[#27272A] rounded-full overflow-hidden">
                      <View className="h-full bg-[#F59E0B]" style={{ width: '15%' }} />
                    </View>
                    <Text className="text-[#A1A1AA] text-xs w-6">4</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1 h-2 bg-[#27272A] rounded-full overflow-hidden">
                      <View className="h-full bg-[#F59E0B]" style={{ width: '5%' }} />
                    </View>
                    <Text className="text-[#A1A1AA] text-xs w-6">3</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Reviews */}
            {experience.reviews?.map((review) => (
              <View key={review.id} className="mb-4">
                <View className="flex-row items-start gap-3">
                  <Image
                    source={{ uri: review.user_avatar }}
                    style={{ width: 40, height: 40 }}
                    className="rounded-full"
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-white font-semibold">{review.user_name}</Text>
                      <Text className="text-[#A1A1AA] text-xs">{review.date}</Text>
                    </View>
                    <View className="flex-row items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < review.rating ? 'star' : 'star-outline'}
                          size={12}
                          color={i < review.rating ? '#F59E0B' : '#52525B'}
                        />
                      ))}
                    </View>
                    <Text className="text-[#A1A1AA] text-sm leading-5">{review.comment}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-5">
            <TouchableOpacity className="flex-1 bg-[#EF4444] py-3.5 rounded-xl items-center">
              <Text className="text-white font-semibold text-base">Réserver</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#161616] px-5 py-3.5 rounded-xl items-center justify-center">
              <Ionicons name="bookmark-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Price Info */}
          <View className="items-center mb-5">
            <Text className="text-[#A1A1AA] text-sm">À partir de</Text>
            <Text className="text-white text-2xl font-bold">
              {experience.price_from.toLocaleString()} {experience.currency}
            </Text>
            <Text className="text-[#A1A1AA] text-xs">par personne</Text>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
