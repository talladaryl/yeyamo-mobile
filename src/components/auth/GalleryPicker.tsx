import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

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
  const colors = useThemeStore((state) => state.colors);
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
        <Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>
          {label} (min. {minPhotos})
        </Text>
      )}

      <TouchableOpacity
        onPress={pickPhotos}
        disabled={disabled}
        className="mb-3 flex-row items-center justify-between rounded-xl border px-4 py-4"
        style={{ backgroundColor: colors.elevated, borderColor: error ? colors.primary : colors.border, borderWidth: error ? 2 : 1 }}
      >
        <View className="flex-1">
          <Text className="mb-1 text-base" style={{ color: colors.textMuted }}>
            Sélectionner plusieurs photos
          </Text>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            JPG ou PNG - Max 5 Mo
          </Text>
        </View>
        <View className="ml-3">
          <Icon name="camera-outline" size={24} color={colors.textSecondary} />
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
