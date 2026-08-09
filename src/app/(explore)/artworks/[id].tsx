import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { useCountryFeature } from '@/features/country/country.hooks';
import { useArtwork, useArtworkHistory, useArtworkOffer } from '@/features/artworks/artworks.hooks';
import { formatMoney } from '@/utils/format';
import { mediaContentUrl } from '@/services/api/contracts';

export default function ArtworkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((s) => s.colors);
  const artisanCommerceEnabled = useCountryFeature('artisanCommerceEnabled');
  const paymentsEnabled = useCountryFeature('paymentsEnabled');
  const commerce = artisanCommerceEnabled && paymentsEnabled;
  const detail = useArtwork(id);
  const history = useArtworkHistory(id);
  const offer = useArtworkOffer(id);
  if (detail.isLoading) return <SafeScreen><View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View></SafeScreen>;
  if (detail.isError || !detail.data) return <SafeScreen><View className="flex-1 items-center justify-center px-8"><Text className="text-center" style={{ color: colors.text }}>Cette œuvre n’est pas accessible.</Text><TouchableOpacity onPress={() => detail.refetch()} className="mt-4"><Text className="font-bold text-[#EF4444]">Réessayer</Text></TouchableOpacity></View></SafeScreen>;
  const artwork = detail.data.artwork;
  const primary = detail.data.media.find((item) => item.mediaType === 'PRIMARY_IMAGE') ?? detail.data.media[0];
  const canOrder = commerce && offer.data?.status === 'ACTIVE' && artwork.availabilityStatus === 'AVAILABLE';
  return <SafeScreen><ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
    <View className="flex-row items-center px-4 pt-3"><TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><View className="flex-1" /><Icon name="bookmark-outline" size={23} color={colors.text} /></View>
    {primary ? <Image source={{ uri: mediaContentUrl(primary.mediaId) }} className="mx-4 mt-4 h-64 rounded-3xl" resizeMode="cover" /> : <View className="mx-4 mt-4 h-64 items-center justify-center rounded-3xl bg-[#FEE2E2]"><Icon name="color-palette-outline" size={62} color="#B91C1C" /></View>}
    <View className="px-5 pt-6"><Text className="text-3xl font-extrabold" style={{ color: colors.text }}>{artwork.title}</Text><TouchableOpacity onPress={() => router.push(`/(explore)/artisans/${artwork.artisanPartnerId}`)} className="mt-2 self-start"><Text className="font-semibold text-[#EF4444]">Voir l’artisan</Text></TouchableOpacity><Text className="mt-4 text-base leading-7" style={{ color: colors.textSecondary }}>{artwork.story ?? artwork.shortDescription}</Text>
      <Detail label="Disponibilité" value={artwork.availabilityStatus.replace(/_/g, ' ')} /><Detail label="Authenticité" value={artwork.authenticityStatus.replace(/_/g, ' ')} /><Detail label="Dimensions" value={dimensions(artwork) ?? 'Non renseignées'} /><Detail label="Origine" value={[artwork.cityId, artwork.countryCode, artwork.culturalCommunity].filter(Boolean).join(' · ')} />
      {offer.data?.saleType === 'FIXED_PRICE' ? <View className="mt-5 rounded-2xl bg-[#FEE2E2] p-4"><Text className="text-sm text-[#B91C1C]">Prix</Text><Text className="mt-1 text-xl font-extrabold text-[#B91C1C]">{formatMoney(offer.data.amount, offer.data.currencyCode)}</Text></View> : null}
      {offer.data?.saleType === 'ON_REQUEST' ? <View className="mt-5 rounded-2xl bg-[#FEF3C7] p-4"><Text className="font-bold text-[#92400E]">Prix sur demande</Text></View> : null}
      {history.isLoading ? <ActivityIndicator className="mt-7" color={colors.primary} /> : null}
      {!history.isLoading && history.data?.length ? <View className="mt-8"><Text className="text-lg font-bold" style={{ color: colors.text }}>Histoire de l’œuvre</Text>{history.data.map((entry) => <View key={entry.id} className="mt-3 rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="font-bold" style={{ color: colors.text }}>{entry.title}</Text><Text className="mt-1 leading-6" style={{ color: colors.textSecondary }}>{entry.narrative}</Text>{entry.culturalMeaning ? <Text className="mt-2 text-sm italic" style={{ color: colors.textMuted }}>{entry.culturalMeaning}</Text> : null}</View>)}</View> : null}
      <View className="mt-7 gap-3"><TouchableOpacity onPress={() => router.push('/(tabs)/chats')} className="items-center rounded-xl border px-4 py-4" style={{ borderColor: colors.border }}><Text className="font-bold" style={{ color: colors.text }}>Contacter l’artisan</Text></TouchableOpacity>{canOrder ? <TouchableOpacity onPress={() => router.push({ pathname: '/(profile)/artwork-orders' as never, params: { offerId: offer.data!.id } } as never)} className="items-center rounded-xl bg-[#EF4444] px-4 py-4"><Text className="font-bold text-white">Commander cette œuvre</Text></TouchableOpacity> : <Text className="text-center text-xs" style={{ color: colors.textMuted }}>{commerce ? 'Cette œuvre ne peut pas être commandée en ce moment.' : 'Le commerce artisanal est indisponible pour ce pays.'}</Text>}</View>
    </View>
  </ScrollView></SafeScreen>;
}
function Detail({ label, value }: { label: string; value: string }) { const colors = useThemeStore((s) => s.colors); return <View className="mt-4 border-b pb-3" style={{ borderColor: colors.border }}><Text className="text-xs" style={{ color: colors.textMuted }}>{label}</Text><Text className="mt-1 font-semibold" style={{ color: colors.text }}>{value}</Text></View>; }
function dimensions(a: { width: string | number | null; height: string | number | null; depth: string | number | null }) { const values = [a.width, a.height, a.depth].filter((v): v is string | number => v !== null && v !== undefined && v !== ''); return values.length ? `${values.join(' × ')} cm` : null; }
