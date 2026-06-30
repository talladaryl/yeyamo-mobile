// ÉCRAN 6 - Suggestions d'amis (via contacts)
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { SuggestionCard } from '@/components/social/SuggestionCard';
import { mockSuggestions } from '@/features/social/mockData';

export default function FindFriendsScreen() {
  const router = useRouter();
  const friendSuggestions = mockSuggestions;

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: "Trouver des amis",
        }}
      />

      {/* Header Info */}
      <View className="px-4 py-4 border-b border-[#27272A]">
        <Text className="text-white font-bold text-lg mb-1">Trouvez vos amis</Text>
        <Text className="text-[#A1A1AA] text-sm">
          Connectez-vous avec vos contacts et amis en commun
        </Text>
      </View>

      {/* Sync Contacts Button */}
      <TouchableOpacity
        className="mx-4 my-3 bg-[#EF4444] rounded-xl p-4 flex-row items-center justify-between"
        activeOpacity={0.8}
      >
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
            <Icon library="ionicons" name="phone-portrait" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text className="text-white font-bold text-base">Synchroniser les contacts</Text>
            <Text className="text-white/80 text-xs">Trouvez qui est sur Yeyamo</Text>
          </View>
        </View>
        <Icon library="ionicons" name="chevron-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Suggestions List */}
      <View className="px-4 py-2">
        <Text className="text-white font-semibold text-sm mb-2">Amis en commun</Text>
      </View>

      <FlatList
        data={friendSuggestions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SuggestionCard
            user={item}
            onPress={() => router.push(`/(profile)/${item.username}`)}
            onFollowPress={() => console.log('Follow', item.username)}
            onDismiss={() => console.log('Dismiss', item.username)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Icon library="ionicons" name="people-circle-outline" size={64} color="#27272A" />
            <Text className="text-[#A1A1AA] text-sm mt-4 text-center px-8">
              Synchronisez vos contacts pour trouver vos amis
            </Text>
          </View>
        }
      />
    </View>
  );
}
