import { memo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Icon } from '@/components/ui/Icon';
import { Stepper } from '@/components/ui/Stepper';
import { CTAButton } from '@/components/ui/CTAButton';
import { useCreateStore } from '@/features/create/create.store';

const StableMapPreview = memo(function StableMapPreview() {
  return (
    <View className="rounded-2xl overflow-hidden" style={{ height: 180 }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{ latitude: 4.0511, longitude: 9.7679, latitudeDelta: 0.1, longitudeDelta: 0.1 }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker coordinate={{ latitude: 4.0511, longitude: 9.7679 }} pinColor="#EF4444" />
      </MapView>
    </View>
  );
});

export default function SuggestPlaceStep1Screen() {
  const router = useRouter();
  const placeForm = useCreateStore((state) => state.placeForm);
  const setPlaceForm = useCreateStore((state) => state.setPlaceForm);
  const setPlaceStep = useCreateStore((state) => state.setPlaceStep);
  
  const [name, setName] = useState(placeForm.name || '');
  const [address, setAddress] = useState(placeForm.address || '');
  const [manualAddress, setManualAddress] = useState(false);
  const [category, setCategory] = useState(placeForm.category || '');
  const [type, setType] = useState(placeForm.type || 'Événementiel');
  const [description, setDescription] = useState(placeForm.description || '');
  const [region, setRegion] = useState(placeForm.region || 'Littoral');
  const regions = ['Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral', 'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'];
  const categories = ['Nature', 'Restaurant', 'Hôtel', 'Culture', 'Loisir'];
  const placeTypes = ['Événementiel', 'Naturel', 'Commercial', 'Public'];

  const handleContinue = () => {
    setPlaceForm({
      name,
      address,
      manual_address: manualAddress,
      category,
      type,
      description,
      region,
    });
    setPlaceStep(2);
    router.push('/(create)/suggest-place-step2');
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

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
        {/* Stepper */}
        <View className="px-4 pt-4">
          <Stepper currentStep={1} totalSteps={5} />
        </View>

        {/* Map Preview */}
        <View className="px-4 mb-4">
          <StableMapPreview />
        </View>

        <View className="px-4 pb-6">
          {/* Section Title */}
          <Text className="text-[#18181B] dark:text-white text-lg font-bold mb-4">
            Informations de base
          </Text>

          {/* Nom du lieu */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Nom du lieu <Text className="text-[#EF4444]">*</Text>
            </Text>
            <TextInput
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
              placeholder="Ex: Chutes d'Ekom Nkam"
              placeholderTextColor="#A1A1AA"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Adresse */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Adresse complète (Région) <Text className="text-[#EF4444]">*</Text>
            </Text>
            <View className="relative">
              <TextInput
                className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
                placeholder="Rechercher une adresse..."
                placeholderTextColor="#A1A1AA"
                value={address}
                onChangeText={setAddress}
              />
              <TouchableOpacity
                onPress={() => setManualAddress(!manualAddress)}
                className="absolute right-3 top-3"
                activeOpacity={0.7}
              >
                <Text className="text-[#EF4444] text-xs font-semibold">
                  Saisir manuellement
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Catégorie */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Catégorie <Text className="text-[#EF4444]">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setCategory(categories[(categories.indexOf(category) + 1) % categories.length] || categories[0])}
              className="bg-white dark:bg-[#161616] rounded-xl px-4 py-3 flex-row items-center justify-between border border-[#E4E4E7] dark:border-[#27272A]"
              activeOpacity={0.7}
            >
              <Text className={category ? 'text-[#18181B] dark:text-white text-sm' : 'text-[#52525B] dark:text-[#A1A1AA] text-sm'}>
                {category || 'Sélectionner une catégorie'}
              </Text>
              <Icon library="ionicons" name="chevron-down" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* Type de lieu */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Type de lieu <Text className="text-[#EF4444]">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setType(placeTypes[(placeTypes.indexOf(type) + 1) % placeTypes.length] || placeTypes[0])}
              className="bg-white dark:bg-[#161616] rounded-xl px-4 py-3 flex-row items-center justify-between border border-[#E4E4E7] dark:border-[#27272A]"
              activeOpacity={0.7}
            >
              <Text className="text-[#18181B] dark:text-white text-sm">{type}</Text>
              <Icon library="ionicons" name="chevron-down" size={18} color="#A1A1AA" />
            </TouchableOpacity>
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-1">
              Événementiel, Naturel
            </Text>
          </View>

          {/* Brève description */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Brève description <Text className="text-[#EF4444]">*</Text>
            </Text>
            <TextInput
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
              placeholder="Décrivez brièvement ce lieu..."
              placeholderTextColor="#A1A1AA"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={500}
              style={{ minHeight: 100, textAlignVertical: 'top' }}
            />
          </View>

          {/* Région */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Région <Text className="text-[#EF4444]">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setRegion(regions[(regions.indexOf(region) + 1) % regions.length])}
              className="bg-white dark:bg-[#161616] rounded-xl px-4 py-3 flex-row items-center justify-between border border-[#E4E4E7] dark:border-[#27272A]"
              activeOpacity={0.7}
            >
              <Text className="text-[#18181B] dark:text-white text-sm">{region}</Text>
              <Icon library="ionicons" name="chevron-down" size={18} color="#A1A1AA" />
            </TouchableOpacity>
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
          disabled={!name || !address || !category || !type || !description}
        />
      </View>
      </KeyboardAvoidingView>
    </View>
  );
}
