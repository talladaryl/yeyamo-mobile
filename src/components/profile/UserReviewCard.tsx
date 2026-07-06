// Carte d'avis utilisateur
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { UserReview } from '@/features/profile/types';

interface UserReviewCardProps {
  review: UserReview;
  onPress: () => void;
}

export function UserReviewCard({ review, onPress }: UserReviewCardProps) {
  const formattedDate = new Date(review.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#161616] rounded-xl p-4 mb-3"
      activeOpacity={0.7}
    >
      <View className="flex-row items-start mb-3">
        <Image
          source={{ uri: review.place.cover_photo_url }}
          className="w-16 h-16 rounded-lg"
          resizeMode="cover"
        />

        <View className="flex-1 ml-3">
          <Text className="text-white font-semibold text-base" numberOfLines={1}>
            {review.place.name}
          </Text>
          <View className="flex-row items-center mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= review.rating ? 'star' : 'star-outline'}
                size={14}
                color={star <= review.rating ? '#F59E0B' : '#52525B'}
              />
            ))}
            <Text className="text-[#F59E0B] text-sm ml-2 font-semibold">
              {review.rating.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>

      <Text className="text-[#A1A1AA] text-sm" numberOfLines={3}>
        {review.comment}
      </Text>

      <View className="flex-row items-center justify-between mt-3">
        <Text className="text-[#52525B] text-xs">{formattedDate}</Text>
        {review.helpful_count > 0 && (
          <View className="flex-row items-center">
            <Ionicons name="thumbs-up-outline" size={12} color="#52525B" />
            <Text className="text-[#52525B] text-xs ml-1">
              {review.helpful_count} utile{review.helpful_count > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
