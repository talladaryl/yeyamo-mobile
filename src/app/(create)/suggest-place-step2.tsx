import { useState } from 'react';
import { Alert, View, Text, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Icon } from '@/components/ui/Icon';
import { Stepper } from '@/components/ui/Stepper';
import { CTAButton } from '@/components/ui/CTAButton';
import { useCreateStore } from '@/features/create/create.store';

export default function SuggestPlaceStep2Screen() {
  const router = useRouter();
  const { placeForm, setPlaceForm, setPlaceStep, resetPlaceForm } = useCreateStore();
  
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
      coordinates: selectedCoordinates,
      city: 'Douala',
      route_details: 'La ville, Détails d\'itinéraire',
    });
    setPlaceStep(3);
    Alert.alert('Lieu suggéré', 'Votre suggestion est enregistrée en mode démo.', [
      {
        text: 'OK',
        onPress: () => {
          resetPlaceForm();
          router.replace('/(tabs)/explore');
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Suggérer un lieu',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-4">
              <Icon library="ionicons" name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1">
        {/* Stepper */}
        <View className="px-4 pt-4 pb-3 bg-white dark:bg-[#0A0A0A]">
          <Stepper currentStep={2} totalSteps={5} />
        </View>

        {/* Map */}
        <View className="flex-1 relative">
          <MapView
            provider={PROVIDER_GOOGLE}
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

          {/* Legend Overlay */}
          <View className="absolute top-4 left-4 right-4 bg-white/95 rounded-2xl p-4 shadow-lg">
            <View className="mb-3">
              <View className="flex-row items-center mb-1">
                <View className="w-3 h-3 rounded-full bg-[#EF4444] mr-2" />
                <Text className="text-[#0A0A0A] text-sm font-semibold">
                  Localisation
                </Text>
              </View>
              <Text className="text-[#52525B] text-xs ml-5">
                Explorez en cliquant sur la carte
              </Text>
            </View>

            <View className="border-t border-[#E5E5E5] pt-3 mb-3">
              <Text className="text-[#0A0A0A] text-sm font-semibold mb-1">
                Informations de base
              </Text>
              <Text className="text-[#52525B] text-xs">
                Cliquez pour ajouter les détails de l'emplacement
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-[#0A0A0A] text-xs font-medium mb-1">
                Nom du lieu
              </Text>
              <Text className="text-[#52525B] text-xs">
                {placeForm.name || 'Non défini'}
              </Text>
            </View>

            <View className="mb-3">
              <Text className="text-[#0A0A0A] text-xs font-medium mb-1">
                Catégorie
              </Text>
              <Text className="text-[#52525B] text-xs">
                {placeForm.category || 'Non sélectionnée'}
              </Text>
            </View>

            <View>
              <Text className="text-[#0A0A0A] text-xs font-medium mb-1">
                Type de lieu
              </Text>
              <Text className="text-[#52525B] text-xs">
                {placeForm.type || 'Non défini'}
              </Text>
            </View>
          </View>

          {/* Info Card Bottom */}
          <View className="absolute bottom-24 left-4 right-4 bg-white/95 rounded-2xl p-4 shadow-lg">
            <View className="mb-2">
              <Text className="text-[#0A0A0A] text-xs font-medium mb-1">
                Adresse ou disposition
              </Text>
              <Text className="text-[#52525B] text-xs">
                La ville, Détails d'itinéraire
              </Text>
            </View>

            <View>
              <Text className="text-[#0A0A0A] text-xs font-medium mb-1">
                Région
              </Text>
              <Text className="text-[#52525B] text-xs">
                {placeForm.region || 'Littoral'}
              </Text>
            </View>
          </View>

          {/* Recenter Button */}
          <TouchableOpacity
            className="absolute right-4 bottom-40 w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg"
            activeOpacity={0.7}
          >
            <Icon library="ionicons" name="locate" size={24} color="#0A0A0A" />
          </TouchableOpacity>
        </View>

        {/* Bottom Button */}
        <View className="bg-white dark:bg-[#0A0A0A] border-t border-[#E4E4E7] dark:border-[#27272A] px-4 py-4">
          <CTAButton
            title="Continuer"
            variant="primary"
            onPress={handleContinue}
          />
        </View>
      </View>
    </View>
  );
}
