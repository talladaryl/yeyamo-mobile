import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const borderClass = showBorder ? 'border-t border-[#27272A]' : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-4 ${borderClass}`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className="flex-1">
          <Text className="text-white font-medium text-sm">{label}</Text>
          {description && (
            <Text className="text-[#A1A1AA] text-xs mt-0.5">{description}</Text>
          )}
        </View>
        <View className="w-6 h-6 rounded-full border-2 items-center justify-center"
          style={{ borderColor: selected ? '#EF4444' : '#52525B' }}
        >
          {selected && (
            <View className="w-3 h-3 rounded-full bg-[#EF4444]" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
