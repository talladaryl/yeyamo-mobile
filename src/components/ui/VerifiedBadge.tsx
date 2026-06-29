import { View } from 'react-native';
import { Icon } from './Icon';

type VerifiedBadgeProps = {
  size?: number;
};

export function VerifiedBadge({ size = 16 }: VerifiedBadgeProps) {
  return (
    <View className="items-center justify-center">
      <Icon library="material" name="verified" size={size} color="#3B82F6" />
    </View>
  );
}
