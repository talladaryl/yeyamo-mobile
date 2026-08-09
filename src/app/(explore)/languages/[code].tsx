import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { useLanguage, useLanguageLessons } from '@/features/culture/culture.hooks';

export default function LanguageDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>(); const router = useRouter(); const colors = useThemeStore((state) => state.colors); const language = useLanguage(code); const lessons = useLanguageLessons(code);
  if (language.isLoading) return <SafeScreen><View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View></SafeScreen>;
  if (language.isError || !language.data) return <SafeScreen><View className="flex-1 items-center justify-center"><Text style={{ color: colors.text }}>Cette langue est indisponible.</Text></View></SafeScreen>;
  const item = language.data;
  return <SafeScreen><ScrollView contentContainerStyle={{ paddingBottom: 32 }}><View className="flex-row items-center px-4 pt-3"><TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="ml-2 text-lg font-bold" style={{ color: colors.text }}>Langue</Text></View><View className="px-5 pt-7"><View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#FEF3C7]"><Icon name="chatbubbles-outline" size={30} color="#B45309" /></View><Text className="mt-5 text-3xl font-extrabold" style={{ color: colors.text }}>{item.nativeName || item.name}</Text><Text className="mt-1 text-lg" style={{ color: colors.textSecondary }}>{item.name}</Text><Text className="mt-4 text-base leading-6" style={{ color: colors.textSecondary }}>{item.description ?? 'Une langue vivante à découvrir avec ses locuteurs et ses contextes.'}</Text><View className="mt-7 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.card }}><Text className="font-bold" style={{ color: colors.text }}>Leçons courtes</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{lessons.data?.length ?? 0} leçon(s) publiées</Text><TouchableOpacity onPress={() => router.push(`/(explore)/languages/${code}/lessons`)} disabled={lessons.isLoading} className="mt-4 self-start rounded-xl bg-[#EF4444] px-4 py-3"><Text className="font-bold text-white">Voir les leçons</Text></TouchableOpacity></View></View></ScrollView></SafeScreen>;
}
