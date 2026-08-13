import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { ArtworkCard } from '@/features/artworks/components/ArtworkCard';
import { useArtisan, useArtisanArtworks } from '@/features/artisans/artisans.hooks';
import type { Artwork } from '@/features/artworks/artworks.types';

export default function ArtisanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const artisan = useArtisan(id);
  const artworks = useArtisanArtworks(id);

  if (artisan.isLoading) return <SafeScreen><View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View></SafeScreen>;
  if (artisan.isError || !artisan.data) return <SafeScreen><View className="flex-1 items-center justify-center px-8"><Text className="text-center" style={{ color: colors.text }}>Ce profil artisan est indisponible.</Text></View></SafeScreen>;

  const data = artisan.data;
  const certifiedArtworks = artworks.data?.content.filter((item) => item.authenticityStatus === 'VERIFIED') ?? [];
  const contact = () => Alert.alert(
    'Contact indisponible',
    'BLOCKED_BY_BACKEND — le profil expose un partnerId, alors que la messagerie attend un userId destinataire. Aucun identifiant de conversation fiable n’est disponible.',
  );

  return <SafeScreen><ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
    <View className="flex-row items-center px-4 pt-3"><TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2" accessibilityLabel="Retour"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><View className="ml-2 flex-1" /><Icon name="share-outline" size={22} color={colors.text} /></View>
    <View className="items-center px-5 pt-5"><View className="h-24 w-24 items-center justify-center rounded-full" style={{ backgroundColor: colors.accentSoft }}><Icon name="person-outline" size={42} color={colors.primary} /></View><View className="mt-4 flex-row items-center"><Text className="text-2xl font-extrabold" style={{ color: colors.text }}>{data.displayName}</Text>{data.verificationStatus === 'VERIFIED' ? <Icon name="checkmark-circle" size={20} color="#22C55E" /> : null}</View><Text className="mt-1 text-center text-sm" style={{ color: colors.textSecondary }}>{data.cityId ?? data.countryCode} · {data.specialties.map((specialty) => specialty.name).join(', ')}</Text><Text className="mt-5 self-stretch text-base leading-7" style={{ color: colors.textSecondary }}>{data.story}</Text></View>
    <View className="mx-5 mt-6 rounded-2xl border p-4" style={{ borderColor: colors.borderSoft, backgroundColor: colors.card }}><Text className="font-bold" style={{ color: colors.text }}>Atelier et savoir-faire</Text><Text className="mt-2 text-sm leading-6" style={{ color: colors.textSecondary }}>{data.craftDescription}</Text><Text className="mt-3 text-xs" style={{ color: colors.textMuted }}>{data.acceptsCustomOrders ? 'Commandes personnalisées acceptées' : 'Commandes personnalisées indisponibles'}{data.internationalShipping ? ' · Livraison internationale' : ''}</Text></View>
    {certifiedArtworks.length ? <ArtworkSection title="Œuvres certifiées" artworks={certifiedArtworks} onPress={(artworkId) => router.push(`/(explore)/artworks/${artworkId}`)} /> : null}
    <ArtworkSection title="Œuvres de l’artisan" loading={artworks.isLoading} artworks={artworks.data?.content ?? []} onPress={(artworkId) => router.push(`/(explore)/artworks/${artworkId}`)} />
    <View className="mx-5 mt-8"><TouchableOpacity onPress={contact} className="items-center rounded-xl px-4 py-4" style={{ backgroundColor: colors.primary }}><Text className="font-bold text-white">Contacter l’artisan</Text></TouchableOpacity><Text className="mt-3 text-center text-xs" style={{ color: colors.textMuted }}>Le contact direct sera activé lorsque le profil exposera un destinataire de messagerie.</Text></View>
  </ScrollView></SafeScreen>;
}

function ArtworkSection({ title, artworks, loading, onPress }: { title: string; artworks: Artwork[]; loading?: boolean; onPress: (id: string) => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mt-7"><Text className="mb-3 px-5 text-lg font-bold" style={{ color: colors.text }}>{title}</Text>{loading ? <ActivityIndicator color={colors.primary} /> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>{artworks.map((artwork) => <ArtworkCard key={artwork.assetId} artwork={artwork} onPress={() => onPress(artwork.assetId)} />)}</ScrollView>}</View>;
}
