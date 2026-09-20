import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CollectionSummary } from '@/features/collections/types';
import { useThemeStore } from '@/features/theme/theme.store';

interface CollectionCardProps { collection: CollectionSummary; onPress: () => void; }

export function CollectionCard({ collection, onPress }: CollectionCardProps) {
  const colors = useThemeStore((state) => state.colors);
  const visibilityIcon = collection.visibility === 'private' ? 'lock-closed' : collection.visibility === 'public' ? 'earth' : null;
  return <TouchableOpacity onPress={onPress} className="overflow-hidden rounded-xl" style={{ backgroundColor: colors.surface }} activeOpacity={0.7}>{collection.cover_image_url ? <Image source={{ uri: collection.cover_image_url }} className="h-32 w-full" resizeMode="cover" /> : <View className="h-32 w-full items-center justify-center" style={{ backgroundColor: colors.elevated }}><Ionicons name="images-outline" size={40} color={colors.textMuted} /></View>}<View className="p-3"><View className="mb-1 flex-row items-center justify-between"><Text className="flex-1 text-base font-semibold" style={{ color: colors.text }} numberOfLines={1}>{collection.name}</Text>{visibilityIcon ? <Ionicons name={visibilityIcon} size={14} color={colors.textMuted} /> : null}</View><Text className="text-sm" style={{ color: colors.textSecondary }}>{collection.places_count} {collection.places_count > 1 ? 'lieux' : 'lieu'}</Text></View></TouchableOpacity>;
}
