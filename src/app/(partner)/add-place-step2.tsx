import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Icon } from '@/components/ui/Icon';
import { CTAButton } from '@/components/ui/CTAButton';
import { usePartnerStore } from '@/features/partner/partner.store';

export default function AddPlaceStep2Screen() {
  const router = useRouter();
  const { placeForm, setPlaceForm } = usePartnerStore();
  
  const [useMyPosition, setUseMyPosition] = useState(false);
  const [exactAddress, setExactAddress] = useState(placeForm.exact_address || '');
  const [region, setRegion] = useState(placeForm.region || '');
  const [city, setCity] = useState(placeForm.city || '');
  const [landmarks, setLandmarks] = useState(placeForm.landmarks || '');
  const [selectedCoordinates, setSelectedCoordinates] = useState({
    latitude: placeForm.coordinates?.latitude || 4.0511,
    longitude: placeForm.coordinates?.longitude || 9.7679,
  });

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedCoordinates({ latitude, longitude });
  };

  const handleContinue = () => {
    setPlaceForm({
      use_my_position: useMyPosition,
      exact_address: exactAddress,
      region,
      city,
      landmarks,
      coordinates: selectedCoordinates,
    });
    router.push('/(partner)/add-place-step3');
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Ajouter un lieu',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-4">
              <Icon library="ionicons" name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Map */}
        <View style={{ height: 250 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: selectedCoordinates.latitude,
              longitude: selectedCoordinates.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={handleMapPress}
          >
            <Marker
              coordinate={selectedCoordinates}
              pinColor="#EF4444"
              draggable
              onDragEnd={handleMapPress}
            />
          </MapView>
        </View>

        <View className="px-4 py-6">
          {/* Section: Localisation */}
          <Text className="text-[#18181B] dark:text-white text-lg font-bold mb-4">
            Localisation
          </Text>

          {/* Checkbox: Utiliser ma position */}
          <TouchableOpacity
            onPress={() => setUseMyPosition(!useMyPosition)}
            className="flex-row items-center mb-4"
            activeOpacity={0.7}
          >
            <View className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 ${
              useMyPosition ? 'bg-[#EF4444] border-[#EF4444]' : 'border-[#A1A1AA]'
            }`}>
              {useMyPosition && (
                <Icon library="ionicons" name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
            <Text className="text-[#18181B] dark:text-white text-sm">Utiliser ma position</Text>
          </TouchableOpacity>

          {/* Adresse exacte */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Adresse exacte <Text className="text-[#EF4444]">*</Text>
            </Text>
            <TextInput
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
              placeholder="Rue de Rim Arawak, Bonapriso, Douala"
              placeholderTextColor="#A1A1AA"
              value={exactAddress}
              onChangeText={setExactAddress}
              multiline
            />
          </View>

          {/* Région */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Région <Text className="text-[#EF4444]">*</Text>
            </Text>
            <TouchableOpacity
              className="bg-white dark:bg-[#161616] rounded-xl px-4 py-3 flex-row items-center justify-between border border-[#E4E4E7] dark:border-[#27272A]"
              activeOpacity={0.7}
            >
              <Text className={region ? 'text-[#18181B] dark:text-white text-sm' : 'text-[#52525B] dark:text-[#A1A1AA] text-sm'}>
                {region || 'Sélectionner une région'}
              </Text>
              <Icon library="ionicons" name="chevron-down" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* Ville */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Ville <Text className="text-[#EF4444]">*</Text>
            </Text>
            <TouchableOpacity
              className="bg-white dark:bg-[#161616] rounded-xl px-4 py-3 flex-row items-center justify-between border border-[#E4E4E7] dark:border-[#27272A]"
              activeOpacity={0.7}
            >
              <Text className={city ? 'text-[#18181B] dark:text-white text-sm' : 'text-[#52525B] dark:text-[#A1A1AA] text-sm'}>
                {city || 'Sélectionner une ville'}
              </Text>
              <Icon library="ionicons" name="chevron-down" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* Points de repère */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Points de repère
            </Text>
            <TextInput
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
              placeholder="Ex: Près de la pharmacie du carrefour"
              placeholderTextColor="#A1A1AA"
              value={landmarks}
              onChangeText={setLandmarks}
              multiline
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0A0A0A] border-t border-[#E4E4E7] dark:border-[#27272A] px-4 py-4">
        <CTAButton
          title="Continuer"
          variant="primary"
          onPress={handleContinue}
          disabled={!exactAddress}
        />
      </View>
    </View>
  );
}
