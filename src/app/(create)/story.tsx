import { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/ui/Icon';
import { useCreateStore } from '@/features/create/create.store';

const { width, height } = Dimensions.get('window');

export default function CreateStoryScreen() {
  const router = useRouter();
  const { storyData, setStoryData } = useCreateStore();
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [duration, setDuration] = useState(5);

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
    console.log('Publishing story:', storyData);
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
          className="flex-1 items-center justify-center bg-[#0A0A0A]"
          activeOpacity={0.9}
        >
          <Icon library="ionicons" name="camera" size={64} color="#A1A1AA" />
          <Text className="text-white text-base mt-4">Appuyez pour ajouter une photo</Text>
        </TouchableOpacity>
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
              <TouchableOpacity className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                <Text className="text-white font-bold">Aa</Text>
              </TouchableOpacity>

              <TouchableOpacity className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                <Icon library="ionicons" name="brush" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                <Icon library="ionicons" name="happy" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                <Icon library="ionicons" name="ellipsis-horizontal" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Timer */}
          <View className="mt-4 self-center bg-black/50 px-3 py-1.5 rounded-full">
            <Text className="text-white text-sm font-semibold">{duration}s</Text>
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
              <Text className="text-white text-sm font-semibold">Ta story</Text>
            </TouchableOpacity>

            {/* Amis proches */}
            <TouchableOpacity
              className="flex-row items-center bg-white/20 px-4 py-3 rounded-full"
              activeOpacity={0.7}
            >
              <View className="w-8 h-8 bg-[#10B981] rounded-full items-center justify-center mr-2">
                <Icon library="ionicons" name="star" size={16} color="#FFFFFF" />
              </View>
              <Text className="text-white text-sm font-semibold">Amis proches</Text>
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
