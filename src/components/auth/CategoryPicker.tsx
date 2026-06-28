import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface CategoryPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

const CATEGORIES = [
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'hotel', label: 'Hôtel', icon: '🏨' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'tourisme', label: 'Tourisme', icon: '🗺️' },
  { id: 'evenement', label: 'Événement', icon: '🎉' },
  { id: 'commerce', label: 'Commerce', icon: '🛍️' },
  { id: 'sante', label: 'Santé', icon: '🏥' },
  { id: 'education', label: 'Éducation', icon: '🎓' },
  { id: 'autre', label: 'Autre', icon: '📋' },
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
              <Text className="text-base mr-3">{selectedCategory.icon}</Text>
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
        <Text className="text-[#A1A1AA]">
          {showPicker ? '▲' : '▼'}
        </Text>
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
                <Text className="text-base mr-3">{category.icon}</Text>
                <Text className={`text-base ${
                  value === category.id ? 'text-[#EF4444] font-medium' : 'text-[#18181B]'
                }`}>
                  {category.label}
                </Text>
                {value === category.id && (
                  <Text className="text-[#EF4444] ml-auto">✓</Text>
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