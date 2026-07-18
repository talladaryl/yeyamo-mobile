import { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/ui/Icon';
import { usePartnerStore } from '@/features/partner/partner.store';

const { width, height } = Dimensions.get('window');

export default function PartnerStoryScreen() {
  const router = useRouter();
  const { storyData, setStoryData } = usePartnerStore();
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [textOverlay, setTextOverlay] = useState('Nouveau menu\npour aujourd\'hui');
  const [locationTag, setLocationTag] = useState('La Falaise Yaounde');
  const [duration, setDuration] = useState(5);
  const [showTextEditor, setShowTextEditor] = useState(false);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelectedMedia(result.assets[0].uri);
      setStoryData({ media_url: result.assets[0].uri, media_type: 'image' });
    }
  };

  const handlePublish = () => {
    setStoryData({
      text_overlay: textOverlay,
      location_tag: locationTag,
    });
    console.log('Publishing partner story:', storyData);
    router.back();
  };

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />

      {/* Full Screen Media */}
      {selectedMedia ? (
        <Image
          source={{ uri: selectedMedia }}
          style={{ width, height }}
          contentFit="cover"
        />
      ) : (
        <TouchableOpacity
          onPress={pickMedia}
          className="flex-1 items-center justify-center bg-white dark:bg-[#0A0A0A]"
          activeOpacity={0.9}
        >
          <Icon library="ionicons" name="camera" size={64} color="#A1A1AA" />
          <Text className="text-[#18181B] dark:text-white text-base mt-4">Appuyez pour ajouter une photo</Text>
        </TouchableOpacity>
      )}

      {/* Text Overlay on Image */}
      {selectedMedia && !showTextEditor && (
        <View className="absolute top-1/3 left-0 right-0 px-8">
          <TouchableOpacity
            onPress={() => setShowTextEditor(true)}
            className="bg-black/40 px-6 py-4 rounded-2xl"
            activeOpacity={0.8}
          >
            <Text className="text-[#18181B] dark:text-white text-2xl font-bold text-center">
              {textOverlay}
            </Text>
          </TouchableOpacity>

          {/* Location Tag */}
          <View className="mt-4 self-center bg-black/60 px-4 py-2 rounded-full flex-row items-center gap-1">
            <Icon library="ionicons" name="location" size={14} color="#FFFFFF" />
            <Text className="text-[#18181B] dark:text-white text-sm font-medium">{locationTag}</Text>
          </View>
        </View>
      )}

      {/* Text Editor Overlay */}
      {showTextEditor && (
        <View className="absolute inset-0 bg-black/80 items-center justify-center px-6">
          <TextInput
            className="text-[#18181B] dark:text-white text-2xl font-bold text-center w-full"
            value={textOverlay}
            onChangeText={setTextOverlay}
            multiline
            placeholder="Votre texte..."
            placeholderTextColor="#A1A1AA"
            autoFocus
          />
          
          <TouchableOpacity
            onPress={() => setShowTextEditor(false)}
            className="mt-6 bg-[#EF4444] px-6 py-3 rounded-full"
            activeOpacity={0.7}
          >
            <Text className="font-semibold text-white">Terminé</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Top Toolbar */}
      {selectedMedia && (
        <View className="absolute top-0 left-0 right-0 pt-12 px-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            >
              <Icon library="ionicons" name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowTextEditor(true)}
                className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
              >
                <Text className="text-[#18181B] dark:text-white font-bold">Aa</Text>
              </TouchableOpacity>

              <TouchableOpacity className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                <Icon library="ionicons" name="color-palette" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                <Icon library="ionicons" name="text" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                <Icon library="ionicons" name="shapes" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                <Icon library="ionicons" name="happy" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                <Icon library="ionicons" name="ellipsis-horizontal" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Actions */}
      {selectedMedia && (
        <View className="absolute bottom-0 left-0 right-0 pb-12 px-4">
          <View className="flex-row items-center justify-between">
            {/* Ta story */}
            <TouchableOpacity
              onPress={handlePublish}
              className="flex-row items-center bg-white/20 px-4 py-3 rounded-full"
              activeOpacity={0.7}
            >
              <View className="w-8 h-8 bg-[#EF4444] rounded-full items-center justify-center mr-2">
                <Icon library="ionicons" name="person" size={16} color="#FFFFFF" />
              </View>
              <Text className="text-[#18181B] dark:text-white text-sm font-semibold">Ta story</Text>
            </TouchableOpacity>

            {/* Abonnés */}
            <TouchableOpacity
              className="flex-row items-center bg-white/20 px-4 py-3 rounded-full"
              activeOpacity={0.7}
            >
              <View className="w-8 h-8 bg-[#10B981] rounded-full items-center justify-center mr-2">
                <Icon library="ionicons" name="people" size={16} color="#FFFFFF" />
              </View>
              <Text className="text-[#18181B] dark:text-white text-sm font-semibold">Abonnés</Text>
            </TouchableOpacity>

            {/* Publish Button */}
            <TouchableOpacity
              onPress={handlePublish}
              className="w-14 h-14 bg-[#EF4444] rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <Icon library="ionicons" name="arrow-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
