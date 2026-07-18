import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/features/theme/theme.store';

interface ToggleItemProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  showBorder?: boolean;
}

export function ToggleItem({
  icon,
  label,
  description,
  value,
  onValueChange,
  showBorder = true,
}: ToggleItemProps) {
  const colors = useThemeStore((state) => state.colors);

  return (
    <View className="px-4 py-4" style={{ borderTopWidth: showBorder ? 1 : 0, borderColor: colors.border }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {icon && (
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
              <Ionicons name={icon} size={20} color="#EF4444" />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-sm font-medium" style={{ color: colors.text }}>{label}</Text>
            {description && (
              <Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{description}</Text>
            )}
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}
