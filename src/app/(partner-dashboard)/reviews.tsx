import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { ReviewCard } from '@/components/partner-dashboard/ReviewCard';
import { customerReviews } from '@/features/partner-dashboard/mockData';

export default function ReviewsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleReply = (reviewId: string) => {
    console.log('Reply to review:', reviewId);
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0A0A0A]">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="px-4 pt-3 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Icon library="ionicons" name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text className="text-[#18181B] dark:text-white text-2xl font-bold">AVIS CLIENTS</Text>
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm">Consultez et répondez aux avis</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {customerReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onReply={() => handleReply(review.id)}
          />
        ))}

        <TouchableOpacity
          className="bg-white dark:bg-[#161616] rounded-xl p-4 mb-6 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-[#EF4444] font-semibold">Voir tous les avis</Text>
        </TouchableOpacity>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
