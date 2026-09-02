import { View, Text } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';

interface SystemMessageProps {
  message: string;
}

export function SystemMessage({ message }: SystemMessageProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View className="items-center py-2">
      <View className="rounded-2xl px-4 py-2 max-w-[88%]" style={{ backgroundColor: colors.elevated }}>
        <Text className="text-xs text-center" style={{ color: colors.textSecondary }}>
          {message}
        </Text>
      </View>
    </View>
  );
}
