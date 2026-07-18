import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

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
  const colors = useThemeStore((state) => state.colors);
  const [showPicker, setShowPicker] = useState(false);

  const selectedRegion = REGIONS.find(region => region.id === value);

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => setShowPicker(!showPicker)}
        disabled={disabled}
        className="flex-row items-center justify-between rounded-xl border px-4 py-3"
        style={{ backgroundColor: colors.elevated, borderColor: error ? colors.primary : colors.border, borderWidth: error ? 2 : 1 }}
      >
        <Text className="text-base" style={{ color: selectedRegion ? colors.text : colors.textMuted }}>
          {selectedRegion ? selectedRegion.label : 'Sélectionnez la région'}
        </Text>
        <Icon name={showPicker ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      {showPicker && (
        <View className="mt-2 max-h-48 rounded-xl border" style={{ backgroundColor: colors.elevated, borderColor: colors.border }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {REGIONS.map((region) => (
              <TouchableOpacity
                key={region.id}
                onPress={() => {
                  onValueChange(region.id);
                  setShowPicker(false);
                }}
                className="border-b px-4 py-3 last:border-b-0"
                style={{ backgroundColor: value === region.id ? `${colors.primary}15` : 'transparent', borderColor: colors.border }}
              >
                <Text className="text-base" style={{ color: value === region.id ? colors.primary : colors.text, fontWeight: value === region.id ? '500' : '400' }}>
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
