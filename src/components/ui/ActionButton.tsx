import { TouchableOpacity, Text, View } from 'react-native';
import { Icon } from './Icon';

type ActionButtonProps = {
  icon: string;
  iconLibrary?: 'ionicons' | 'material' | 'material-community' | 'feather';
  label?: string;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'filled';
};

const sizeMap = {
  small: { container: 32, icon: 18, text: 'text-xs' },
  medium: { container: 40, icon: 22, text: 'text-sm' },
  large: { container: 48, icon: 26, text: 'text-base' },
};

export function ActionButton({
  icon,
  iconLibrary = 'ionicons',
  label,
  onPress,
  size = 'medium',
  variant = 'default',
}: ActionButtonProps) {
  const config = sizeMap[size];
  const bgClass = variant === 'filled' ? 'bg-[#27272A]' : 'bg-transparent';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center gap-1"
      activeOpacity={0.7}
    >
      <View
        className={`${bgClass} rounded-full items-center justify-center`}
        style={{ width: config.container, height: config.container }}
      >
        <Icon library={iconLibrary} name={icon} size={config.icon} color="#FFFFFF" />
      </View>
      {label && (
        <Text className={`text-white ${config.text} font-medium`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
