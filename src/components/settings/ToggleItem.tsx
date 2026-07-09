import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const borderClass = showBorder ? 'border-t border-[#27272A]' : '';

  return (
    <View className={`px-4 py-4 ${borderClass}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {icon && (
            <View className="w-10 h-10 bg-[#27272A] rounded-full items-center justify-center mr-3">
              <Ionicons name={icon} size={20} color="#EF4444" />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-white font-medium text-sm">{label}</Text>
            {description && (
              <Text className="text-[#A1A1AA] text-xs mt-0.5">{description}</Text>
            )}
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#27272A', true: '#EF4444' }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}
