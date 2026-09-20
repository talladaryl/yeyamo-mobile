import { Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import type { FollowUser } from '@/features/social/types';
import { useThemeStore } from '@/features/theme/theme.store';

type Props = { user: FollowUser; onPress: () => void; onFollowPress: () => void; onRemovePress?: () => void; showFollowButton?: boolean; showRemoveButton?: boolean };
export function UserListItem({ user, onPress, onFollowPress, onRemovePress, showFollowButton = true, showRemoveButton = false }: Props) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="flex-row items-center border-b px-4 py-3" style={{ borderColor: colors.border }} activeOpacity={0.7}><Avatar uri={user.avatar_url} displayName={user.display_name} size={52} /><View className="ml-3 flex-1"><View className="flex-row items-center gap-1"><Text className="text-base font-semibold" style={{ color: colors.text }}>{user.display_name}</Text>{user.is_verified ? <Icon library="ionicons" name="checkmark-circle" size={16} color={colors.primary} /> : null}</View><Text className="text-sm" style={{ color: colors.textSecondary }}>@{user.username}</Text>{user.city ? <View className="mt-1 flex-row items-center gap-1"><Icon name="location-outline" size={12} color={colors.textMuted} /><Text className="text-xs" style={{ color: colors.textMuted }}>{user.city}</Text></View> : null}</View>{showFollowButton ? <TouchableOpacity onPress={onFollowPress} className="rounded-full px-4 py-2" style={{ backgroundColor: user.is_following ? colors.elevated : colors.primary }} accessibilityRole="button"><Text className="text-sm font-semibold" style={{ color: user.is_following ? colors.text : '#FFFFFF' }}>{user.is_following ? 'Abonné' : 'Suivre'}</Text></TouchableOpacity> : null}{showRemoveButton && onRemovePress ? <TouchableOpacity onPress={onRemovePress} className="ml-2 rounded-full px-4 py-2" style={{ backgroundColor: colors.elevated }} accessibilityRole="button"><Text className="text-sm font-semibold" style={{ color: colors.text }}>Retirer</Text></TouchableOpacity> : null}</TouchableOpacity>;
}
