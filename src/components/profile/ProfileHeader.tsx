import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { StatsRow } from '@/components/ui/StatsRow';
import { CTAButton } from '@/components/ui/CTAButton';
import type { UserProfile } from '@/features/profile/types';

type ProfileHeaderProps = {
  profile: UserProfile;
  onFollowPress: () => void;
  onMessagePress: () => void;
};

export function ProfileHeader({ profile, onFollowPress, onMessagePress }: ProfileHeaderProps) {
  return (
    <View className="bg-[#0A0A0A]">
      {/* Cover photo */}
      {profile.cover_url ? (
        <Image
          source={{ uri: profile.cover_url }}
          style={{ width: '100%', height: 160 }}
          contentFit="cover"
        />
      ) : (
        <View className="w-full h-40 bg-[#161616]" />
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
        <Text className="text-white text-2xl font-bold">{profile.display_name}</Text>
        {profile.city && (
          <Text className="text-[#A1A1AA] text-sm mt-1">{profile.city}</Text>
        )}

        {/* Stats */}
        <StatsRow
          stats={[
            { label: 'Publications', value: profile.posts_count },
            { label: 'Abonnés', value: profile.followers_count },
            { label: 'Abonnements', value: profile.following_count },
          ]}
        />

        {/* Bio */}
        {profile.bio && (
          <Text className="text-white text-sm leading-6 mb-4">{profile.bio}</Text>
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
