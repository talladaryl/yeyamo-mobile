import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { StatsRow } from '@/components/ui/StatsRow';
import { CTAButton } from '@/components/ui/CTAButton';
import type { UserProfile } from '@/features/profile/types';

type ProfileHeaderProps = {
  profile: UserProfile;
  onFollowPress: () => void;
  onMessagePress: () => void;
  isOwnProfile?: boolean;
};

export function ProfileHeader({ profile, onFollowPress, onMessagePress, isOwnProfile = false }: ProfileHeaderProps) {
  const router = useRouter();

  return (
    <View className="bg-white dark:bg-[#0A0A0A]">
      {/* Cover photo */}
      {profile.cover_url ? (
        <Image
          source={{ uri: profile.cover_url }}
          style={{ width: '100%', height: 160 }}
          contentFit="cover"
        />
      ) : (
        <View className="w-full h-40 bg-white dark:bg-[#161616]" />
      )}

      {/* Avatar & Info */}
      <View className="px-4 -mt-12">
        <View className="flex-row items-end justify-between mb-3">
          <View className="border-4 border-[#0A0A0A] rounded-full">
            <Avatar
              uri={profile.avatar_url}
              displayName={profile.display_name}
              size={96}
            />
          </View>

          {profile.is_verified && (
            <View className="mb-2">
              <VerifiedBadge size={24} />
            </View>
          )}
        </View>

        {/* Name & Location */}
        <Text className="text-[#18181B] dark:text-white text-2xl font-bold">{profile.display_name}</Text>
        {profile.city && (
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mt-1">{profile.city}</Text>
        )}

        {/* Stats - Cliquables */}
        <View className="flex-row justify-around py-4 -mx-4 border-y border-[#E4E4E7] dark:border-[#27272A] my-4">
          <TouchableOpacity
            onPress={() => {}}
            className="flex-1 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-[#18181B] dark:text-white text-xl font-bold">{profile.posts_count}</Text>
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-0.5">Publications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(profile)/followers')}
            className="flex-1 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-[#18181B] dark:text-white text-xl font-bold">{profile.followers_count}</Text>
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-0.5">Abonnés</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(profile)/following')}
            className="flex-1 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-[#18181B] dark:text-white text-xl font-bold">{profile.following_count}</Text>
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-0.5">Abonnements</Text>
          </TouchableOpacity>
        </View>

        {/* Bio */}
        {profile.bio && (
          <Text className="text-[#18181B] dark:text-white text-sm leading-6 mb-4">{profile.bio}</Text>
        )}

        {/* Action buttons */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <CTAButton
              title={profile.is_following ? 'Abonné' : 'Suivre'}
              variant={profile.is_following ? 'secondary' : 'primary'}
              onPress={onFollowPress}
              fullWidth
            />
          </View>
          <View className="flex-1">
            <CTAButton
              title="Message"
              variant="secondary"
              onPress={onMessagePress}
              fullWidth
            />
          </View>
        </View>
      </View>
    </View>
  );
}
