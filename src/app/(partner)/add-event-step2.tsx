import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/ui/Icon';
import { Stepper } from '@/components/ui/Stepper';
import { CTAButton } from '@/components/ui/CTAButton';
import { usePartnerStore } from '@/features/partner/partner.store';

export default function AddEventStep2Screen() {
  const router = useRouter();
  const { eventForm, setEventForm } = usePartnerStore();
  
  const [coverImage, setCoverImage] = useState<string | null>(eventForm.cover_image_url || null);
  const [endDate, setEndDate] = useState(eventForm.end_date || '');
  const [endTime, setEndTime] = useState(eventForm.end_time || '');

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

  const handleContinue = () => {
    setEventForm({
      cover_image_url: coverImage,
    });
    router.push('/(partner)/add-event-step3');
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
          <Stepper currentStep={2} totalSteps={4} />

          {/* Icon Illustration */}
          <View className="items-center mb-6 mt-4">
            <View className="w-24 h-24 bg-[#EF4444]/20 rounded-full items-center justify-center mb-4">
              <Icon library="ionicons" name="image" size={48} color="#EF4444" />
            </View>
          </View>

          {/* Section Title */}
          <Text className="text-white text-lg font-bold mb-4">
            Date & Billetterie
          </Text>

          {/* Cover Image */}
          <View className="mb-6">
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
            <Text className="text-white text-sm font-medium mb-2">
              Date de fin (optionnel)
            </Text>
            <View className="flex-row items-center bg-[#161616] rounded-xl px-4 py-3 border border-[#27272A]">
              <Icon library="ionicons" name="calendar-outline" size={20} color="#A1A1AA" />
              <TextInput
                className="flex-1 text-white text-sm ml-3"
                placeholder="25 Déc 2025"
                placeholderTextColor="#A1A1AA"
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
          </View>

          {/* Prix du billet */}
          <View className="mb-6">
            <Text className="text-white text-sm font-medium mb-2">
              Heure de fin (optionnel)
            </Text>
            
            <View className="flex-row items-center bg-[#161616] rounded-xl px-4 py-3 border border-[#27272A]">
              <Icon library="ionicons" name="time-outline" size={20} color="#A1A1AA" />
              <TextInput
                className="flex-1 text-white text-sm ml-3"
                placeholder="22:00"
                placeholderTextColor="#A1A1AA"
                value={endTime}
                onChangeText={setEndTime}
              />
            </View>
          </View>

          {/* Nombre de places */}
          <View className="mb-6">
            <Text className="text-white text-sm font-medium mb-2">
              Lieu de l'événement
            </Text>
            <TouchableOpacity
              className="bg-[#161616] rounded-xl px-4 py-3 flex-row items-center justify-between border border-[#27272A]"
              activeOpacity={0.7}
            >
              <Text className="text-[#A1A1AA] text-sm">
                Sélectionner un lieu
              </Text>
              <Icon library="ionicons" name="chevron-down" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#27272A] px-4 py-4">
        <CTAButton
          title="Continuer"
          variant="primary"
          onPress={handleContinue}
        />
      </View>
    </View>
  );
}
