import { Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const borderClass = showBorder ? 'border-b border-[#27272A]' : '';
  const textClass = destructive ? 'text-[#EF4444]' : 'text-white';
  const iconColor = destructive ? '#EF4444' : '#A1A1AA';

  return (
    <TouchableOpacity
      onPress={type === 'toggle' ? undefined : onPress}
      disabled={type === 'toggle' && !onToggle}
      className={`flex-row items-center px-4 py-4 ${borderClass}`}
      activeOpacity={0.7}
    >
      <Ionicons name={icon as any} size={20} color={iconColor} />
      <Text className={`flex-1 text-base font-medium ml-3 ${textClass}`}>
        {label}
      </Text>

      {type === 'toggle' ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: '#27272A', true: '#EF4444' }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <>
          {value ? <Text className="text-[#A1A1AA] text-sm mr-2">{value}</Text> : null}
          {type === 'navigation' ? (
            <Ionicons name="chevron-forward" size={18} color="#52525B" />
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
}
