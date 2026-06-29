import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface CityPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  region: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

const CITIES_BY_REGION: Record<string, { id: string; label: string }[]> = {
  centre: [
    { id: 'yaounde', label: 'Yaoundé' },
    { id: 'mfou', label: 'Mfou' },
    { id: 'mbalmayo', label: 'Mbalmayo' },
  ],
  littoral: [
    { id: 'douala', label: 'Douala' },
    { id: 'edea', label: 'Édéa' },
    { id: 'nkongsamba', label: 'Nkongsamba' },
  ],
  ouest: [
    { id: 'bafoussam', label: 'Bafoussam' },
    { id: 'dschang', label: 'Dschang' },
    { id: 'mbouda', label: 'Mbouda' },
  ],
  nord: [
    { id: 'garoua', label: 'Garoua' },
    { id: 'ngaoundere', label: 'Ngaoundéré' },
  ],
};

export function CityPicker({
  value,
  onValueChange,
  region,
  label = 'Ville',
  error,
  disabled = false,
}: CityPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const cities = region ? CITIES_BY_REGION[region] || [] : [];
  const selectedCity = cities.find(city => city.id === value);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm text-[#A1A1AA] font-medium mb-1">
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => cities.length > 0 && setShowPicker(!showPicker)}
        disabled={disabled || cities.length === 0}
        className={`flex-row items-center justify-between px-4 py-3 rounded-xl ${
          error ? 'border-2 border-[#EF4444]' : 'border border-[#27272A]'
        } bg-[#1F1F1F] ${cities.length === 0 ? 'opacity-50' : ''}`}
      >
        <Text className={selectedCity ? 'text-white text-base' : 'text-[#52525B] text-base'}>
          {selectedCity ? selectedCity.label : cities.length === 0 ? 'Sélectionnez d\'abord une région' : 'Sélectionnez la ville'}
        </Text>
        {cities.length > 0 && (
          <Text className="text-[#A1A1AA]">
            {showPicker ? '▲' : '▼'}
          </Text>
        )}
      </TouchableOpacity>

      {showPicker && cities.length > 0 && (
        <View className="mt-2 bg-[#1F1F1F] border border-[#27272A] rounded-xl max-h-48">
          <ScrollView showsVerticalScrollIndicator={false}>
            {cities.map((city) => (
              <TouchableOpacity
                key={city.id}
                onPress={() => {
                  onValueChange(city.id);
                  setShowPicker(false);
                }}
                className={`px-4 py-3 border-b border-[#27272A] last:border-b-0 ${
                  value === city.id ? 'bg-[#EF4444]/10' : ''
                }`}
              >
                <Text className={`text-base ${
                  value === city.id ? 'text-[#EF4444] font-medium' : 'text-white'
                }`}>
                  {city.label}
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