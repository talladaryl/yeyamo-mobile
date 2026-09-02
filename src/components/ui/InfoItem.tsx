import { View, Text } from 'react-native';
import { Icon } from '@/components/ui/Icon';

interface InfoItemProps {
  icon: string;
  iconLibrary?: 'ionicons' | 'material' | 'material-community';
  label: string;
  value: string;
}

export function InfoItem({ icon, iconLibrary = 'ionicons', label, value }: InfoItemProps) {
  return (
    <View className="items-center flex-1">
      <View className="w-12 h-12 bg-white dark:bg-[#161616] rounded-full items-center justify-center mb-2">
        <Icon library={iconLibrary} name={icon} size={20} color="#EF4444" />
      </View>
      <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mb-1">{label}</Text>
      <Text className="text-[#18181B] dark:text-white text-sm font-medium text-center">{value}</Text>
    </View>
  );
}
