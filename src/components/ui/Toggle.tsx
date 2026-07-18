import { Switch, View, Text } from 'react-native';

interface ToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Toggle({ label, value, onValueChange }: ToggleProps) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <Text className="text-[#18181B] dark:text-white text-sm flex-1">{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#27272A', true: '#EF4444' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#27272A"
      />
    </View>
  );
}
