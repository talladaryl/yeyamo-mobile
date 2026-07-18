import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { FilterButton } from '@/components/ui/FilterButton';
import { ExperienceCard } from '@/components/experiences/ExperienceCard';
import { mockExperiences } from '@/features/experiences/mockData';
import { useThemeStore } from '@/features/theme/theme.store';

type FilterType = 'all' | 'adventure' | 'culture' | 'relaxation';

export default function ExperiencesListScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [location, setLocation] = useState('Cameroun');

  const filters = [
    { id: 'all' as FilterType, label: 'Tous' },
    { id: 'adventure' as FilterType, label: 'Aventure' },
    { id: 'culture' as FilterType, label: 'Culture' },
    { id: 'relaxation' as FilterType, label: 'Détente' },
  ];

  const handleSaveToggle = (experienceId: number) => {
    console.log('Toggle save:', experienceId);
  };

  const filteredExperiences = activeFilter === 'all'
    ? mockExperiences
    : mockExperiences.filter(exp => exp.category === activeFilter);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Expériences',
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

      {/* Experiences List */}
      <FlatList
        data={filteredExperiences}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ExperienceCard
            id={item.id}
            title={item.title}
            location={item.location}
            rating={item.rating}
            reviewsCount={item.reviews_count}
            priceFrom={item.price_from}
            currency={item.currency}
            imageUrl={item.cover_image_url}
            isSaved={item.is_saved}
            onPress={() => router.push(`/(experiences)/${item.id}`)}
            onSavePress={() => handleSaveToggle(item.id)}
          />
        )}
      />
    </View>
  );
}
