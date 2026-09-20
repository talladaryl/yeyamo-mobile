import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { ArtworkCard } from '@/features/artworks/components/ArtworkCard';
import { useArtisan, useArtisanArtworks } from '@/features/artisans/artisans.hooks';
import { useContactPartner } from '@/features/chat/useChat';
import { useThemeStore } from '@/features/theme/theme.store';

export default function ArtisanDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const artisan = useArtisan(id);
  const artworks = useArtisanArtworks(id);
  const contactPartner = useContactPartner();
  const [category, setCategory] = useState('Tous');
  const categories = useMemo(
    () => ['Tous', ...new Set((artworks.data?.content ?? []).map((item) => item.category ?? 'Autres'))],
    [artworks.data],
  );
  const filtered = (artworks.data?.content ?? []).filter((item) => category === 'Tous' || item.category === category);

  if (artisan.isLoading) return <SafeScreen><View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary}/></View></SafeScreen>;
  if (!artisan.data) return <SafeScreen><View className="flex-1 items-center justify-center"><Text style={{ color: colors.text }}>Artiste indisponible.</Text></View></SafeScreen>;

  const data = artisan.data;
  const contact = async () => {
    try {
      const conversation = await contactPartner.mutateAsync(data.partnerId);
      router.replace(`/(chat)/${conversation.data.id}`);
    } catch {
      Alert.alert('Contact impossible', 'Impossible de contacter cet artisan pour le moment, réessayez plus tard.');
    }
  };

  return <SafeScreen><FlatList data={filtered} keyExtractor={(item) => item.assetId} contentContainerStyle={{ paddingBottom: 40 }}
    ListHeaderComponent={<><View className="relative">{data.coverImageUrl ? <Image source={{ uri: data.coverImageUrl }} style={{ height: 190, width: '100%' }} contentFit="cover"/> : <View className="h-48" style={{ backgroundColor: colors.elevated }}/>}<TouchableOpacity onPress={() => router.back()} className="absolute left-4 top-4 h-11 w-11 items-center justify-center rounded-full bg-black/50"><Icon name="chevron-back" size={24} color="#FFFFFF"/></TouchableOpacity></View><View className="items-center px-5"><Image source={{ uri: data.avatarUrl }} style={{ width: 94, height: 94, borderRadius: 47, marginTop: -47, borderWidth: 4, borderColor: colors.background }} contentFit="cover"/><View className="mt-3 flex-row items-center"><Text className="text-2xl font-extrabold" style={{ color: colors.text }}>{data.displayName}</Text>{data.verificationStatus === 'VERIFIED' ? <Icon name="checkmark-circle" size={20} color="#22C55E"/> : null}</View><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{data.cityId ?? data.countryCode} · {data.yearsOfExperience ?? 0} ans d’expérience</Text><Text className="mt-5 text-base leading-7" style={{ color: colors.textSecondary }}>{data.story}</Text></View><View className="mx-5 mt-6 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="font-extrabold" style={{ color: colors.text }}>Atelier et savoir-faire</Text><Text className="mt-2 leading-6" style={{ color: colors.textSecondary }}>{data.craftDescription}</Text><Text className="mt-3 text-xs" style={{ color: colors.textMuted }}>Langues : {data.languages.join(', ')} · {data.acceptsCustomOrders ? 'Commandes personnalisées acceptées' : 'Commandes fermées'}</Text></View><View className="mb-3 mt-7 flex-row items-center px-5"><Text className="flex-1 text-xl font-extrabold" style={{ color: colors.text }}>Ses créations</Text><Text className="text-xs font-bold text-[#EF4444]">{filtered.length} œuvre(s)</Text></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}>{categories.map((value) => <TouchableOpacity key={value} onPress={() => setCategory(value)} className="rounded-full border px-4 py-2" style={{ backgroundColor: category === value ? colors.primary : colors.card, borderColor: category === value ? colors.primary : colors.border }}><Text className="text-xs font-bold" style={{ color: category === value ? '#FFFFFF' : colors.textSecondary }}>{value === 'Tous' ? 'Toutes' : value}</Text></TouchableOpacity>)}</ScrollView></>}
    renderItem={({ item }) => <View className="mb-3 px-5"><ArtworkCard artwork={item} onPress={() => router.push(`/(explore)/artworks/${item.assetId}`)}/></View>}
    ListEmptyComponent={<Text className="p-8 text-center" style={{ color: colors.textSecondary }}>Aucune création dans cette catégorie.</Text>}
    ListFooterComponent={<View className="mx-5 mt-5"><TouchableOpacity disabled={contactPartner.isPending} onPress={() => void contact()} className="items-center rounded-xl bg-[#EF4444] py-4" style={{ opacity: contactPartner.isPending ? 0.65 : 1 }}>{contactPartner.isPending ? <ActivityIndicator color="#FFFFFF"/> : <Text className="font-bold text-white">Contacter l’artiste</Text>}</TouchableOpacity></View>}
  /></SafeScreen>;
}
