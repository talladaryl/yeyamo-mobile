import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { FavoritePlace } from '@/features/profile/types';
import { useThemeStore } from '@/features/theme/theme.store';

interface FavoritePlaceCardProps { place: FavoritePlace; onPress: () => void; onTogglePriority?: () => void; }

export function FavoritePlaceCard({ place, onPress, onTogglePriority }: FavoritePlaceCardProps) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="mb-3 overflow-hidden rounded-xl" style={{ backgroundColor: colors.surface }} activeOpacity={0.7}><Image source={{ uri: place.cover_photo_url }} className="h-48 w-full" resizeMode="cover" /><View className="p-4"><View className="mb-2 flex-row items-start justify-between"><View className="flex-1"><Text className="text-lg font-semibold" style={{ color: colors.text }} numberOfLines={1}>{place.name}</Text><Text className="text-sm" style={{ color: colors.textSecondary }} numberOfLines={1}>{place.category.name} • {place.city}</Text></View>{onTogglePriority ? <TouchableOpacity onPress={onTogglePriority} className="ml-2" accessibilityRole="button" accessibilityLabel="Définir comme priorité"><Ionicons name={place.is_priority ? 'flag' : 'flag-outline'} size={22} color={place.is_priority ? colors.primary : colors.textMuted} /></TouchableOpacity> : null}</View><View className="flex-row items-center"><Ionicons name="star" size={16} color={colors.accent} /><Text className="ml-1 text-sm font-semibold" style={{ color: colors.text }}>{place.rating.toFixed(1)}</Text><Text className="ml-1 text-sm" style={{ color: colors.textSecondary }}>({place.reviews_count} avis)</Text></View></View></TouchableOpacity>;
}
