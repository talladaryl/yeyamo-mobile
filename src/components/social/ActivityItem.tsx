// Item d'activité du réseau
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import type { ActivityItem as ActivityItemType } from '@/features/social/types';

interface ActivityItemProps {
  activity: ActivityItemType;
  onPress: () => void;
  onUserPress: () => void;
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'À l\'instant';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  return date.toLocaleDateString('fr-FR');
}

function getActivityIcon(type: ActivityItemType['type']) {
  switch (type) {
    case 'like':
      return { name: 'heart', color: '#EF4444' };
    case 'comment':
      return { name: 'chatbubble', color: '#3B82F6' };
    case 'follow':
      return { name: 'person-add', color: '#10B981' };
    case 'post':
      return { name: 'image', color: '#8B5CF6' };
    case 'event':
      return { name: 'calendar', color: '#F59E0B' };
    default:
      return { name: 'notifications', color: '#A1A1AA' };
  }
}

function getActivityText(activity: ActivityItemType): string {
  switch (activity.type) {
    case 'like':
      return 'a aimé une publication';
    case 'comment':
      return 'a commenté une publication';
    case 'follow':
      return `a commencé à suivre ${activity.target_user?.display_name}`;
    case 'post':
      return 'a publié une nouvelle photo';
    case 'event':
      return 'participe à un événement';
    default:
      return 'a une nouvelle activité';
  }
}

export function ActivityItem({ activity, onPress, onUserPress }: ActivityItemProps) {
  const icon = getActivityIcon(activity.type);
  const activityText = getActivityText(activity);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-start px-4 py-3 border-b border-[#27272A]"
      activeOpacity={0.7}
    >
      <View className="relative">
        <TouchableOpacity onPress={onUserPress} activeOpacity={0.7}>
          <Avatar uri={activity.user.avatar_url} displayName={activity.user.display_name} size={48} />
        </TouchableOpacity>
        <View
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center"
          style={{ backgroundColor: '#0A0A0A' }}
        >
          <Icon library="ionicons" name={icon.name as any} size={14} color={icon.color} />
        </View>
      </View>

      <View className="flex-1 ml-3">
        <Text className="text-white text-sm">
          <Text className="font-semibold">{activity.user.display_name}</Text>
          <Text className="text-[#A1A1AA]"> {activityText}</Text>
        </Text>
        {activity.content && (
          <Text className="text-[#A1A1AA] text-sm mt-1" numberOfLines={2}>
            {activity.content}
          </Text>
        )}
        <Text className="text-[#52525B] text-xs mt-1">{getTimeAgo(activity.created_at)}</Text>
      </View>

      {activity.post && (
        <Image
          source={{ uri: activity.post.thumbnail_url }}
          style={{ width: 48, height: 48, borderRadius: 8 }}
          contentFit="cover"
        />
      )}

      {activity.target_user && (
        <Avatar
          uri={activity.target_user.avatar_url}
          displayName={activity.target_user.display_name}
          size={48}
        />
      )}
    </TouchableOpacity>
  );
}
