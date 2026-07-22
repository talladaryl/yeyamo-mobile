import { useEffect, useState } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/ui/Icon';
import { CTAButton } from '@/components/ui/CTAButton';
import { useCreateStore } from '@/features/create/create.store';

export default function CreatePublicationScreen() {
  const router = useRouter();
  const { publicationData, setPublicationData } = useCreateStore();
  const [selectedImages, setSelectedImages] = useState<string[]>(publicationData.media_urls ?? []);
  const [caption, setCaption] = useState(publicationData.caption ?? '');

  const applyAssets = (assets: ImagePicker.ImagePickerAsset[]) => {
    if (!assets.length) return;
    const uris = assets.map((asset) => asset.uri);
    setSelectedImages(uris);
    setPublicationData({
      media_urls: uris,
      media_type: assets[0]?.type === 'video' ? 'video' : 'image',
    });
  };

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    ImagePicker.getPendingResultAsync().then((pending) => {
      if (pending && 'canceled' in pending && !pending.canceled && pending.assets) applyAssets(pending.assets);
    }).catch(() => undefined);
  }, []);

  const pickImage = async (mediaTypes: Array<'images' | 'videos'> = ['images']) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Accès aux photos requis', 'Autorisez Yeyamo à accéder à vos photos et vidéos dans les réglages de l’iPhone.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.9,
      });
      if (!result.canceled && result.assets) applyAssets(result.assets);
    } catch {
      Alert.alert('Ajout impossible', 'Le sélecteur de médias n’a pas pu être ouvert. Réessayez.');
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Accès à la caméra requis', 'Autorisez Yeyamo à utiliser la caméra dans les réglages.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.9 });
      if (!result.canceled && result.assets) applyAssets(result.assets);
    } catch {
      Alert.alert('Caméra indisponible', 'La caméra n’a pas pu être ouverte.');
    }
  };

  const handlePublish = () => {
    setPublicationData({ caption });
    // TODO: API call to create post
    console.log('Publishing:', publicationData);
    router.back();
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Nouvelle publication',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-4">
              <Icon library="ionicons" name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
        {/* Main Image Area */}
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
            <View className="w-full h-96 bg-white dark:bg-[#161616] items-center justify-center">
              <Icon library="ionicons" name="images" size={64} color="#52525B" />
              <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mt-4">
                Appuyez pour ajouter des photos
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Carousel Thumbnails */}
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
            className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm"
            placeholder="Ajoutez une légende..."
            placeholderTextColor="#A1A1AA"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />
        </View>

        {/* Action Buttons */}
        <View className="px-4 pb-6">
          <View className="flex-row justify-around py-4 bg-white dark:bg-[#161616] rounded-xl">
            <TouchableOpacity
              onPress={() => pickImage(['images', 'videos'])}
              className="items-center flex-1"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-white dark:bg-[#0A0A0A] rounded-full items-center justify-center mb-2">
                <Icon library="ionicons" name="images" size={24} color="#EF4444" />
              </View>
              <Text className="text-[#18181B] dark:text-white text-xs">Média</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={takePhoto} className="items-center flex-1" activeOpacity={0.7}>
              <View className="w-12 h-12 bg-white dark:bg-[#0A0A0A] rounded-full items-center justify-center mb-2">
                <Icon library="ionicons" name="camera" size={24} color="#EF4444" />
              </View>
              <Text className="text-[#18181B] dark:text-white text-xs">Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => pickImage(['videos'])} className="items-center flex-1" activeOpacity={0.7}>
              <View className="w-12 h-12 bg-white dark:bg-[#0A0A0A] rounded-full items-center justify-center mb-2">
                <Icon library="ionicons" name="videocam" size={24} color="#EF4444" />
              </View>
              <Text className="text-[#18181B] dark:text-white text-xs">Vidéo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => pickImage(['images'])} className="items-center flex-1" activeOpacity={0.7}>
              <View className="w-12 h-12 bg-white dark:bg-[#0A0A0A] rounded-full items-center justify-center mb-2">
                <Icon library="ionicons" name="albums" size={24} color="#EF4444" />
              </View>
              <Text className="text-[#18181B] dark:text-white text-xs">Carrousel</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0A0A0A] border-t border-[#E4E4E7] dark:border-[#27272A] px-4 py-4">
        <CTAButton
          title="Publier"
          variant="primary"
          onPress={handlePublish}
          disabled={selectedImages.length === 0}
        />
      </View>
    </View>
  );
}
