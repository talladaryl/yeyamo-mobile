import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/ui/Icon';
import { Stepper } from '@/components/ui/Stepper';
import { Toggle } from '@/components/ui/Toggle';
import { CTAButton } from '@/components/ui/CTAButton';
import { usePartnerStore } from '@/features/partner/partner.store';

export default function AddEventStep2Screen() {
  const router = useRouter();
  const { eventForm, setEventForm } = usePartnerStore();
  
  const [description, setDescription] = useState(eventForm.description || '');
  const [coverImage, setCoverImage] = useState<string | null>(eventForm.cover_image_url || null);
  const [ticketPriceEnabled, setTicketPriceEnabled] = useState(eventForm.ticket_price_enabled || false);
  const [ticketPrice, setTicketPrice] = useState(eventForm.ticket_price?.toString() || '');
  const [maxSeats, setMaxSeats] = useState(eventForm.max_seats?.toString() || '');

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const handlePublish = () => {
    setEventForm({
      description,
      cover_image_url: coverImage,
      ticket_price_enabled: ticketPriceEnabled,
      ticket_price: ticketPrice ? parseFloat(ticketPrice) : undefined,
      max_seats: maxSeats ? parseInt(maxSeats) : undefined,
    });
    console.log('Publishing event:', eventForm);
    router.back();
    router.back();
  };

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Ajouter un événement',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-4">
              <Icon library="ionicons" name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* Stepper */}
          <Stepper currentStep={2} totalSteps={2} />

          {/* Cover Image */}
          <View className="mb-6 mt-4">
            <Text className="text-white text-sm font-medium mb-2">
              Image de couverture
            </Text>
            <TouchableOpacity
              onPress={pickCoverImage}
              activeOpacity={0.9}
              className="relative"
            >
              {coverImage ? (
                <Image
                  source={{ uri: coverImage }}
                  style={{ width: '100%', height: 200 }}
                  className="rounded-2xl"
                  contentFit="cover"
                />
              ) : (
                <View className="w-full h-48 bg-[#161616] rounded-2xl items-center justify-center border border-[#27272A]">
                  <Icon library="ionicons" name="image" size={48} color="#52525B" />
                  <Text className="text-[#A1A1AA] text-sm mt-2">
                    Ajouter une image
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">
              Description
            </Text>
            <TextInput
              className="bg-[#161616] text-white rounded-xl px-4 py-3 text-sm border border-[#27272A]"
              placeholder="Une soirée inoubliable avec les plus grandes icônes de la musique"
              placeholderTextColor="#A1A1AA"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={1000}
              style={{ minHeight: 120, textAlignVertical: 'top' }}
            />
            <Text className="text-xs text-[#A1A1AA] mt-1 text-right">
              {description.length}/1000
            </Text>
          </View>

          {/* Prix du billet */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">
              Prix du billet
            </Text>
            
            <View className="bg-[#161616] rounded-xl px-4 py-2 mb-3">
              <Toggle
                label="Activer le prix"
                value={ticketPriceEnabled}
                onValueChange={setTicketPriceEnabled}
              />
            </View>

            {ticketPriceEnabled && (
              <View>
                <Text className="text-white text-sm font-medium mb-2">
                  Prix (FCFA)
                </Text>
                <TextInput
                  className="bg-[#161616] text-white rounded-xl px-4 py-3 text-sm border border-[#27272A]"
                  placeholder="5000"
                  placeholderTextColor="#A1A1AA"
                  value={ticketPrice}
                  onChangeText={setTicketPrice}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          {/* Nombre de places */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-4">
              Nombre de places
            </Text>
            <TextInput
              className="bg-[#161616] text-white rounded-xl px-4 py-3 text-sm border border-[#27272A]"
              placeholder="default"
              placeholderTextColor="#A1A1AA"
              value={maxSeats}
              onChangeText={setMaxSeats}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#27272A] px-4 py-4">
        <CTAButton
          title="Publier / Enregistrer"
          variant="primary"
          onPress={handlePublish}
          disabled={!description}
        />
      </View>
    </View>
  );
}
