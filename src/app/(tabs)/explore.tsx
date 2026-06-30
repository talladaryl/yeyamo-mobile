import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { CategoryCard } from '@/components/explore/CategoryCard';
import { TrendingPlaceCard } from '@/components/explore/TrendingPlaceCard';
import { categories, trendingPlaces } from '@/features/explore/mockData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExploreHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="px-4 pt-3 pb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icon library="ionicons" name="location" size={20} color="#EF4444" />
          <Text className="text-white font-semibold text-base">Yaoundé</Text>
          <Icon library="ionicons" name="chevron-down" size={16} color="#A1A1AA" />
        </View>

        <TouchableOpacity activeOpacity={0.7}>
          <Icon library="ionicons" name="notifications-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View className="px-4 pt-4 pb-4">
          <Text className="text-white text-2xl font-bold">
            Bonjour,
          </Text>
          <Text className="text-white text-2xl font-bold mt-1">
            Que souhaitez-vous{'\n'}découvrir aujourd'hui ?
          </Text>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          onPress={() => router.push('/(explore)/search')}
          className="mx-4 mb-6 bg-[#161616] rounded-xl px-4 py-3.5 flex-row items-center gap-3"
          activeOpacity={0.8}
        >
          <Icon library="ionicons" name="search" size={20} color="#A1A1AA" />
          <Text className="text-[#A1A1AA] text-sm flex-1">
            Recherchez un lieu, événement...
          </Text>
        </TouchableOpacity>

        {/* Quick Access Sections */}
        <View className="px-4 mb-6">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(explore)/events')}
              className="flex-1 bg-[#161616] rounded-xl p-4"
              activeOpacity={0.8}
            >
              <Icon library="ionicons" name="calendar" size={24} color="#EF4444" />
              <Text className="text-white font-semibold mt-2">Événements</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/(explore)/experiences')}
              className="flex-1 bg-[#161616] rounded-xl p-4"
              activeOpacity={0.8}
            >
              <Icon library="ionicons" name="compass" size={24} color="#EF4444" />
              <Text className="text-white font-semibold mt-2">Expériences</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View className="px-4 mb-6">
          <Text className="text-white text-lg font-bold mb-4">Catégories</Text>
          <View className="flex-row flex-wrap gap-y-4">
            {categories.map((category) => (
              <View key={category.id} style={{ width: '33.33%' }}>
                <CategoryCard
                  category={category}
                  onPress={() => {
                    console.log('Navigate to category:', category.id);
                  }}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Trending Places */}
        <View className="mb-6">
          <View className="px-4 flex-row items-center justify-between mb-3">
            <Text className="text-white text-lg font-bold">
              Tendances près de vous
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
            >
              <Text className="text-[#EF4444] text-sm font-semibold">Voir tout</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {trendingPlaces.map((place) => (
              <TrendingPlaceCard
                key={place.id}
                place={place}
                onPress={() => router.push(`/(places)/${place.id}`)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Spacing for bottom nav */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
