import { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CollectionCard } from '@/components/collections/CollectionCard';
import { Button } from '@/components/ui/Button';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useUserCollections, usePublicCollections } from '@/features/collections/useCollections';
import type { CollectionTab } from '@/features/collections/types';
import { useThemeStore } from '@/features/theme/theme.store';

export default function CollectionsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [activeTab, setActiveTab] = useState<CollectionTab>('saved');
  const { data: userCollections, isLoading: loadingUser } = useUserCollections();
  const { data: publicCollections, isLoading: loadingPublic } = usePublicCollections();
  const collections = activeTab === 'saved' ? userCollections : publicCollections;
  const isLoading = activeTab === 'saved' ? loadingUser : loadingPublic;
  const handleBack = () => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/profile'); };

  return <SafeScreen><View className="flex-row items-center justify-between border-b px-4 py-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={handleBack} className="-ml-2 p-2" accessibilityRole="button" accessibilityLabel="Retour"><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="text-xl font-bold" style={{ color: colors.text }}>Mes collections</Text><TouchableOpacity onPress={() => router.push('/(collections)/create')} className="p-2" accessibilityRole="button" accessibilityLabel="Créer une collection"><Ionicons name="add" size={28} color={colors.text} /></TouchableOpacity></View><View className="flex-row border-b px-4 pt-4" style={{ borderColor: colors.border }}><Tab label="Enregistrés" active={activeTab === 'saved'} onPress={() => setActiveTab('saved')} /><Tab label="Collections publiques" active={activeTab === 'public'} onPress={() => setActiveTab('public')} /></View>{isLoading ? <View className="flex-1 items-center justify-center"><Text style={{ color: colors.textSecondary }}>Chargement…</Text></View> : collections?.length ? <FlatList data={collections} keyExtractor={(item) => item.id.toString()} numColumns={2} contentContainerStyle={{ padding: 16 }} columnWrapperStyle={{ gap: 12 }} ItemSeparatorComponent={() => <View className="h-3" />} renderItem={({ item }) => <View className="flex-1"><CollectionCard collection={item} onPress={() => router.push(`/(collections)/${item.id}`)} /></View>} ListFooterComponent={activeTab === 'saved' ? <TouchableOpacity onPress={() => router.push('/(collections)/create')} className="mt-3 items-center rounded-xl border-2 border-dashed p-6" style={{ backgroundColor: colors.surface, borderColor: colors.border }}><Ionicons name="add-circle-outline" size={40} color={colors.primary} /><Text className="mt-2 text-base font-semibold" style={{ color: colors.text }}>Créer une collection</Text><Text className="mt-1 text-center text-sm" style={{ color: colors.textSecondary }}>Organisez vos découvertes</Text></TouchableOpacity> : null} /> : <View className="flex-1 items-center justify-center px-8"><Ionicons name="albums-outline" size={64} color={colors.textMuted} /><Text className="mt-4 text-center text-lg font-semibold" style={{ color: colors.text }}>{activeTab === 'saved' ? 'Aucune collection' : 'Aucune collection publique'}</Text><Text className="mt-2 text-center" style={{ color: colors.textSecondary }}>{activeTab === 'saved' ? 'Créez votre première collection pour organiser vos lieux favoris' : 'Explorez les collections partagées par la communauté'}</Text>{activeTab === 'saved' ? <View className="mt-6"><Button label="Créer une collection" onPress={() => router.push('/(collections)/create')} /></View> : null}</View>}</SafeScreen>;
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="flex-1 border-b-2 pb-3" style={{ borderColor: active ? colors.primary : 'transparent' }} accessibilityRole="tab" accessibilityState={{ selected: active }}><Text className="text-center font-semibold" style={{ color: active ? colors.primary : colors.textSecondary }}>{label}</Text></TouchableOpacity>;
}
