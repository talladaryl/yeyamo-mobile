import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/ui/Icon';
import { CTAButton } from '@/components/ui/CTAButton';
import { useCreateStore } from '@/features/create/create.store';

export default function CreatePublicationScreen() {
  const router = useRouter();
  const { publicationData, setPublicationData } = useCreateStore();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [caption, setCaption] = useState('');

  const pickImage = async (mediaTypes: Array<'images' | 'videos'> = ['images']) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const uris = result.assets.map(asset => asset.uri);
      setSelectedImages(uris);
      setPublicationData({
        media_urls: uris,
        media_type: result.assets[0]?.type === 'video' ? 'video' : 'image',
      });
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setSelectedImages([uri]);
      setPublicationData({ media_urls: [uri], media_type: 'image' });
    }
  };

  const handlePublish = () => {
    setPublicationData({ caption });
    // TODO: API call to create post
    console.log('Publishing:', publicationData);
    router.back();
  };

  return (
    <View className="flex-1 bg-[#0A0A0A]">
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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
            <View className="w-full h-96 bg-[#161616] items-center justify-center">
              <Icon library="ionicons" name="images" size={64} color="#52525B" />
              <Text className="text-[#A1A1AA] text-sm mt-4">
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
            className="bg-[#161616] text-white rounded-xl px-4 py-3 text-sm"
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
          <View className="flex-row justify-around py-4 bg-[#161616] rounded-xl">
            <TouchableOpacity
              onPress={() => pickImage(['images', 'videos'])}
              className="items-center flex-1"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-[#0A0A0A] rounded-full items-center justify-center mb-2">
                <Icon library="ionicons" name="images" size={24} color="#EF4444" />
              </View>
              <Text className="text-white text-xs">Média</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={takePhoto} className="items-center flex-1" activeOpacity={0.7}>
              <View className="w-12 h-12 bg-[#0A0A0A] rounded-full items-center justify-center mb-2">
                <Icon library="ionicons" name="camera" size={24} color="#EF4444" />
              </View>
              <Text className="text-white text-xs">Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => pickImage(['videos'])} className="items-center flex-1" activeOpacity={0.7}>
              <View className="w-12 h-12 bg-[#0A0A0A] rounded-full items-center justify-center mb-2">
                <Icon library="ionicons" name="videocam" size={24} color="#EF4444" />
              </View>
              <Text className="text-white text-xs">Vidéo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => pickImage(['images'])} className="items-center flex-1" activeOpacity={0.7}>
              <View className="w-12 h-12 bg-[#0A0A0A] rounded-full items-center justify-center mb-2">
                <Icon library="ionicons" name="albums" size={24} color="#EF4444" />
              </View>
              <Text className="text-white text-xs">Carrousel</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#27272A] px-4 py-4">
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
