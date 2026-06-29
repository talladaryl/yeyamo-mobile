import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface GalleryPickerProps {
  label: string;
  values: string[];
  onValuesChange: (uris: string[]) => void;
  minPhotos?: number;
  maxPhotos?: number;
  error?: string;
  disabled?: boolean;
}

export function GalleryPicker({
  label,
  values,
  onValuesChange,
  minPhotos = 3,
  maxPhotos = 10,
  error,
  disabled = false,
}: GalleryPickerProps) {
  const handlePickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newUris = result.assets.map(asset => asset.uri);
        const updatedValues = [...values, ...newUris].slice(0, maxPhotos);
        onValuesChange(updatedValues);
      }
    } catch (error) {
      console.error('Error picking images:', error);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedValues = values.filter((_, i) => i !== index);
    onValuesChange(updatedValues);
  };

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm text-[#A1A1AA] font-medium">
          {label}
        </Text>
        <Text className="text-xs text-[#52525B]">
          {values.length}/{maxPhotos} photos
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
        <View className="flex-row gap-3">
          {/* Add button */}
          <TouchableOpacity
            onPress={handlePickImages}
            disabled={disabled || values.length >= maxPhotos}
            className={`w-24 h-24 border-2 border-dashed rounded-xl items-center justify-center ${
              error ? 'border-[#EF4444]' : 'border-[#27272A]'
            } ${values.length >= maxPhotos ? 'opacity-50' : ''}`}
          >
            <Text className="text-[#EF4444] text-2xl mb-1">+</Text>
            <Text className="text-[#A1A1AA] text-xs">Ajouter</Text>
          </TouchableOpacity>

          {/* Selected images */}
          {values.map((uri, index) => (
            <View key={index} className="relative w-24 h-24">
              <Image
                source={{ uri }}
                className="w-full h-full rounded-xl"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-[#EF4444] rounded-full items-center justify-center"
              >
                <Text className="text-white text-xs font-bold">✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <Text className="text-xs text-[#52525B]">
        Minimum {minPhotos} photos • JPG ou PNG • Max 5 Mo chacune
      </Text>

      {error && (
        <Text className="text-xs text-[#EF4444] mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}