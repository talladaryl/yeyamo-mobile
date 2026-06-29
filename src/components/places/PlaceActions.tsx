import { View, TouchableOpacity, Text } from 'react-native';
import { Icon } from '@/components/ui/Icon';

type PlaceActionsProps = {
  onCall?: () => void;
  onDirections?: () => void;
  onWebsite?: () => void;
  onShare?: () => void;
};

export function PlaceActions({ onCall, onDirections, onWebsite, onShare }: PlaceActionsProps) {
  const actions = [
    { icon: 'call', label: 'Appeler', onPress: onCall },
    { icon: 'navigate', label: 'Itinéraire', onPress: onDirections },
    { icon: 'globe-outline', label: 'Site Web', onPress: onWebsite },
    { icon: 'share-outline', label: 'Partager', onPress: onShare },
  ];

  return (
    <View className="flex-row justify-around px-4 py-4 border-t border-b border-[#27272A]">
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          onPress={action.onPress}
          className="items-center"
          activeOpacity={0.7}
        >
          <View className="bg-[#161616] w-12 h-12 rounded-full items-center justify-center mb-1">
            <Icon library="ionicons" name={action.icon} size={22} color="#EF4444" />
          </View>
          <Text className="text-white text-xs">{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
