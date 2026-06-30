// ÉCRAN 1 - Recherche utilisateurs
import { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { UserSearchCard } from '@/components/social/UserSearchCard';
import { mockSearchResults } from '@/features/social/mockData';

export default function SearchUsersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const results = mockSearchResults;

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Recherche',
        }}
      />

      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-[#27272A]">
        <View className="flex-row items-center bg-[#161616] rounded-xl px-4 py-2.5 gap-3">
          <Icon library="ionicons" name="search" size={20} color="#A1A1AA" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher des utilisateurs..."
            placeholderTextColor="#A1A1AA"
            className="flex-1 text-white text-sm"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Icon library="ionicons" name="close-circle" size={20} color="#52525B" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters Toggle */}
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          className="flex-row items-center justify-between mt-3"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center gap-2">
            <Icon library="ionicons" name="options" size={18} color="#EF4444" />
            <Text className="text-white text-sm font-semibold">Filtres</Text>
          </View>
          <Icon
            library="ionicons"
            name={showFilters ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#A1A1AA"
          />
        </TouchableOpacity>

        {/* Filters Panel */}
        {showFilters && (
          <View className="mt-3 p-3 bg-[#161616] rounded-xl">
            <Text className="text-white text-sm font-semibold mb-2">Localisation</Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
              {['Toutes', 'Yaoundé', 'Douala', 'Bafoussam'].map((location) => (
                <TouchableOpacity
                  key={location}
                  className="px-3 py-1.5 rounded-full bg-[#27272A]"
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-xs">{location}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-white text-sm font-semibold mb-2">Centres d'intérêt</Text>
            <View className="flex-row flex-wrap gap-2">
              {['Voyages', 'Food', 'Sports', 'Culture', 'Nature'].map((interest) => (
                <TouchableOpacity
                  key={interest}
                  className="px-3 py-1.5 rounded-full bg-[#27272A]"
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-xs">{interest}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <UserSearchCard
            user={item}
            onPress={() => router.push(`/(profile)/${item.username}`)}
            onFollowPress={() => console.log('Follow', item.username)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Icon library="ionicons" name="search" size={64} color="#27272A" />
            <Text className="text-[#A1A1AA] text-sm mt-4">
              {searchQuery ? 'Aucun résultat trouvé' : 'Recherchez des utilisateurs'}
            </Text>
          </View>
        }
      />
    </View>
  );
}
