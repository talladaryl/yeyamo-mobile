import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { RemoteAudioPlayer } from '@/features/culture/components/RemoteAudioPlayer';
import { useThemeStore } from '@/features/theme/theme.store';
import { useCountryFeature } from '@/features/country/country.hooks';
import { useArtwork, useArtworkHistory, useArtworkOffer } from '@/features/artworks/artworks.hooks';
import { formatMoney } from '@/utils/format';
import { useCreateInteractionComment, useInteractionComments, useInteractionStatus, useToggleInteraction } from '@/features/interactions/generic-interactions.hooks';

export default function ArtworkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const artisanCommerceEnabled = useCountryFeature('artisanCommerceEnabled');
  const paymentsEnabled = useCountryFeature('paymentsEnabled');
  const detail = useArtwork(id);
  const history = useArtworkHistory(id);
  const offer = useArtworkOffer(id);
  const [comment, setComment] = useState('');
  const comments = useInteractionComments('ARTWORK', id);
  const createComment = useCreateInteractionComment('ARTWORK', id);
  const favorite = useInteractionStatus('ARTWORK', id);
  const toggleFavorite = useToggleInteraction('ARTWORK', id);

  const publish = () => {
    if (comment.trim().length < 2) return;
    createComment.mutate(comment.trim(), { onSuccess: () => setComment('') });
  };

  if (detail.isLoading) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeScreen>
    );
  }

  if (!detail.data) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.text }}>Cette oeuvre est indisponible.</Text>
        </View>
      </SafeScreen>
    );
  }

  const artwork = detail.data.artwork;
  const canOrder = artisanCommerceEnabled && paymentsEnabled && offer.data?.status === 'ACTIVE' && artwork.availabilityStatus === 'AVAILABLE';

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center">
            <Icon name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View className="flex-1" />
          <TouchableOpacity onPress={() => toggleFavorite.mutate(Boolean(favorite.data))} disabled={toggleFavorite.isPending} className="h-11 w-11 items-center justify-center">
            <Icon name={favorite.data ? 'bookmark' : 'bookmark-outline'} size={23} color={colors.text} />
          </TouchableOpacity>
        </View>

        {artwork.imageUrl ? (
          <Image source={{ uri: artwork.imageUrl }} style={{ height: 320, width: '100%' }} contentFit="cover" />
        ) : (
          <View className="mx-4 h-64 items-center justify-center rounded-3xl bg-[#FEE2E2]">
            <Icon name="color-palette-outline" size={60} color="#B91C1C" />
          </View>
        )}

        <View className="px-5 pt-6">
          <Text className="text-xs font-extrabold text-[#EF4444]">
            {artwork.category?.toUpperCase()} · {artwork.authenticityStatus}
          </Text>
          <Text className="mt-2 text-3xl font-extrabold" style={{ color: colors.text }}>
            {artwork.title}
          </Text>
          <TouchableOpacity onPress={() => router.push(`/(explore)/artisans/${artwork.artisanPartnerId}`)} className="mt-2 self-start">
            <Text className="font-bold text-[#EF4444]">Voir le profil de l'artiste</Text>
          </TouchableOpacity>

          <Text className="mt-5 text-base leading-7" style={{ color: colors.textSecondary }}>
            {artwork.story ?? artwork.shortDescription}
          </Text>

          {artwork.audioUrl ? (
            <View className="mt-6">
              <Text className="mb-2 text-lg font-extrabold" style={{ color: colors.text }}>
                Le commentaire audio de l'artiste
              </Text>
              <RemoteAudioPlayer
                source={artwork.audioUrl}
                transcript="L'artiste raconte la signification, les matieres et les gestes de creation."
                label="Ecouter le recit de l'oeuvre"
              />
            </View>
          ) : null}

          <View className="mt-7 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Info label="Prix" value={offer.data?.saleType === 'FIXED_PRICE' ? formatMoney(offer.data.amount, offer.data.currencyCode) : 'Sur demande'} />
            <Info label="Matieres" value={artwork.materials?.join(', ') ?? 'Non renseignees'} />
            <Info label="Dimensions" value={`${artwork.width} x ${artwork.height} x ${artwork.depth} cm`} />
            <Info label="Temps de creation" value={artwork.productionTime ?? 'Non renseigne'} />
            <Info label="Origine" value={[artwork.cityId, artwork.culturalCommunity, artwork.countryCode].filter(Boolean).join(' · ')} />
            <Info label="Retrouver l'artiste" value={artwork.workshopLocation ?? "Voir le profil de l'artiste"} />
          </View>

          {history.data?.map((entry) => (
            <View key={entry.id} className="mt-6 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <Text className="text-lg font-extrabold" style={{ color: colors.text }}>
                {entry.title}
              </Text>
              <Text className="mt-2 leading-6" style={{ color: colors.textSecondary }}>
                {entry.narrative}
              </Text>
              <Text className="mt-3 text-sm italic" style={{ color: colors.textMuted }}>
                {entry.culturalMeaning}
              </Text>
            </View>
          ))}

          <View className="mt-7 gap-3">
            <TouchableOpacity
              onPress={() => Alert.alert("Coordonnees de l'atelier", artwork.workshopLocation ?? "Consultez le profil de l'artiste.")}
              className="items-center rounded-xl border py-4"
              style={{ borderColor: colors.border }}
            >
              <Text className="font-bold" style={{ color: colors.text }}>
                Comment retrouver l'artiste
              </Text>
            </TouchableOpacity>
            {canOrder ? (
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/(profile)/artwork-orders' as never, params: { offerId: offer.data!.id } } as never)}
                className="items-center rounded-xl bg-[#EF4444] py-4"
              >
                <Text className="font-bold text-white">Acheter cette oeuvre</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text className="mb-3 mt-8 text-xl font-extrabold" style={{ color: colors.text }}>
            Commentaires ({comments.data?.length ?? 0})
          </Text>
          <View className="flex-row items-center rounded-2xl border p-2" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Ajouter un commentaire..."
              placeholderTextColor={colors.textMuted}
              className="min-h-11 flex-1 px-2"
              style={{ color: colors.text }}
            />
            <TouchableOpacity
              onPress={publish}
              disabled={comment.trim().length < 2 || createComment.isPending}
              className="h-11 w-11 items-center justify-center rounded-full bg-[#EF4444]"
              style={{ opacity: comment.trim().length < 2 || createComment.isPending ? 0.45 : 1 }}
            >
              <Icon name="arrow-up" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {comments.data?.map((value) => (
            <View key={value.id} className="mt-3 flex-row rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
                <Icon name="person" size={17} color={colors.textSecondary} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-bold" style={{ color: colors.text }}>
                  {value.userId}
                </Text>
                <Text className="mt-1 leading-5" style={{ color: colors.textSecondary }}>
                  {value.body}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  const colors = useThemeStore((state) => state.colors);

  return (
    <View className="border-b py-3 last:border-b-0" style={{ borderColor: colors.border }}>
      <Text className="text-xs" style={{ color: colors.textMuted }}>
        {label}
      </Text>
      <Text className="mt-1 font-semibold" style={{ color: colors.text }}>
        {value}
      </Text>
    </View>
  );
}
