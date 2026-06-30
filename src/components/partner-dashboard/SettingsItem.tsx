import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import type { SettingsItem as SettingsItemType } from '@/features/partner-dashboard/types';

interface SettingsItemProps {
  item: SettingsItemType;
  onPress: () => void;
}

export function SettingsItem({ item, onPress }: SettingsItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-4 px-4 bg-[#161616] mb-2 rounded-xl"
      activeOpacity={0.8}
    >
      <View className="flex-row items-center gap-3 flex-1">
        <Icon
          library="ionicons"
          name={item.icon as any}
          size={22}
          color="#A1A1AA"
        />
        <Text className="text-white text-sm flex-1">
          {item.label}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {item.value && (
          <Text className="text-[#A1A1AA] text-sm">
            {item.value}
          </Text>
        )}
        {item.hasArrow && (
          <Icon
            library="ionicons"
            name="chevron-forward"
            size={18}
            color="#52525B"
          />
        )}
      </View>
    </TouchableOpacity>
  );
}
