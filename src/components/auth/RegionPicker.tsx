import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface RegionPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

const REGIONS = [
  { id: 'centre', label: 'Centre' },
  { id: 'littoral', label: 'Littoral' },
  { id: 'ouest', label: 'Ouest' },
  { id: 'nord', label: 'Nord' },
  { id: 'extreme-nord', label: 'Extrême-Nord' },
  { id: 'adamaoua', label: 'Adamaoua' },
  { id: 'est', label: 'Est' },
  { id: 'sud', label: 'Sud' },
  { id: 'sud-ouest', label: 'Sud-Ouest' },
  { id: 'nord-ouest', label: 'Nord-Ouest' },
];

export function RegionPicker({
  value,
  onValueChange,
  label = 'Région',
  error,
  disabled = false,
}: RegionPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const selectedRegion = REGIONS.find(region => region.id === value);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm text-[#A1A1AA] font-medium mb-1">
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => setShowPicker(!showPicker)}
        disabled={disabled}
        className={`flex-row items-center justify-between px-4 py-3 rounded-xl ${
          error ? 'border-2 border-[#EF4444]' : 'border border-[#27272A]'
        } bg-[#1F1F1F]`}
      >
        <Text className={selectedRegion ? 'text-white text-base' : 'text-[#52525B] text-base'}>
          {selectedRegion ? selectedRegion.label : 'Sélectionnez la région'}
        </Text>
        <Text className="text-[#A1A1AA]">
          {showPicker ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <View className="mt-2 bg-[#1F1F1F] border border-[#27272A] rounded-xl max-h-48">
          <ScrollView showsVerticalScrollIndicator={false}>
            {REGIONS.map((region) => (
              <TouchableOpacity
                key={region.id}
                onPress={() => {
                  onValueChange(region.id);
                  setShowPicker(false);
                }}
                className={`px-4 py-3 border-b border-[#27272A] last:border-b-0 ${
                  value === region.id ? 'bg-[#EF4444]/10' : ''
                }`}
              >
                <Text className={`text-base ${
                  value === region.id ? 'text-[#EF4444] font-medium' : 'text-white'
                }`}>
                  {region.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {error && (
        <Text className="text-xs text-[#EF4444] mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}