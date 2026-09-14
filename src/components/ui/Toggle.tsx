import { Switch, View, Text } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';

interface ToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Toggle({ label, value, onValueChange }: ToggleProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View className="flex-row items-center justify-between py-3">
      <Text className="flex-1 text-sm" style={{ color: colors.text }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}
