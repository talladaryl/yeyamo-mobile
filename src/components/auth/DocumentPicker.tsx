import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface DocumentPickerProps {
  label: string;
  value: string | null;
  onValueChange: (uri: string) => void;
  acceptedFormats?: string;
  maxSize?: string;
  error?: string;
  disabled?: boolean;
}

export function DocumentPicker({
  label,
  value,
  onValueChange,
  acceptedFormats = 'PDF, JPG ou PNG',
  maxSize = '5 Mo',
  error,
  disabled = false,
}: DocumentPickerProps) {
  const handlePickDocument = async () => {
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
      <Text className="text-sm text-[#A1A1AA] font-medium mb-2">
        {label}
      </Text>
      
      <TouchableOpacity
        onPress={handlePickDocument}
        disabled={disabled}
        className={`border-2 border-dashed rounded-xl p-4 ${
          error ? 'border-[#EF4444]' : 'border-[#27272A]'
        } ${value ? 'bg-[#1F1F1F]' : 'bg-transparent'}`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            {value ? (
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-[#EF4444]/20 rounded-lg items-center justify-center mr-3">
                  <Text className="text-[#EF4444] text-lg">📄</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-sm font-medium">
                    Document sélectionné
                  </Text>
                  <Text className="text-[#A1A1AA] text-xs">
                    {acceptedFormats} • Max {maxSize}
                  </Text>
                </View>
              </View>
            ) : (
              <View>
                <Text className="text-[#A1A1AA] text-sm mb-1">
                  Cliquez pour télécharger
                </Text>
                <Text className="text-[#52525B] text-xs">
                  {acceptedFormats} • Max {maxSize}
                </Text>
              </View>
            )}
          </View>
          
          <View className="w-10 h-10 bg-[#EF4444]/10 rounded-full items-center justify-center ml-3">
            <Text className="text-[#EF4444] text-lg">📤</Text>
          </View>
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