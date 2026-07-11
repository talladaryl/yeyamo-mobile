import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ThemeSelectorProps {
  value: 'light' | 'dark' | 'system';
  onChange: (value: 'light' | 'dark' | 'system') => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const themes: Array<{
    key: 'light' | 'dark' | 'system';
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
  }> = [
    { key: 'light', label: 'Clair', description: 'Interface lumineuse et lisible', icon: 'sunny' },
    { key: 'dark', label: 'Sombre', description: 'Interface sombre et élégante', icon: 'moon' },
    { key: 'system', label: 'Système', description: 'Suit le thème du téléphone', icon: 'phone-portrait' },
  ];

  return (
    <View className="px-4 py-4">
      <Text className="text-white font-medium text-sm mb-3">Thème</Text>
      <View className="gap-3">
        {themes.map((theme) => {
          const isSelected = value === theme.key;
          return (
            <TouchableOpacity
              key={theme.key}
              onPress={() => onChange(theme.key)}
              className="flex-row items-center p-4 rounded-xl border"
              style={{
                backgroundColor: isSelected ? '#EF4444' : '#1F1F1F',
                borderColor: isSelected ? '#EF4444' : '#27272A',
              }}
              activeOpacity={0.7}
            >
              <Ionicons name={theme.icon} size={24} color={isSelected ? '#FFFFFF' : '#A1A1AA'} />
              <View className="flex-1 ml-3">
                <Text className="text-white text-sm font-semibold">{theme.label}</Text>
                <Text className="text-[#A1A1AA] text-xs mt-0.5">{theme.description}</Text>
              </View>
              {isSelected ? <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" /> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
