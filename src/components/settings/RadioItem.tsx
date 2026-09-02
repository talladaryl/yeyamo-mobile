import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/features/theme/theme.store';

interface RadioItemProps {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  showBorder?: boolean;
}

export function RadioItem({
  label,
  description,
  selected,
  onPress,
  showBorder = true,
}: RadioItemProps) {
  const colors = useThemeStore((state) => state.colors);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="px-4 py-4"
      style={{ borderTopWidth: showBorder ? 1 : 0, borderColor: colors.border }}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className="flex-1">
          <Text className="text-sm font-medium" style={{ color: colors.text }}>{label}</Text>
          {description && (
            <Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{description}</Text>
          )}
        </View>
        <View className="w-6 h-6 rounded-full border-2 items-center justify-center"
          style={{ borderColor: selected ? colors.primary : colors.textMuted }}
        >
          {selected && (
            <View className="w-3 h-3 rounded-full bg-[#EF4444]" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
