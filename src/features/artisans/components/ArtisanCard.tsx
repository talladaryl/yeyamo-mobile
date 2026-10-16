import { Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import type { Artisan } from '../artisans.types';

type Props = { artisan: Artisan; onPress: () => void; variant?: 'rail' | 'grid' };

export function ArtisanCard({ artisan, onPress, variant = 'rail' }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const grid = variant === 'grid';
  const avatarSize = grid ? 42 : 54;
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${grid ? 'flex-1' : 'mr-3 w-64'} overflow-hidden rounded-2xl border`}
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
      activeOpacity={0.86}
      accessibilityRole="button"
      accessibilityLabel={`Voir le profil de ${artisan.displayName}`}
    >
      <View className={grid ? 'h-24' : 'h-32'} style={{ backgroundColor: colors.elevated }}>
        {artisan.coverImageUrl ? <Image source={{ uri: artisan.coverImageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={120} /> : <View className="flex-1 items-center justify-center"><Icon name="color-palette-outline" size={26} color={colors.textMuted} /></View>}
        <View className={`absolute ${grid ? '-bottom-5 left-3' : '-bottom-7 left-4'} rounded-full border-[3px]`} style={{ borderColor: colors.card }}>
          {artisan.avatarUrl ? <Image source={{ uri: artisan.avatarUrl }} style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }} contentFit="cover" /> : <View className="items-center justify-center rounded-full" style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, backgroundColor: colors.elevated }}><Icon name="person-outline" size={grid ? 19 : 23} color={colors.textSecondary} /></View>}
        </View>
      </View>
      <View className={grid ? 'p-3 pt-7' : 'p-4 pt-9'}>
        <View className="flex-row items-center">
          <Text className="flex-1 font-extrabold" style={{ color: colors.text }} numberOfLines={1}>{artisan.displayName}</Text>
          {artisan.verificationStatus === 'VERIFIED' ? <Icon name="checkmark-circle" size={16} color="#1689FF" /> : null}
        </View>
        <Text className="mt-1 text-xs leading-4" style={{ color: colors.textSecondary }} numberOfLines={2}>{artisan.specialties.map((item) => item.name).join(', ') || artisan.craftDescription}</Text>
        <Text className="mt-2 text-[11px] font-semibold" style={{ color: colors.textMuted }} numberOfLines={1}>{artisan.cityId ?? artisan.countryCode}</Text>
      </View>
    </TouchableOpacity>
  );
}
