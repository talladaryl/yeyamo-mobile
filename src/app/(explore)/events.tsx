import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { FilterButton } from '@/components/ui/FilterButton';
import { EventCard } from '@/components/events/EventCard';
import { useThemeStore } from '@/features/theme/theme.store';
import { useUpcomingEvents } from '@/features/events/useEvents';
import type { EntityId } from '@/types/api.types';

type FilterType = 'all' | 'autumn' | 'later';

export default function EventsListScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { data: events = [] } = useUpcomingEvents();
  const [location, setLocation] = useState('Yaoundé, Centre');

  const filters = [
    { id: 'all' as FilterType, label: 'Tous' },
    { id: 'autumn' as FilterType, label: 'Automne' },
    { id: 'later' as FilterType, label: 'Plus tard' },
  ];

  const handleSaveToggle = (eventId: EntityId) => {
    console.log('Toggle save:', eventId);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Événements',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-4">
              <Icon library="ionicons" name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Location Selector */}
      <View className="px-4 py-3 border-b" style={{ borderColor: colors.border }}>
        <TouchableOpacity
          onPress={() => console.log('Change location')}
          className="flex-row items-center justify-between"
          activeOpacity={0.7}
        >
          <View className="flex-1">
            <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>Recherche</Text>
            <Text className="text-base font-medium" style={{ color: colors.text }}>{location}</Text>
          </View>
          <Text className="text-[#EF4444] text-sm font-semibold">Changer</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View className="py-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {filters.map((filter) => (
            <FilterButton
              key={filter.id}
              label={filter.label}
              isActive={activeFilter === filter.id}
              onPress={() => setActiveFilter(filter.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Events List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const startDate = new Date(item.start_date);
          const formattedDate = `${startDate.getDate()} ${startDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`;

          return (
            <EventCard
              id={item.id}
              title={item.title}
              date={formattedDate}
              location={item.location}
              city={item.city}
              imageUrl={item.cover_image_url}
              isSaved={item.is_saved}
              onPress={() => router.push(`/(events)/${item.id}`)}
              onSavePress={() => handleSaveToggle(item.id)}
            />
          );
        }}
      />
    </View>
  );
}
