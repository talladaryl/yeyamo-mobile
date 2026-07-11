import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/ui/Icon';

interface GalleryPickerProps {
  value?: string[];
  values?: string[];
  onValueChange?: (uris: string[]) => void;
  onValuesChange?: (uris: string[]) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  minPhotos?: number;
}

export function GalleryPicker({
  value,
  values,
  onValueChange,
  onValuesChange,
  label = 'Galerie photos',
  error,
  disabled = false,
  minPhotos = 3,
}: GalleryPickerProps) {
  const selectedValues = value ?? values ?? [];
  const handleValueChange = onValueChange ?? onValuesChange;

  const pickPhotos = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const uris = result.assets.map(asset => asset.uri);
        handleValueChange?.([...selectedValues, ...uris]);
      }
    } catch (error) {
      console.error('Error picking photos:', error);
    }
  };

  const removePhoto = (index: number) => {
    const newValue = selectedValues.filter((_, i) => i !== index);
    handleValueChange?.(newValue);
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm text-[#A1A1AA] font-medium mb-1">
          {label} (min. {minPhotos})
        </Text>
      )}

      <TouchableOpacity
        onPress={pickPhotos}
        disabled={disabled}
        className={`flex-row items-center justify-between px-4 py-4 rounded-xl ${
          error ? 'border-2 border-[#EF4444]' : 'border border-[#27272A]'
        } bg-[#1F1F1F] mb-3`}
      >
        <View className="flex-1">
          <Text className="text-[#52525B] text-base mb-1">
            Sélectionner plusieurs photos
          </Text>
          <Text className="text-[#A1A1AA] text-xs">
            JPG ou PNG - Max 5 Mo
          </Text>
        </View>
        <View className="ml-3">
          <Icon name="camera-outline" size={24} color="#A1A1AA" />
        </View>
      </TouchableOpacity>

      {selectedValues.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row gap-2"
        >
          {selectedValues.map((uri, index) => (
            <View key={index} className="relative mr-2">
              <Image
                source={{ uri }}
                className="w-20 h-20 rounded-lg"
                style={{ width: 80, height: 80 }}
              />
              <TouchableOpacity
                onPress={() => removePhoto(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-[#EF4444] rounded-full items-center justify-center"
              >
                <Icon name="close" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {error && (
        <Text className="text-xs text-[#EF4444] mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
