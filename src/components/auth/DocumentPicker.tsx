import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface DocumentPickerProps {
  value: string | null;
  onValueChange: (uri: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  acceptedFormats?: string;
}

export function DocumentPicker({
  value,
  onValueChange,
  label = 'Document',
  error,
  disabled = false,
  acceptedFormats = 'PDF, JPG ou PNG - Max 5 Mo',
}: DocumentPickerProps) {
  const pickDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onValueChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm text-[#A1A1AA] font-medium mb-1">
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={pickDocument}
        disabled={disabled}
        className={`flex-row items-center justify-between px-4 py-4 rounded-xl ${
          error ? 'border-2 border-[#EF4444]' : 'border border-[#27272A]'
        } bg-[#1F1F1F]`}
      >
        <View className="flex-1">
          {value ? (
            <Text className="text-white text-base" numberOfLines={1}>
              Document sélectionné
            </Text>
          ) : (
            <View>
              <Text className="text-[#52525B] text-base mb-1">
                Télécharger le document
              </Text>
              <Text className="text-[#A1A1AA] text-xs">
                {acceptedFormats}
              </Text>
            </View>
          )}
        </View>
        <View className="ml-3">
          <Text className="text-2xl">📤</Text>
        </View>
      </TouchableOpacity>

      {error && (
        <Text className="text-xs text-[#EF4444] mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}