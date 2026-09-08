import { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/ui/Icon';
import { CTAButton } from '@/components/ui/CTAButton';
import { useThemeStore } from '@/features/theme/theme.store';

export default function PartnerPublicationScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const captionRef = useRef('');

  const pickImage = async (mediaTypes: Array<'images' | 'videos'> = ['images']) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const uris = result.assets.map(asset => asset.uri);
      setSelectedImages(uris);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImages([result.assets[0].uri]);
    }
  };

  const handlePublish = () => {
    console.log('Publishing partner post');
    router.back();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Nouvelle publication',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-4">
              <Icon library="ionicons" name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handlePublish} className="mr-4">
              <Text className="text-[#EF4444] text-base font-semibold">Publier</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always" keyboardDismissMode="none">
        {/* Main Image */}
        <TouchableOpacity
          onPress={() => pickImage(['images'])}
          activeOpacity={0.9}
          className="relative"
        >
          {selectedImages.length > 0 ? (
            <Image
              source={{ uri: selectedImages[0] }}
              style={{ width: '100%', height: 400 }}
              contentFit="cover"
            />
          ) : (
            <View className="h-96 w-full items-center justify-center" style={{ backgroundColor: colors.card }}>
              <Icon library="ionicons" name="images" size={64} color={colors.textSecondary} />
              <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mt-4">
                Créez une publication avec le meilleur contenu
              </Text>
              <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-1">
                avec votre contenu.
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Thumbnails */}
        {selectedImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 py-4"
            contentContainerStyle={{ gap: 8 }}
          >
            {selectedImages.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={{ width: 80, height: 80 }}
                className="rounded-lg"
                contentFit="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* Caption */}
        <View className="px-4 py-4">
          <TextInput
            className="rounded-xl px-4 py-3 text-sm"
            placeholder="Ajoutez une légende..."
            placeholderTextColor={colors.textMuted}
            defaultValue={captionRef.current}
            onChangeText={(value) => { captionRef.current = value; }}
            multiline
            maxLength={500}
            blurOnSubmit={false}
            style={{ minHeight: 100, textAlignVertical: 'top', backgroundColor: colors.card, color: colors.text }}
          />
        </View>

        {/* Action Buttons */}
        <View className="px-4 pb-6">
          <View className="flex-row justify-around rounded-xl py-4" style={{ backgroundColor: colors.card }}>
            <TouchableOpacity
              onPress={() => pickImage(['images', 'videos'])}
              className="items-center flex-1"
              activeOpacity={0.7}
            >
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
                <Icon library="ionicons" name="images" size={24} color="#EF4444" />
              </View>
              <Text className="text-[#18181B] dark:text-white text-xs">Média</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={takePhoto} className="items-center flex-1" activeOpacity={0.7}>
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
                <Icon library="ionicons" name="camera" size={24} color="#EF4444" />
              </View>
              <Text className="text-[#18181B] dark:text-white text-xs">Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => pickImage(['videos'])} className="items-center flex-1" activeOpacity={0.7}>
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
                <Icon library="ionicons" name="videocam" size={24} color="#EF4444" />
              </View>
              <Text className="text-[#18181B] dark:text-white text-xs">Vidéo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => pickImage(['images'])} className="items-center flex-1" activeOpacity={0.7}>
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
                <Icon library="ionicons" name="albums" size={24} color="#EF4444" />
              </View>
              <Text className="text-[#18181B] dark:text-white text-xs">Carrousel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
