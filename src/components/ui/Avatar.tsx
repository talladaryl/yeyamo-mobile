import { View, Text } from 'react-native';
import { Image } from 'expo-image';

interface AvatarProps {
  uri: string | null;
  displayName: string;
  size?: number;
  className?: string;
}

export function Avatar({ uri, displayName, size = 40, className = '' }: AvatarProps) {
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        className={className}
        transition={200}
      />
    );
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={`bg-[#7C3AED] items-center justify-center ${className}`}
    >
      <Text style={{ fontSize: size * 0.36 }} className="text-white font-semibold">
        {initials}
      </Text>
    </View>
  );
}
