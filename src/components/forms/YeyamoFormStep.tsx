import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';

type YeyamoFormStepProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function YeyamoFormStep({ title, description, children }: YeyamoFormStepProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View className="px-4 pt-5">
      <Text className="text-xl font-extrabold" style={{ color: colors.text }}>{title}</Text>
      {description ? <Text className="mt-2 text-sm leading-5" style={{ color: colors.textSecondary }}>{description}</Text> : null}
      <View className="mt-6">{children}</View>
    </View>
  );
}
