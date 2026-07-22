import { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/ui/Icon';
import { Toggle } from '@/components/ui/Toggle';
import { CTAButton } from '@/components/ui/CTAButton';
import { useCreateStore } from '@/features/create/create.store';
import { useThemeStore } from '@/features/theme/theme.store';

export default function CreateEventScreen() {
  const router = useRouter();
  const initialEventForm = useRef(useCreateStore.getState().eventForm).current;
  const setEventForm = useCreateStore((state) => state.setEventForm);
  const colors = useThemeStore((state) => state.colors);
  
  const [coverImage, setCoverImage] = useState<string | null>(initialEventForm.cover_image_url ?? null);
  const [title, setTitle] = useState(initialEventForm.title ?? '');
  const [description, setDescription] = useState(initialEventForm.description ?? '');
  const [location, setLocation] = useState(initialEventForm.location ?? '');
  const [date, setDate] = useState(initialEventForm.date ?? '');
  const [time, setTime] = useState(initialEventForm.time ?? '');
  const [maxParticipants, setMaxParticipants] = useState(String(initialEventForm.max_participants ?? 20));
  const [shareToFeed, setShareToFeed] = useState(initialEventForm.share_to_feed ?? true);

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]) {
      setCoverImage(result.assets[0].uri);
      setEventForm({ cover_image_url: result.assets[0].uri });
    }
  };

  const handleNext = () => {
    setEventForm({
      title,
      description,
      location,
      date,
      time,
      max_participants: parseInt(maxParticipants) || 20,
      share_to_feed: shareToFeed,
    });
    router.push('/(create)/event-settings');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Créer une sortie',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-4">
              <Icon library="ionicons" name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      >
        {/* Cover Image */}
        <TouchableOpacity
          onPress={pickCoverImage}
          activeOpacity={0.9}
          className="relative"
        >
          {coverImage ? (
            <Image
              source={{ uri: coverImage }}
              style={{ width: '100%', height: 200 }}
              contentFit="cover"
            />
          ) : (
            <View className="w-full h-48 bg-white dark:bg-[#161616] items-center justify-center">
              <Icon library="ionicons" name="image" size={48} color="#52525B" />
              <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mt-2">
                Ajouter une photo de couverture
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View className="px-4 py-6">
          {/* Title */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Titre de votre sortie <Text className="text-[#EF4444]">*</Text>
            </Text>
            <TextInput
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
              placeholder="Ex: Randonnée au Mont Cameroun"
              placeholderTextColor="#A1A1AA"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">Description</Text>
            <TextInput
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
              placeholder="Décrivez votre sortie..."
              placeholderTextColor="#A1A1AA"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={500}
              style={{ minHeight: 100, textAlignVertical: 'top' }}
            />
          </View>

          {/* Location, Date, Time */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
                Lieu <Text className="text-[#EF4444]">*</Text>
              </Text>
              <TextInput
                className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
                placeholder="Lieu"
                placeholderTextColor="#A1A1AA"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">Date</Text>
              <TextInput
                className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
                placeholder="JJ/MM/AAAA"
                placeholderTextColor="#A1A1AA"
                value={date}
                onChangeText={setDate}
              />
            </View>

            <View className="flex-1">
              <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">Heure</Text>
              <TextInput
                className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
                placeholder="HH:MM"
                placeholderTextColor="#A1A1AA"
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>

          {/* Max Participants */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Nombre de participants
            </Text>
            <TextInput
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
              placeholder="20"
              placeholderTextColor="#A1A1AA"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="number-pad"
            />
          </View>

          {/* Share to Feed Toggle */}
          <View className="bg-white dark:bg-[#161616] rounded-xl px-4 py-2 mb-4">
            <Toggle
              label="Partager mon post dans Sortie"
              value={shareToFeed}
              onValueChange={(value) => {
                setShareToFeed(value);
                setEventForm({ share_to_feed: value });
              }}
            />
          </View>

          {/* Warning Message */}
          <View className="bg-[#FEF3C7]/10 border border-[#F59E0B]/30 rounded-xl p-4 mb-6">
            <View className="flex-row items-start">
              <Icon library="ionicons" name="warning" size={20} color="#F59E0B" />
              <Text className="text-[#F59E0B] text-xs ml-2 flex-1 leading-5">
                Rappel : ne partagez pas votre adresse personnelle ni des informations sensibles dans la description publique.
              </Text>
            </View>
          </View>
        </View>

        <View className="h-4" />
      </ScrollView>

      {/* Bottom Buttons */}
      <View className="border-t px-4 py-4" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 bg-[#F4F4F5] dark:bg-[#27272A] rounded-xl py-4 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-[#18181B] dark:text-white text-sm font-semibold">Annuler</Text>
          </TouchableOpacity>
          
          <View className="flex-1">
            <CTAButton
              title="Suivant"
              variant="primary"
              onPress={handleNext}
              disabled={!title || !location}
            />
          </View>
        </View>
      </View>
      </KeyboardAvoidingView>
    </View>
  );
}
