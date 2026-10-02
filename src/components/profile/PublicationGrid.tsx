import { memo, useState } from 'react';
import { View, Text, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { UserPublication } from '@/features/profile/types';

interface PublicationGridProps {
  publications: UserPublication[];
  onPressPublication: (publication: UserPublication) => void;
}

interface PublicationGridItemProps {
  publication: UserPublication;
  itemSize: number;
  onPressPublication: (publication: UserPublication) => void;
}

const PublicationGridItem = memo(function PublicationGridItem({ publication, itemSize, onPressPublication }: PublicationGridItemProps) {
  const hasPreview = Boolean(publication.media_url);
  const [mediaFailed, setMediaFailed] = useState(false);
  const isTextTile = publication.type === 'text' || !hasPreview || mediaFailed;
  return (
    <TouchableOpacity
      onPress={() => onPressPublication(publication)}
      className="p-0.5"
      style={{ width: itemSize, height: itemSize }}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir la publication ${String(publication.id)}`}
    >
      {isTextTile ? (
        <View className="h-full w-full items-center justify-center bg-slate-800 p-3">
          <Ionicons name="document-text-outline" size={24} color="#FFFFFF" />
          <Text className="mt-1 text-center text-xs font-semibold text-white" numberOfLines={5}>{publication.caption?.trim() || 'Publication texte'}</Text>
        </View>
      ) : (
        <Image source={{ uri: publication.media_url }} className="h-full w-full" resizeMode="cover" onError={() => setMediaFailed(true)} />
      )}
      {publication.type === 'video' ? <View className="absolute right-2 top-2"><Ionicons name="play-circle" size={21} color="#FFFFFF" /></View> : null}
      {publication.type === 'carousel' ? <View className="absolute right-2 top-2"><Ionicons name="copy-outline" size={18} color="#FFFFFF" /></View> : null}
      {publication.likes_count > 0 || publication.views_count > 0 ? <View className="absolute bottom-2 left-2 flex-row items-center gap-2 rounded-full bg-black/60 px-2 py-1">
        <View className="flex-row items-center gap-1"><Ionicons name="heart" size={12} color="#FFFFFF" /><Text className="text-xs font-semibold text-white">{publication.likes_count}</Text></View>
        <View className="flex-row items-center gap-1"><Ionicons name="eye-outline" size={13} color="#FFFFFF" /><Text className="text-xs font-semibold text-white">{publication.views_count}</Text></View>
      </View> : null}
    </TouchableOpacity>
  );
});

/** A compact fixed 3-column grid. Its parent owns vertical scrolling, avoiding nested lists. */
export function PublicationGrid({ publications, onPressPublication }: PublicationGridProps) {
  const { width } = useWindowDimensions();
  const itemSize = (width - 4) / 3;
  return <View className="flex-row flex-wrap">{publications.map((publication) => <PublicationGridItem key={String(publication.id)} publication={publication} itemSize={itemSize} onPressPublication={onPressPublication} />)}</View>;
}
