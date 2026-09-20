import { useEffect, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { UserSearchCard } from '@/components/social/UserSearchCard';
import { useFollowActions, useUserSearch } from '@/features/social/useSocial';
import { useThemeStore } from '@/features/theme/theme.store';

export default function SearchUsersScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const { data: results = [], isLoading, isError, refetch } = useUserSearch(debouncedQuery);
  const { follow } = useFollowActions();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: true, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerTitle: 'Recherche' }} />
      <View className="border-b px-4 py-3" style={{ borderColor: colors.border }}>
        <View className="flex-row items-center gap-3 rounded-xl px-4 py-2.5" style={{ backgroundColor: colors.card }}>
          <Icon library="ionicons" name="search" size={20} color={colors.textMuted} />
          <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Rechercher des utilisateurs…" placeholderTextColor={colors.textMuted} className="flex-1 text-sm" style={{ color: colors.text }} autoFocus returnKeyType="search" />
          {searchQuery ? <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Effacer la recherche"><Icon library="ionicons" name="close-circle" size={20} color={colors.textMuted} /></TouchableOpacity> : null}
        </View>
      </View>
      <FlatList data={results} keyExtractor={(item) => String(item.id)} keyboardShouldPersistTaps="handled" renderItem={({ item }) => <UserSearchCard user={item} onPress={() => router.push(`/(profile)/${item.username}`)} onFollowPress={() => follow.mutate(item.id)} />} ListHeaderComponent={searchQuery.trim() ? <Text className="px-4 pb-2 pt-4 text-sm font-semibold" style={{ color: colors.textSecondary }}>{results.length} résultat{results.length > 1 ? 's' : ''}</Text> : null} ListEmptyComponent={<View className="items-center px-8 py-20"><Icon library="ionicons" name={isError ? 'cloud-offline-outline' : 'search-outline'} size={48} color={colors.textMuted} /><Text className="mt-4 text-center" style={{ color: colors.textSecondary }}>{isLoading ? 'Recherche…' : isError ? 'La recherche est indisponible.' : searchQuery.trim() ? 'Aucun utilisateur trouvé.' : 'Saisissez un nom ou un identifiant.'}</Text>{isError ? <TouchableOpacity onPress={() => void refetch()} className="mt-4 rounded-xl px-4 py-3" style={{ backgroundColor: colors.primary }}><Text className="font-bold text-white">Réessayer</Text></TouchableOpacity> : null}</View>} />
    </View>
  );
}
