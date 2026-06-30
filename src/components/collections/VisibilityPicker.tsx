// Sélecteur de visibilité pour une collection
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VISIBILITY_OPTIONS } from '@/features/collections/types';
import type { Collection } from '@/features/collections/types';

interface VisibilityPickerProps {
  value: Collection['visibility'];
  onChange: (value: Collection['visibility']) => void;
}

export function VisibilityPicker({ value, onChange }: VisibilityPickerProps) {
  return (
    <View>
      <Text className="text-white font-semibold text-base mb-3">Visibilité</Text>
      {VISIBILITY_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          className="flex-row items-center py-3 border-b border-[#27272A]"
          activeOpacity={0.7}
        >
          <View className="w-10 h-10 rounded-full bg-[#27272A] items-center justify-center mr-3">
            <Ionicons name={option.icon as any} size={20} color="#EF4444" />
          </View>

          <View className="flex-1">
            <Text className="text-white font-medium text-base">{option.label}</Text>
            <Text className="text-[#A1A1AA] text-sm">{option.description}</Text>
          </View>

          <View
            className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              value === option.value ? 'border-[#EF4444] bg-[#EF4444]' : 'border-[#52525B]'
            }`}
          >
            {value === option.value && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
