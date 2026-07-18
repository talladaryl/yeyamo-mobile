import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NavigationItemProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  description?: string;
  onPress: () => void;
  showBorder?: boolean;
  iconColor?: string;
  destructive?: boolean;
}

export function NavigationItem({
  icon,
  label,
  value,
  description,
  onPress,
  showBorder = true,
  iconColor = '#EF4444',
  destructive = false,
}: NavigationItemProps) {
  const borderClass = showBorder ? 'border-t border-[#E4E4E7] dark:border-[#27272A]' : '';
  const textClass = destructive ? 'text-[#EF4444]' : 'text-[#18181B] dark:text-white';

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-4 ${borderClass}`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {icon && (
          <View className="w-10 h-10 bg-[#F4F4F5] dark:bg-[#27272A] rounded-full items-center justify-center mr-3">
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
        )}
        <View className="flex-1">
          <Text className={`font-medium text-sm ${textClass}`}>{label}</Text>
          {description && (
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-0.5">{description}</Text>
          )}
        </View>
        {value && <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mr-2">{value}</Text>}
        <Ionicons name="chevron-forward" size={18} color="#52525B" />
      </View>
    </TouchableOpacity>
  );
}
