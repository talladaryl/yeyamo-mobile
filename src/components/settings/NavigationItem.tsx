import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/features/theme/theme.store';

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

export function NavigationItem({ icon, label, value, description, onPress, showBorder = true, iconColor, destructive = false }: NavigationItemProps) {
  const colors = useThemeStore((state) => state.colors);
  const resolvedIconColor = iconColor ?? colors.primary;
  return <TouchableOpacity onPress={onPress} className="px-4 py-4" style={{ borderTopWidth: showBorder ? 1 : 0, borderColor: colors.border }} activeOpacity={0.7} accessibilityRole="button"><View className="flex-row items-center">{icon ? <View className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Ionicons name={icon} size={20} color={resolvedIconColor} /></View> : null}<View className="flex-1"><Text className="text-sm font-medium" style={{ color: destructive ? colors.primary : colors.text }}>{label}</Text>{description ? <Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{description}</Text> : null}</View>{value ? <Text className="mr-2 text-sm" style={{ color: colors.textSecondary }}>{value}</Text> : null}<Ionicons name="chevron-forward" size={18} color={colors.textMuted} /></View></TouchableOpacity>;
}
