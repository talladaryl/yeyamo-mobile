import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/features/theme/theme.store';

interface ThemeSelectorProps {
  value: 'light' | 'dark' | 'system';
  onChange: (value: 'light' | 'dark' | 'system') => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const colors = useThemeStore((state) => state.colors);
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
      <Text className="mb-3 text-sm font-medium" style={{ color: colors.text }}>Thème</Text>
      <View className="gap-3">
        {themes.map((theme) => {
          const isSelected = value === theme.key;
          return (
            <TouchableOpacity
              key={theme.key}
              onPress={() => onChange(theme.key)}
              className="flex-row items-center p-4 rounded-xl border"
              style={{
                backgroundColor: isSelected ? colors.primary : colors.elevated,
                borderColor: isSelected ? colors.primary : colors.border,
              }}
              activeOpacity={0.7}
            >
              <Ionicons name={theme.icon} size={24} color={isSelected ? '#FFFFFF' : colors.textSecondary} />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold" style={{ color: isSelected ? '#FFFFFF' : colors.text }}>{theme.label}</Text>
                <Text className="mt-0.5 text-xs" style={{ color: isSelected ? '#FEE2E2' : colors.textSecondary }}>{theme.description}</Text>
              </View>
              {isSelected ? <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" /> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
