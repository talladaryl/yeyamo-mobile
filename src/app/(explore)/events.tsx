import { View, TouchableOpacity, FlatList } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { EventCard } from '@/components/events/EventCard';
import { useThemeStore } from '@/features/theme/theme.store';
import { useUpcomingEvents } from '@/features/events/useEvents';

export default function EventsListScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { data: events = [] } = useUpcomingEvents();

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
            />
          );
        }}
      />
    </View>
  );
}
