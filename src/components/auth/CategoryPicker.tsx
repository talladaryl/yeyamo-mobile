import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

interface CategoryPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

const CATEGORIES = [
  { id: 'restaurant', label: 'Restaurant', icon: 'restaurant-outline' },
  { id: 'hotel', label: 'Hôtel', icon: 'bed-outline' },
  { id: 'transport', label: 'Transport', icon: 'car-outline' },
  { id: 'tourisme', label: 'Tourisme', icon: 'map-outline' },
  { id: 'evenement', label: 'Événement', icon: 'calendar-outline' },
  { id: 'commerce', label: 'Commerce', icon: 'storefront-outline' },
  { id: 'sante', label: 'Santé', icon: 'medkit-outline' },
  { id: 'education', label: 'Éducation', icon: 'school-outline' },
  { id: 'autre', label: 'Autre', icon: 'list-outline' },
];

export function CategoryPicker({
  value,
  onValueChange,
  label = 'Catégorie d\'activité',
  error,
  disabled = false,
}: CategoryPickerProps) {
  const colors = useThemeStore((state) => state.colors);
  const [showPicker, setShowPicker] = useState(false);

  const selectedCategory = CATEGORIES.find(cat => cat.id === value);

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-2 text-sm font-medium" style={{ color: colors.textSecondary }}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => setShowPicker(!showPicker)}
        disabled={disabled}
        className="flex-row items-center justify-between rounded-xl border-2 px-4 py-3"
        style={{ backgroundColor: colors.card, borderColor: error ? colors.primary : colors.border }}
      >
        <View className="flex-row items-center">
          {selectedCategory ? (
            <>
              <View className="mr-3">
                <Icon name={selectedCategory.icon} size={20} color={colors.text} />
              </View>
              <Text className="text-base" style={{ color: colors.text }}>
                {selectedCategory.label}
              </Text>
            </>
          ) : (
            <Text className="text-base" style={{ color: colors.textSecondary }}>
              Sélectionnez une catégorie
            </Text>
          )}
        </View>
        <Icon name={showPicker ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      {showPicker && (
        <View className="mt-2 max-h-48 rounded-xl border shadow-lg" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => {
                  onValueChange(category.id);
                  setShowPicker(false);
                }}
                className="flex-row items-center border-b px-4 py-3 last:border-b-0"
                style={{ borderColor: colors.border, backgroundColor: value === category.id ? `${colors.primary}15` : 'transparent' }}
              >
                <View className="mr-3">
                  <Icon name={category.icon} size={20} color={value === category.id ? colors.primary : colors.text} />
                </View>
                <Text className="text-base" style={{ color: value === category.id ? colors.primary : colors.text, fontWeight: value === category.id ? '500' : '400' }}>
                  {category.label}
                </Text>
                {value === category.id && (
                  <View className="ml-auto">
                    <Icon name="checkmark" size={18} color="#EF4444" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {error && (
        <Text className="text-red-500 text-sm mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
