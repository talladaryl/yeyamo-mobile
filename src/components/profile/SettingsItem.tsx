import { Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/features/theme/theme.store';

interface SettingsItemProps {
  icon: string;
  label: string;
  value?: string;
  type?: 'navigation' | 'toggle' | 'text';
  onPress?: () => void;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
  showBorder?: boolean;
}

export function SettingsItem({
  icon,
  label,
  value,
  type = 'navigation',
  onPress,
  toggleValue = false,
  onToggle,
  destructive = false,
  showBorder = true,
}: SettingsItemProps) {
  const colors = useThemeStore((state) => state.colors);
  const iconColor = destructive ? colors.primary : colors.textSecondary;

  return (
    <TouchableOpacity
      onPress={type === 'toggle' ? undefined : onPress}
      disabled={type === 'toggle' && !onToggle}
      className="flex-row items-center px-4 py-4"
      style={{ borderBottomWidth: showBorder ? 1 : 0, borderBottomColor: colors.border }}
      activeOpacity={0.7}
    >
      <Ionicons name={icon as any} size={20} color={iconColor} />
      <Text className="ml-3 flex-1 text-base font-medium" style={{ color: destructive ? colors.primary : colors.text }}>
        {label}
      </Text>

      {type === 'toggle' ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <>
          {value ? <Text className="mr-2 text-sm" style={{ color: colors.textSecondary }}>{value}</Text> : null}
          {type === 'navigation' ? (
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
}
