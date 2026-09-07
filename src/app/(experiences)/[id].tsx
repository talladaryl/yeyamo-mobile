import { ActivityIndicator, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { mockExperiences } from '@/features/experiences/mockData';
import { useState } from 'react';
import { useThemeStore } from '@/features/theme/theme.store';
import { useAuthStore } from '@/features/auth/auth.store';
import { useCatalogExperience } from '@/features/experiences/experiences.hooks';
import { experiencesApi } from '@/features/experiences/experiences.api';
import type { CatalogExperience } from '@/features/experiences/types';

const { width } = Dimensions.get('window');

export default function ExperienceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [isSaved, setIsSaved] = useState(false);
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const catalogExperience = useCatalogExperience(id);
  
  const experience = isDemo
    ? mockExperiences.find(e => e.id === Number(id)) || mockExperiences[0]
    : undefined;

  if (!isDemo) {
    if (catalogExperience.isLoading) return <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}><ActivityIndicator color={colors.primary} /></View>;
    if (!catalogExperience.data) return <Unavailable />;
    return <CatalogExperienceEnrichedDetail experience={catalogExperience.data} />;
  }

  if (!experience) {
    return (
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: colors.background }}>
        <Text className="text-center text-base" style={{ color: colors.text }}>
          Le détail métier des expériences n’est pas encore exposé par une API compatible.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
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
          <Text style={{ color: colors.text }} className=" text-2xl font-bold mt-4 mb-2">{experience.title}</Text>
          <Text style={{ color: colors.textSecondary }} className=" text-sm mb-4">{experience.category} • {experience.location}</Text>

          {/* Rating */}
          <View className="flex-row items-center gap-1 mb-5">
            <Ionicons name="star" size={18} color="#F59E0B" />
            <Text style={{ color: colors.text }} className=" text-base font-semibold">{experience.rating?.toFixed(1)}</Text>
            <Text style={{ color: colors.textSecondary }} className=" text-sm">({experience.reviews_count} avis)</Text>
          </View>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap mb-5">
            <View className="w-1/2 mb-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="time-outline" size={20} color="#A1A1AA" />
                <View>
                  <Text style={{ color: colors.textSecondary }} className=" text-xs">Durée</Text>
                  <Text style={{ color: colors.text }} className=" text-sm font-semibold">{experience.duration_hours}h</Text>
                </View>
              </View>
            </View>

            <View className="w-1/2 mb-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="speedometer-outline" size={20} color="#A1A1AA" />
                <View>
                  <Text style={{ color: colors.textSecondary }} className=" text-xs">Niveau</Text>
                  <Text style={{ color: colors.text }} className=" text-sm font-semibold">{experience.difficulty_label || experience.difficulty}</Text>
                </View>
              </View>
            </View>

            <View className="w-1/2 mb-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="walk-outline" size={20} color="#A1A1AA" />
                <View>
                  <Text style={{ color: colors.textSecondary }} className=" text-xs">Distance</Text>
                  <Text style={{ color: colors.text }} className=" text-sm font-semibold">{experience.distance_km} km</Text>
                </View>
              </View>
            </View>

            <View className="w-1/2 mb-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="cash-outline" size={20} color="#A1A1AA" />
                <View>
                  <Text style={{ color: colors.textSecondary }} className=" text-xs">Dépôt requis</Text>
                  <Text style={{ color: colors.text }} className=" text-sm font-semibold">
                    {experience.required_deposit?.toLocaleString()} FCFA
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text style={{ color: colors.text }} className=" text-lg font-bold mb-3">À propos</Text>
            <Text style={{ color: colors.textSecondary }} className=" text-sm leading-6">{experience.description}</Text>
          </View>

          {/* Points forts */}
          {experience.highlights && experience.highlights.length > 0 && (
            <View className="mb-5">
              <Text style={{ color: colors.text }} className=" text-lg font-bold mb-3">Points forts</Text>
              {experience.highlights.map((highlight) => (
                <View key={highlight.id} className="flex-row items-start gap-2 mb-3">
                  <Ionicons name={highlight.icon as any} size={20} color="#10B981" />
                  <Text style={{ color: colors.textSecondary }} className=" text-sm flex-1">{highlight.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Avis Section */}
          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text style={{ color: colors.text }} className=" text-lg font-bold">
                Avis ({experience.reviews_count})
              </Text>
              <TouchableOpacity onPress={() => router.push('/(profile)/reviews')}>
                <Text className="text-[#EF4444] text-sm font-semibold">Voir tout</Text>
              </TouchableOpacity>
            </View>

            {/* Overall Rating */}
            <View className="rounded-2xl border p-4 mb-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <View className="flex-row items-center gap-4">
                <View className="items-center">
                  <Text style={{ color: colors.text }} className=" text-4xl font-bold">{experience.rating?.toFixed(1)}</Text>
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
                  <Text style={{ color: colors.textSecondary }} className=" text-xs mt-1">{experience.reviews_count} avis</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <View className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.elevated }}>
                      <View className="h-full bg-[#F59E0B]" style={{ width: '80%' }} />
                    </View>
                    <Text style={{ color: colors.textSecondary }} className=" text-xs w-6">5</Text>
                  </View>
                  <View className="flex-row items-center gap-2 mb-1">
                    <View className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.elevated }}>
                      <View className="h-full bg-[#F59E0B]" style={{ width: '15%' }} />
                    </View>
                    <Text style={{ color: colors.textSecondary }} className=" text-xs w-6">4</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.elevated }}>
                      <View className="h-full bg-[#F59E0B]" style={{ width: '5%' }} />
                    </View>
                    <Text style={{ color: colors.textSecondary }} className=" text-xs w-6">3</Text>
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
                      <Text style={{ color: colors.text }} className=" font-semibold">{review.user_name}</Text>
                      <Text style={{ color: colors.textSecondary }} className=" text-xs">{review.date}</Text>
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
                    <Text style={{ color: colors.textSecondary }} className=" text-sm leading-5">{review.comment}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-5">
            <TouchableOpacity onPress={() => router.push(`/(bookings)/experience/${experience.id}`)} className="flex-1 bg-[#EF4444] py-3.5 rounded-xl items-center">
              <Text className="text-base font-semibold text-white">Réserver</Text>
            </TouchableOpacity>
            <TouchableOpacity className="border px-5 py-3.5 rounded-xl items-center justify-center" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <Ionicons name="bookmark-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Price Info */}
          <View className="items-center mb-5">
            <Text style={{ color: colors.textSecondary }} className=" text-sm">À partir de</Text>
            <Text style={{ color: colors.text }} className=" text-2xl font-bold">
              {experience.price_from.toLocaleString()} {experience.currency}
            </Text>
            <Text style={{ color: colors.textSecondary }} className=" text-xs">par personne</Text>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}

function Unavailable() {
  const colors = useThemeStore((state) => state.colors);
  return <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: colors.background }}><Text className="text-center text-base" style={{ color: colors.text }}>Cette expérience n’est pas encore disponible.</Text></View>;
}

function CatalogExperienceDetail({ experience }: { experience: CatalogExperience }) {
  const colors = useThemeStore((state) => state.colors);
  const router = useRouter();
  const location = [experience.city, experience.district, experience.address].filter((value): value is string => Boolean(value?.trim())).join(' · ');
  return <View className="flex-1" style={{ backgroundColor: colors.background }}><Stack.Screen options={{ headerShown: true, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerTitle: 'Expérience', headerLeft: () => <TouchableOpacity onPress={() => router.back()} className="ml-4"><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity> }} /><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}><Text className="text-3xl font-extrabold" style={{ color: colors.text }}>{experience.name}</Text>{experience.categoryCode ? <Text className="mt-2 text-sm font-bold" style={{ color: colors.primary }}>{experience.categoryCode}</Text> : null}{location ? <View className="mt-4 flex-row items-start"><Ionicons name="location-outline" size={20} color={colors.textSecondary} /><Text className="ml-2 flex-1" style={{ color: colors.textSecondary }}>{location}</Text></View> : null}{experience.description ? <View className="mt-7"><Text className="text-lg font-bold" style={{ color: colors.text }}>À propos</Text><Text className="mt-2 text-sm leading-6" style={{ color: colors.textSecondary }}>{experience.description}</Text></View> : null}</ScrollView></View>;
}

function CatalogExperienceEnrichedDetail({ experience }: { experience: CatalogExperience }) {
  const colors = useThemeStore((state) => state.colors);
  const router = useRouter();
  const mediaUrls = experiencesApi.mediaUrls(experience.mediaIds);
  const location = [experience.city, experience.district, experience.address]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(' · ');
  const capacity = capacityLabel(experience.capacityMin, experience.capacityMax);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: true, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerTitle: 'Expérience', headerLeft: () => <TouchableOpacity onPress={() => router.back()} className="ml-4"><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity> }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {mediaUrls.length > 0 ? (
          <View>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {mediaUrls.map((url, index) => <Image key={experience.mediaIds[index]} source={{ uri: url }} style={{ width, height: 260 }} contentFit="cover" />)}
            </ScrollView>
            <View className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1.5"><Text className="text-xs font-medium text-white">{mediaUrls.length} média{mediaUrls.length > 1 ? 's' : ''}</Text></View>
          </View>
        ) : null}

        <View className="px-5">
          <Text className="mt-5 text-3xl font-extrabold" style={{ color: colors.text }}>{experience.name}</Text>
          {experience.categoryCode ? <Text className="mt-2 text-sm font-bold" style={{ color: colors.primary }}>{experience.categoryCode}</Text> : null}
          {location ? <View className="mt-4 flex-row items-start"><Ionicons name="location-outline" size={20} color={colors.textSecondary} /><Text className="ml-2 flex-1" style={{ color: colors.textSecondary }}>{location}</Text></View> : null}

          {experience.durationMinutes !== null || experience.difficultyLevel || (experience.price !== null && experience.currency) || capacity ? (
            <View className="mt-6 flex-row flex-wrap rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              {experience.durationMinutes !== null ? <PracticalItem icon="time-outline" label="Durée" value={formatDuration(experience.durationMinutes)} /> : null}
              {experience.difficultyLevel ? <PracticalItem icon="speedometer-outline" label="Niveau" value={difficultyLabel(experience.difficultyLevel)} /> : null}
              {experience.price !== null && experience.currency ? <PracticalItem icon="cash-outline" label="Prix" value={formatPrice(experience.price, experience.currency)} /> : null}
              {capacity ? <PracticalItem icon="people-outline" label="Groupe" value={capacity} /> : null}
            </View>
          ) : null}

          {experience.includedItems.length > 0 ? <ItemList title="Inclus" icon="checkmark-circle-outline" color="#10B981" items={experience.includedItems} /> : null}
          {experience.excludedItems.length > 0 ? <ItemList title="Non inclus" icon="close-circle-outline" color="#EF4444" items={experience.excludedItems} /> : null}

          {experience.placeId ? <TouchableOpacity onPress={() => router.push(`/(places)/${experience.placeId}`)} className="mt-6 flex-row items-center justify-between rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><View className="flex-row items-center"><Ionicons name="location-outline" size={21} color={colors.primary} /><Text className="ml-3 text-sm font-semibold" style={{ color: colors.text }}>Voir le lieu associé</Text></View><Ionicons name="chevron-forward" size={20} color={colors.textMuted} /></TouchableOpacity> : null}

          {experience.description ? <View className="mt-7"><Text className="text-lg font-bold" style={{ color: colors.text }}>À propos</Text><Text className="mt-2 text-sm leading-6" style={{ color: colors.textSecondary }}>{experience.description}</Text></View> : null}
        </View>
      </ScrollView>
    </View>
  );
}

function PracticalItem({ icon, label, value }: { icon: 'time-outline' | 'speedometer-outline' | 'cash-outline' | 'people-outline'; label: string; value: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mb-3 w-1/2 flex-row items-start"><Ionicons name={icon} size={19} color={colors.primary} /><View className="ml-2 flex-1"><Text className="text-xs" style={{ color: colors.textSecondary }}>{label}</Text><Text className="mt-0.5 text-sm font-semibold" style={{ color: colors.text }}>{value}</Text></View></View>;
}

function ItemList({ title, icon, color, items }: { title: string; icon: 'checkmark-circle-outline' | 'close-circle-outline'; color: string; items: string[] }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mt-6"><Text className="text-lg font-bold" style={{ color: colors.text }}>{title}</Text>{items.map((item, index) => <View key={`${item}-${index}`} className="mt-3 flex-row items-start"><Ionicons name={icon} size={19} color={color} /><Text className="ml-2 flex-1 text-sm" style={{ color: colors.textSecondary }}>{item}</Text></View>)}</View>;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours > 0 ? `${hours}h${remainder > 0 ? String(remainder).padStart(2, '0') : ''}` : `${minutes} min`;
}

function difficultyLabel(level: NonNullable<CatalogExperience['difficultyLevel']>) {
  return ({ BEGINNER: 'Débutant', INTERMEDIATE: 'Intermédiaire', ADVANCED: 'Avancé', EXPERT: 'Expert' })[level];
}

function formatPrice(price: number, currency: string) {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(price)} ${currency}`;
}

function capacityLabel(min: number | null, max: number | null) {
  if (min !== null && max !== null) return `${min} à ${max} personnes`;
  if (max !== null) return `Jusqu’à ${max} personnes`;
  if (min !== null) return `Dès ${min} personne${min > 1 ? 's' : ''}`;
  return null;
}
