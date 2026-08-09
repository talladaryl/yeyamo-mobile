import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { LanguageCard } from '@/features/culture/components/LanguageCard';
import { useCultureLanguages } from '@/features/culture/culture.hooks';

export default function LanguagesScreen() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors); const languages = useCultureLanguages();
  return <SafeScreen><View className="flex-row items-center px-4 py-3"><TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><View className="ml-2"><Text className="text-2xl font-extrabold" style={{ color: colors.text }}>Langues</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>Apprendre quelques mots, à votre rythme.</Text></View></View>{languages.isLoading ? <View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View> : languages.isError ? <View className="flex-1 items-center justify-center px-8"><Text className="text-center" style={{ color: colors.textSecondary }}>Les langues ne peuvent pas être chargées.</Text><TouchableOpacity onPress={() => languages.refetch()} className="mt-4"><Text className="font-bold text-[#EF4444]">Réessayer</Text></TouchableOpacity></View> : <FlatList data={languages.data ?? []} keyExtractor={(item) => item.code} contentContainerStyle={{ padding: 16, paddingBottom: 32 }} renderItem={({ item }) => <View className="mb-3"><LanguageCard language={item} onPress={() => router.push(`/(explore)/languages/${item.code}`)} /></View>} ListEmptyComponent={<Empty label="Aucune langue publiée pour le moment." />} />}</SafeScreen>;
}
function Empty({ label }: { label: string }) { const colors = useThemeStore((state) => state.colors); return <View className="items-center py-20"><Icon name="language-outline" size={34} color={colors.textMuted} /><Text className="mt-3 text-center" style={{ color: colors.textSecondary }}>{label}</Text></View>; }
