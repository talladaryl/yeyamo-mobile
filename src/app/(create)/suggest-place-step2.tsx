import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { NativeMap, NativeMarker, PROVIDER_GOOGLE } from '@/components/maps/NativeMap';
import { Icon } from '@/components/ui/Icon';
import { Stepper } from '@/components/ui/Stepper';
import { CTAButton } from '@/components/ui/CTAButton';
import { useCreateStore } from '@/features/create/create.store';
import { placesApi } from '@/features/places/places.api';

export default function SuggestPlaceStep2Screen() {
  const router = useRouter();
  const { placeForm, setPlaceForm, setPlaceStep, resetPlaceForm } = useCreateStore();
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
    placeForm.coordinates ?? null,
  );
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!coordinates) {
      Alert.alert('Localisation requise', 'Touchez la carte pour positionner le lieu.');
      return;
    }
    if (!placeForm.name?.trim() || !placeForm.address?.trim()) {
      Alert.alert('Informations incomplètes', 'Le nom et l’adresse du lieu sont requis.');
      router.replace('/(create)/suggest-place-step1');
      return;
    }

    setSubmitting(true);
    try {
      await placesApi.suggestPlace({
        name: placeForm.name.trim(),
        address: placeForm.address.trim(),
        description: placeForm.description?.trim() || undefined,
        category: placeForm.category?.trim() || undefined,
        placeType: placeForm.type?.trim() || undefined,
        region: placeForm.region?.trim() || undefined,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
      setPlaceForm({ coordinates });
      setPlaceStep(3);
      Alert.alert('Suggestion envoyée', 'Elle sera examinée avant sa publication.', [
        {
          text: 'OK',
          onPress: () => {
            resetPlaceForm();
            router.replace('/(tabs)/explore');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Envoi impossible', error instanceof Error ? error.message : 'Réessayez dans quelques instants.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0A0A0A]">
      <Stack.Screen options={{
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
      }} />

      <View className="flex-1">
        <View className="px-4 pt-4 pb-3 bg-white dark:bg-[#0A0A0A]"><Stepper currentStep={2} totalSteps={2} /></View>
        <View className="flex-1 relative">
          <NativeMap
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: coordinates?.latitude ?? 0,
              longitude: coordinates?.longitude ?? 0,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={(event: any) => setCoordinates(event.nativeEvent.coordinate)}
          >
            {coordinates ? <NativeMarker coordinate={coordinates} pinColor="#EF4444" draggable onDragEnd={(event: any) => setCoordinates(event.nativeEvent.coordinate)} /> : null}
          </NativeMap>

          <View className="absolute top-4 left-4 right-4 bg-white/95 rounded-2xl p-4 shadow-lg">
            <Text className="text-[#0A0A0A] text-sm font-semibold">Positionnez le lieu</Text>
            <Text className="text-[#52525B] text-xs mt-1">Touchez la carte ou déplacez le repère. Aucune position par défaut n’est envoyée.</Text>
            <View className="border-t border-[#E5E5E5] mt-3 pt-3">
              <Text className="text-[#0A0A0A] text-xs font-medium">{placeForm.name || 'Nom non renseigné'}</Text>
              <Text className="text-[#52525B] text-xs mt-1">{placeForm.address || 'Adresse non renseignée'}</Text>
              <Text className="text-[#52525B] text-xs mt-1">{placeForm.region || 'Région non renseignée'}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white dark:bg-[#0A0A0A] border-t border-[#E4E4E7] dark:border-[#27272A] px-4 py-4">
          <CTAButton title={submitting ? 'Envoi…' : 'Envoyer la suggestion'} variant="primary" onPress={submit} disabled={submitting} />
        </View>
      </View>
    </View>
  );
}
