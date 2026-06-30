import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import type { Establishment } from '@/features/partner-dashboard/types';

interface EstablishmentCardProps {
  establishment: Establishment;
  onPress: () => void;
}

export function EstablishmentCard({ establishment, onPress }: EstablishmentCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#161616] rounded-xl overflow-hidden mb-3"
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: establishment.image_url }}
        style={{ width: '100%', height: 140 }}
        contentFit="cover"
      />
      <View className="p-3">
        <Text className="text-white font-semibold text-base mb-1">
          {establishment.name}
        </Text>
        <Text className="text-[#A1A1AA] text-xs mb-2">
          {establishment.category}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Icon library="ionicons" name="star" size={14} color="#F59E0B" />
            <Text className="text-white text-sm font-semibold">
              {establishment.rating}
            </Text>
            <Text className="text-[#A1A1AA] text-xs">
              ({establishment.reviews_count} avis)
            </Text>
          </View>
          <Text className="text-[#A1A1AA] text-xs">
            {establishment.address}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
