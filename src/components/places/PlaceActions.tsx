import { View, TouchableOpacity, Text } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

type PlaceActionsProps = {
  onCall?: () => void;
  onDirections?: () => void;
  onWebsite?: () => void;
  onShare?: () => void;
};

export function PlaceActions({ onCall, onDirections, onWebsite, onShare }: PlaceActionsProps) {
  const colors = useThemeStore((state) => state.colors);
  const actions = [
    { icon: 'call', label: 'Appeler', onPress: onCall },
    { icon: 'navigate', label: 'Itinéraire', onPress: onDirections },
    { icon: 'globe-outline', label: 'Site Web', onPress: onWebsite },
    { icon: 'share-outline', label: 'Partager', onPress: onShare },
  ];

  return (
    <View className="flex-row justify-around border-y px-4 py-4" style={{ borderColor: colors.border }}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          onPress={action.onPress}
          className="items-center"
          activeOpacity={0.7}
        >
          <View className="mb-1 h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
            <Icon library="ionicons" name={action.icon} size={22} color="#EF4444" />
          </View>
          <Text className="text-xs" style={{ color: colors.text }}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
