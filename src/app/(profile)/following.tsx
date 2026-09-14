import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { UserListItem } from '@/components/social/UserListItem';
import { useFollowActions, useFollowing } from '@/features/social/useSocial';
import { useThemeStore } from '@/features/theme/theme.store';

export default function FollowingScreen() { const router = useRouter(); const colors = useThemeStore((state) => state.colors); const [searchQuery, setSearchQuery] = useState(''); const { data: following = [] } = useFollowing(); const { unfollow } = useFollowActions(); const filtered = searchQuery ? following.filter((user) => user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) || user.username.toLowerCase().includes(searchQuery.toLowerCase())) : following; return <View className="flex-1" style={{ backgroundColor: colors.background }}><View className="border-b px-4 py-3" style={{ borderColor: colors.border }}><Input value={searchQuery} onChangeText={setSearchQuery} placeholder="Rechercher dans les abonnements…" leftIcon={<Icon library="ionicons" name="search" size={20} color={colors.textMuted} />} /></View><FlatList data={filtered} keyExtractor={(item) => item.id.toString()} renderItem={({ item }) => <UserListItem user={item} onPress={() => router.push(`/(profile)/${item.username}`)} onFollowPress={() => unfollow.mutate(item.id)} showFollowButton />} ListEmptyComponent={<View className="items-center justify-center py-12"><Icon library="ionicons" name="people-outline" size={64} color={colors.textMuted} /><Text className="mt-4 text-sm" style={{ color: colors.textSecondary }}>Aucun abonnement</Text></View>} /></View>; }
