import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useCreateConversation } from '@/features/chat/useChat';
import { useAuth } from '@/features/auth/useAuth';
import { useUserSearch } from '@/features/social/useSocial';
import { useThemeStore } from '@/features/theme/theme.store';

export default function NewConversationScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [search, setSearch] = useState('');
  const [openingUserId, setOpeningUserId] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading } = useUserSearch(search);
  const createConversation = useCreateConversation();

  const startConversation = async (recipientAuthUserId?: string) => {
    if (!recipientAuthUserId) {
      Alert.alert('Conversation indisponible', 'Ce profil ne peut pas encore être contacté.');
      return;
    }
    if (recipientAuthUserId === String(currentUser?.id)) {
      Alert.alert('Conversation impossible', 'Vous ne pouvez pas vous écrire à vous-même.');
      return;
    }
    if (openingUserId !== null) return;
    setOpeningUserId(recipientAuthUserId);
    try {
      const conversation = await createConversation.mutateAsync(recipientAuthUserId);
      router.replace(`/(chat)/${conversation.data.id}`);
    } catch {
      Alert.alert('Conversation impossible', "La conversation n'a pas pu être créée.");
    } finally {
      setOpeningUserId(null);
    }
  };

  return (
    <SafeScreen style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="h-14 flex-row items-center px-3">
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/chats')} className="h-11 w-11 items-center justify-center" accessibilityLabel="Retour"><Icon name="chevron-back" size={27} color={colors.text} /></TouchableOpacity>
        <Text className="ml-2 flex-1 text-xl font-extrabold" style={{ color: colors.text }}>Nouvelle conversation</Text>
      </View>

      <View className="mx-4 mb-3 mt-2 h-12 flex-row items-center rounded-2xl border px-4" style={{ backgroundColor: colors.elevated, borderColor: colors.border }}>
        <Icon name="search-outline" size={20} color={colors.textMuted} />
        <TextInput value={search} onChangeText={setSearch} className="ml-3 flex-1 text-sm" style={{ color: colors.text }} placeholder="Rechercher une personne..." placeholderTextColor={colors.textMuted} autoFocus returnKeyType="search" />
        {search ? <TouchableOpacity onPress={() => setSearch('')} accessibilityLabel="Effacer"><Icon name="close-circle" size={20} color={colors.textMuted} /></TouchableOpacity> : null}
      </View>

      {isLoading ? <View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View> : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const recipientAuthUserId = item.content_author_id;
            const isOwnProfile = recipientAuthUserId === String(currentUser?.id);
            const opening = String(openingUserId) === String(recipientAuthUserId);
            return (
              <TouchableOpacity onPress={() => void startConversation(recipientAuthUserId)} disabled={openingUserId !== null || isOwnProfile || !recipientAuthUserId} className="flex-row items-center border-b py-4" style={{ borderColor: colors.border, opacity: isOwnProfile || !recipientAuthUserId ? 0.55 : 1 }} activeOpacity={0.75}>
                <Avatar uri={item.avatar_url} displayName={item.display_name} size={48} />
                <View className="ml-3 flex-1"><View className="flex-row items-center"><Text className="text-[15px] font-extrabold" style={{ color: colors.text }}>{item.display_name}</Text>{item.is_verified ? <View className="ml-1"><Icon name="checkmark-circle" size={15} color="#1689FF" /></View> : null}</View><Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>@{item.username}</Text></View>
                {opening ? <ActivityIndicator color={colors.primary} /> : <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name={isOwnProfile ? 'person-outline' : 'chatbubble-outline'} size={20} color={colors.primary} /></View>}
              </TouchableOpacity>
            );
          }}
          ListHeaderComponent={<Text className="pb-2 pt-3 text-xs font-extrabold uppercase tracking-wider" style={{ color: colors.textMuted }}>{search ? 'Résultats' : 'Suggestions'}</Text>}
          ListEmptyComponent={<View className="items-center px-8 py-20"><Icon name="people-outline" size={48} color={colors.textMuted} /><Text className="mt-4 text-center font-bold" style={{ color: colors.text }}>Aucune personne trouvée</Text><Text className="mt-1 text-center text-sm" style={{ color: colors.textSecondary }}>Essayez avec un autre nom ou identifiant.</Text></View>}
        />
      )}
    </SafeScreen>
  );
}
