import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Icon } from '@/components/ui/Icon';

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
  const [showPicker, setShowPicker] = useState(false);

  const selectedCategory = CATEGORIES.find(cat => cat.id === value);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-[#374151] text-sm font-medium mb-2">
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => setShowPicker(!showPicker)}
        disabled={disabled}
        className={`flex-row items-center justify-between px-4 py-3 border-2 rounded-xl ${
          error ? 'border-red-500' : 'border-[#E4E4E7]'
        } bg-white`}
      >
        <View className="flex-row items-center">
          {selectedCategory ? (
            <>
              <View className="mr-3">
                <Icon name={selectedCategory.icon} size={20} color="#18181B" />
              </View>
              <Text className="text-[#18181B] text-base">
                {selectedCategory.label}
              </Text>
            </>
          ) : (
            <Text className="text-[#A1A1AA] text-base">
              Sélectionnez une catégorie
            </Text>
          )}
        </View>
        <Icon name={showPicker ? 'chevron-up' : 'chevron-down'} size={18} color="#A1A1AA" />
      </TouchableOpacity>

      {showPicker && (
        <View className="mt-2 bg-white border border-[#E4E4E7] rounded-xl shadow-lg max-h-48">
          <ScrollView showsVerticalScrollIndicator={false}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => {
                  onValueChange(category.id);
                  setShowPicker(false);
                }}
                className={`flex-row items-center px-4 py-3 border-b border-[#F4F4F5] last:border-b-0 ${
                  value === category.id ? 'bg-[#EF4444]/10' : ''
                }`}
              >
                <View className="mr-3">
                  <Icon name={category.icon} size={20} color={value === category.id ? '#EF4444' : '#18181B'} />
                </View>
                <Text className={`text-base ${
                  value === category.id ? 'text-[#EF4444] font-medium' : 'text-[#18181B]'
                }`}>
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
