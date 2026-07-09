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
    icon: keyof typeof Ionicons.glyphMap;
  }> = [
    { key: 'light', label: 'Clair', icon: 'sunny' },
    { key: 'dark', label: 'Sombre', icon: 'moon' },
    { key: 'system', label: 'Système', icon: 'phone-portrait' },
  ];

  return (
    <View className="px-4 py-4">
      <Text className="text-white font-medium text-sm mb-3">Thème</Text>
      <View className="flex-row gap-3">
        {themes.map((theme) => {
          const isSelected = value === theme.key;
          return (
            <TouchableOpacity
              key={theme.key}
              onPress={() => onChange(theme.key)}
              className="flex-1 items-center py-4 rounded-xl"
              style={{
                backgroundColor: isSelected ? '#EF4444' : '#27272A',
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={theme.icon}
                size={24}
                color={isSelected ? '#FFFFFF' : '#A1A1AA'}
              />
              <Text
                className="text-xs font-medium mt-2"
                style={{ color: isSelected ? '#FFFFFF' : '#A1A1AA' }}
              >
                {theme.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
