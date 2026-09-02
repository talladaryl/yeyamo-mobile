import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

interface DocumentPickerProps {
  value: string | null;
  onValueChange: (uri: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  acceptedFormats?: string;
  maxSize?: string;
}

export function DocumentPicker({
  value,
  onValueChange,
  label = 'Document',
  error,
  disabled = false,
  acceptedFormats = 'PDF, JPG ou PNG - Max 5 Mo',
  maxSize,
}: DocumentPickerProps) {
  const colors = useThemeStore((state) => state.colors);
  const helperText = maxSize ? `${acceptedFormats} - Max ${maxSize}` : acceptedFormats;
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
        <Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={pickDocument}
        disabled={disabled}
        className="flex-row items-center justify-between rounded-xl border px-4 py-4"
        style={{ backgroundColor: colors.elevated, borderColor: error ? colors.primary : colors.border, borderWidth: error ? 2 : 1 }}
      >
        <View className="flex-1">
          {value ? (
            <Text className="text-base" style={{ color: colors.text }} numberOfLines={1}>
              Document sélectionné
            </Text>
          ) : (
            <View>
              <Text className="mb-1 text-base" style={{ color: colors.textMuted }}>
                Télécharger le document
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                {helperText}
              </Text>
            </View>
          )}
        </View>
        <View className="ml-3">
          <Icon name="cloud-upload-outline" size={24} color={colors.textSecondary} />
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
