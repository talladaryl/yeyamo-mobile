import { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import { mapPlaces, CAMEROON_CENTER } from '@/features/explore/mockData';
import type { MapPlace } from '@/features/explore/types';
import { useThemeStore } from '@/features/theme/theme.store';

const { height } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={CAMEROON_CENTER}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {mapPlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={place.coordinates}
            onPress={() => setSelectedPlace(place)}
          >
            <View className="bg-[#EF4444] w-10 h-10 rounded-full items-center justify-center border-2 border-white">
              <Icon library="ionicons" name="location" size={20} color="#FFFFFF" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Top Controls */}
      <SafeAreaView className="absolute top-0 left-0 right-0">
        <View className="px-4 pt-3 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white w-10 h-10 rounded-full items-center justify-center"
            activeOpacity={0.8}
          >
            <Icon library="ionicons" name="arrow-back" size={24} color="#0A0A0A" />
          </TouchableOpacity>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(explore)/search')}
              className="bg-white w-10 h-10 rounded-full items-center justify-center"
              activeOpacity={0.8}
            >
              <Icon library="ionicons" name="search" size={24} color="#0A0A0A" />
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white w-10 h-10 rounded-full items-center justify-center"
              activeOpacity={0.8}
            >
              <Icon library="ionicons" name="options" size={24} color="#0A0A0A" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Region Labels - simplified */}
      <View className="absolute top-32 left-8">
        <Text className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">
          Nord
        </Text>
      </View>
      <View className="absolute top-48 right-12">
        <Text className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">
          Extrême-Nord
        </Text>
      </View>
      <View className="absolute bottom-64 left-12">
        <Text className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">
          Sud-Ouest
        </Text>
      </View>
      <View className="absolute bottom-52 right-16">
        <Text className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">
          Est
        </Text>
      </View>

      {/* Place Preview Card */}
      {selectedPlace && (
        <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <TouchableOpacity
            onPress={() => router.push(`/(places)/${selectedPlace.id}`)}
            activeOpacity={0.9}
            className="flex-row gap-3"
          >
            <Image
              source={{ uri: selectedPlace.image_url }}
              style={{ width: 100, height: 100, borderRadius: 12 }}
              contentFit="cover"
            />

            <View className="flex-1 justify-center">
              <Text className="font-bold text-lg mb-1" style={{ color: colors.text }}>
                {selectedPlace.name}
              </Text>

              <View className="flex-row items-center gap-1 mb-2">
                <Icon library="ionicons" name="star" size={16} color="#F59E0B" />
                <Text className="text-sm" style={{ color: colors.text }}>{selectedPlace.rating}</Text>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>(105 avis)</Text>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedPlace(null)}
                className="absolute top-0 right-0"
              >
                <Icon library="ionicons" name="close" size={24} color="#A1A1AA" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* My Location Button */}
      <TouchableOpacity
        className="absolute bottom-32 right-4 bg-white w-12 h-12 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <Icon library="ionicons" name="locate" size={24} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
}
