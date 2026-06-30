import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import type { CustomerReview } from '@/features/partner-dashboard/types';

interface ReviewCardProps {
  review: CustomerReview;
  onReply: () => void;
}

export function ReviewCard({ review, onReply }: ReviewCardProps) {
  return (
    <View className="bg-[#161616] rounded-xl p-4 mb-3">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center gap-3 flex-1">
          <Avatar
            uri={review.customer_avatar}
            displayName={review.customer_name}
            size={40}
          />
          <View className="flex-1">
            <Text className="text-white font-semibold text-base">
              {review.customer_name}
            </Text>
            <View className="flex-row items-center gap-2 mt-0.5">
              <View className="flex-row items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon
                    key={i}
                    library="ionicons"
                    name={i < review.rating ? 'star' : 'star-outline'}
                    size={12}
                    color={i < review.rating ? '#F59E0B' : '#52525B'}
                  />
                ))}
              </View>
              <Text className="text-[#A1A1AA] text-xs">
                {review.date}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Text className="text-[#E5E5E5] text-sm mb-2" numberOfLines={3}>
        {review.comment}
      </Text>

      <View className="flex-row items-center justify-between border-t border-[#27272A] pt-3">
        <Text className="text-[#A1A1AA] text-xs">
          {review.establishment}
        </Text>
        <TouchableOpacity
          onPress={onReply}
          className="bg-[#EF4444]/10 px-3 py-1.5 rounded-lg"
          activeOpacity={0.7}
        >
          <Text className="text-[#EF4444] text-xs font-semibold">
            Répondre
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
