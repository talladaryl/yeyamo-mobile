import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

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
  const colors = useThemeStore((state) => state.colors);
  const [showPicker, setShowPicker] = useState(false);

  const cities = region ? CITIES_BY_REGION[region] || [] : [];
  const selectedCity = cities.find(city => city.id === value);

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => cities.length > 0 && setShowPicker(!showPicker)}
        disabled={disabled || cities.length === 0}
        className={`flex-row items-center justify-between rounded-xl border px-4 py-3 ${cities.length === 0 ? 'opacity-50' : ''}`}
        style={{ backgroundColor: colors.elevated, borderColor: error ? colors.primary : colors.border, borderWidth: error ? 2 : 1 }}
      >
        <Text className="text-base" style={{ color: selectedCity ? colors.text : colors.textMuted }}>
          {selectedCity ? selectedCity.label : cities.length === 0 ? 'Sélectionnez d\'abord une région' : 'Sélectionnez la ville'}
        </Text>
        {cities.length > 0 && (
          <Icon name={showPicker ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
        )}
      </TouchableOpacity>

      {showPicker && cities.length > 0 && (
        <View className="mt-2 max-h-48 rounded-xl border" style={{ backgroundColor: colors.elevated, borderColor: colors.border }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {cities.map((city) => (
              <TouchableOpacity
                key={city.id}
                onPress={() => {
                  onValueChange(city.id);
                  setShowPicker(false);
                }}
                className="border-b px-4 py-3 last:border-b-0"
                style={{ backgroundColor: value === city.id ? `${colors.primary}15` : 'transparent', borderColor: colors.border }}
              >
                <Text className="text-base" style={{ color: value === city.id ? colors.primary : colors.text, fontWeight: value === city.id ? '500' : '400' }}>
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
