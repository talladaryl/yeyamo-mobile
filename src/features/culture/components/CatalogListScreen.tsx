import { useMemo, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

export interface CatalogListItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  imageUrl?: string;
}

export function CatalogListScreen({ title, subtitle, items, categories, detailBase }: { title: string; subtitle: string; items: CatalogListItem[]; categories: string[]; detailBase: string }) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [category, setCategory] = useState('Tous');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => items.filter((item) => (category === 'Tous' || item.category === category) && `${item.title} ${item.subtitle}`.toLowerCase().includes(query.trim().toLowerCase())), [category, items, query]);
  return <SafeScreen><View className="flex-row items-center px-4 py-3"><TouchableOpacity onPress={() => router.back()} className="-ml-2 h-11 w-11 items-center justify-center"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><View className="ml-1 flex-1"><Text className="text-2xl font-extrabold" style={{ color: colors.text }}>{title}</Text><Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{subtitle}</Text></View></View><View className="mx-4 mb-3 flex-row items-center rounded-2xl border px-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Icon name="search" size={20} color={colors.textMuted} /><TextInput value={query} onChangeText={setQuery} placeholder="Rechercher…" placeholderTextColor={colors.textMuted} className="ml-3 h-12 flex-1" style={{ color: colors.text }} /></View><FlatList horizontal data={categories} keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }} style={{ flexGrow: 0, marginBottom: 10 }} renderItem={({ item }) => <TouchableOpacity onPress={() => setCategory(item)} className="rounded-full border px-4 py-2" style={{ backgroundColor: category === item ? colors.primary : colors.card, borderColor: category === item ? colors.primary : colors.border }}><Text className="text-xs font-bold" style={{ color: category === item ? '#FFFFFF' : colors.textSecondary }}>{item}</Text></TouchableOpacity>} /><FlatList data={filtered} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 36 }} renderItem={({ item }) => <TouchableOpacity onPress={() => router.push(`${detailBase}/${item.id}` as never)} className="mb-3 flex-row overflow-hidden rounded-2xl border p-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Image source={{ uri: item.imageUrl }} style={{ width: 92, height: 92, borderRadius: 14 }} contentFit="cover" /><View className="ml-3 flex-1 py-1"><View className="self-start rounded-full px-2 py-1" style={{ backgroundColor: colors.accentSoft }}><Text className="text-[10px] font-extrabold" style={{ color: colors.primary }}>{item.category}</Text></View><Text className="mt-2 text-base font-extrabold" style={{ color: colors.text }} numberOfLines={2}>{item.title}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }} numberOfLines={2}>{item.subtitle}</Text></View><Icon name="chevron-forward" size={18} color={colors.textMuted} /></TouchableOpacity>} ListEmptyComponent={<View className="items-center py-20"><Icon name="search-outline" size={36} color={colors.textMuted} /><Text className="mt-3" style={{ color: colors.textSecondary }}>Aucun résultat dans cette sélection.</Text></View>} /></SafeScreen>;
}
