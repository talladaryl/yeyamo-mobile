import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/ViewStates';
import { UserListItem } from '@/components/social/UserListItem';
import { useFollowActions, useFollowing } from '@/features/social/useSocial';
import { useThemeStore } from '@/features/theme/theme.store';

export default function FollowingScreen() { const router = useRouter(); const colors = useThemeStore((state) => state.colors); const [search, setSearch] = useState(''); const query = useFollowing(); const { unfollow } = useFollowActions(); const users = (query.data ?? []).filter((user) => !search || `${user.display_name} ${user.username}`.toLowerCase().includes(search.toLowerCase())); return <View className="flex-1" style={{ backgroundColor: colors.background }}><View className="border-b px-4 py-3" style={{ borderColor: colors.border }}><Input value={search} onChangeText={setSearch} placeholder="Rechercher dans les abonnements…" leftIcon={<Icon library="ionicons" name="search" size={20} color={colors.textMuted} />} /></View>{query.isLoading ? <LoadingState label="Chargement des abonnements…" /> : query.isError ? <ErrorState title="Abonnements indisponibles" retry={() => void query.refetch()} /> : <FlatList data={users} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => <UserListItem user={item} onPress={() => router.push(`/(profile)/${item.username}`)} onFollowPress={() => unfollow.mutate(item.id)} showFollowButton />} ListEmptyComponent={<View className="h-64"><EmptyState title={search ? 'Aucun résultat' : 'Aucun abonnement'} message={search ? 'Aucun abonnement ne correspond à votre recherche.' : 'Les comptes suivis apparaîtront ici.'} icon={<Icon library="ionicons" name="people-outline" size={64} color={colors.textMuted} />} /></View>} />}</View>; }
