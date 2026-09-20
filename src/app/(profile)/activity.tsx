import { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { ActivityItem } from '@/components/social/ActivityItem';
import { useNetworkActivity } from '@/features/social/useSocial';
import { useThemeStore } from '@/features/theme/theme.store';

type ActivityFilter = 'all' | 'likes' | 'comments' | 'follows' | 'posts';
const filters: { key: ActivityFilter; label: string; icon: string }[] = [{ key: 'all', label: 'Tout', icon: 'apps' }, { key: 'likes', label: 'Likes', icon: 'heart' }, { key: 'comments', label: 'Commentaires', icon: 'chatbubble' }, { key: 'follows', label: 'Abonnements', icon: 'person-add' }, { key: 'posts', label: 'Publications', icon: 'image' }];

export default function ActivityScreen() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors); const [filter, setFilter] = useState<ActivityFilter>('all'); const { data: activities = [] } = useNetworkActivity(); const filtered = filter === 'all' ? activities : activities.filter((activity) => (filter === 'likes' ? activity.type === 'like' : filter === 'comments' ? activity.type === 'comment' : filter === 'follows' ? activity.type === 'follow' : activity.type === 'post'));
  return <View className="flex-1" style={{ backgroundColor: colors.background }}><View className="border-b px-4 py-4" style={{ borderColor: colors.border }}><Text className="mb-1 text-lg font-bold" style={{ color: colors.text }}>Réseau</Text><Text className="text-sm" style={{ color: colors.textSecondary }}>Activité des personnes que vous suivez</Text></View><View className="border-b" style={{ borderColor: colors.border }}><FlatList horizontal showsHorizontalScrollIndicator={false} data={filters} keyExtractor={(item) => item.key} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }} renderItem={({ item }) => <Filter item={item} active={filter === item.key} onPress={() => setFilter(item.key)} />} /></View><FlatList data={filtered} keyExtractor={(item) => item.id} renderItem={({ item }) => <ActivityItem activity={item} onPress={() => { if (item.post) router.push(`/(post)/${item.post.id}`); else if (item.target_user) router.push(`/(profile)/${item.target_user.username}`); }} onUserPress={() => router.push(`/(profile)/${item.user.username}`)} />} ListEmptyComponent={<View className="items-center justify-center py-12"><Icon library="ionicons" name="notifications-outline" size={64} color={colors.textMuted} /><Text className="mt-4 text-sm" style={{ color: colors.textSecondary }}>Aucune activité récente</Text></View>} /></View>;
}

function Filter({ item, active, onPress }: { item: { label: string; icon: string }; active: boolean; onPress: () => void }) { const colors = useThemeStore((state) => state.colors); return <TouchableOpacity onPress={onPress} className="mr-3 flex-row items-center gap-2 rounded-full px-4 py-2" style={{ backgroundColor: active ? colors.primary : colors.elevated }}><Icon library="ionicons" name={item.icon as any} size={16} color={active ? '#FFFFFF' : colors.textMuted} /><Text className="text-sm font-semibold" style={{ color: active ? '#FFFFFF' : colors.textSecondary }}>{item.label}</Text></TouchableOpacity>; }
