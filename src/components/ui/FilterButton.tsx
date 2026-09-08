import { TouchableOpacity, Text } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export function FilterButton({ label, isActive, onPress }: FilterButtonProps) {
  const colors = useThemeStore((state) => state.colors);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mr-2 rounded-full px-4 py-2"
      style={{ backgroundColor: isActive ? colors.primary : colors.card }}
    >
      <Text
        className="text-sm font-medium"
        style={{ color: isActive ? '#FFFFFF' : colors.textSecondary }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
