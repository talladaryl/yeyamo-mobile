import { Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { formatMoney } from '@/utils/format';
import type { Artwork, ArtworkOffer } from '../artworks.types';

type Props = { artwork: Artwork; offer?: ArtworkOffer; onPress: () => void; variant?: 'rail' | 'grid' };

export function ArtworkCard({ artwork, offer, onPress, variant = 'rail' }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const grid = variant === 'grid';
  const displayPrice = offer?.status === 'ACTIVE' && offer.saleType === 'FIXED_PRICE';
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Découvrir l’œuvre ${artwork.title}`}
      className={`${grid ? 'flex-1' : 'mr-3 w-64'} overflow-hidden rounded-2xl border p-3`}
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
      activeOpacity={0.86}
    >
      {artwork.imageUrl ? (
        <Image source={{ uri: artwork.imageUrl }} style={{ aspectRatio: grid ? 1 : 1.9, width: '100%', borderRadius: 12 }} contentFit="cover" transition={120} />
      ) : (
        <View className="items-center justify-center rounded-xl" style={{ aspectRatio: grid ? 1 : 1.9, backgroundColor: colors.elevated }}>
          <Icon name="color-palette-outline" size={grid ? 28 : 34} color={colors.primary} />
        </View>
      )}
      <Text className="mt-3 font-bold" style={{ color: colors.text }} numberOfLines={2}>{artwork.title}</Text>
      <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }} numberOfLines={grid ? 2 : 2}>{artwork.shortDescription ?? artwork.culturalCommunity ?? 'Œuvre artisanale'}</Text>
      <View className="mt-3">
        <Text className="text-[11px] font-semibold" style={{ color: colors.textMuted }} numberOfLines={1}>{artwork.cityId ?? artwork.countryCode}</Text>
        <Text className="mt-1 text-xs font-extrabold" style={{ color: colors.primary }} numberOfLines={1}>
          {displayPrice ? formatMoney(offer.amount, offer.currencyCode) : offer?.saleType === 'ON_REQUEST' || artwork.availabilityStatus === 'ON_ORDER' ? 'Sur demande' : artwork.availabilityStatus === 'SOLD' ? 'Vendue' : 'À découvrir'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
