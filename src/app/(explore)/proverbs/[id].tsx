import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { RemoteAudioPlayer } from '@/features/culture/components/RemoteAudioPlayer';
import { useCultureContent } from '@/features/culture/culture.hooks';
import { demoProverbs } from '@/features/culture/culturalCatalog.demo';
import { useAuthStore } from '@/features/auth/auth.store';
import { useThemeStore } from '@/features/theme/theme.store';

export default function ProverbDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const query = useCultureContent(id);
  const demo = demoProverbs.find((value) => value.id === id);

  if (!isDemo && query.isLoading) return <SafeScreen><ActivityIndicator className="mt-20" color={colors.primary} /></SafeScreen>;
  if ((isDemo && !demo) || (!isDemo && !query.data)) return <Missing />;

  const content = query.data?.content;
  const translation = !isDemo ? query.data?.translations[0] : undefined;
  const details = content?.proverbDetails;
  const meaning = isDemo ? demo!.meaning : details?.meaning ?? translation?.body ?? translation?.summary;

  return <SafeScreen><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
    <TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center" accessibilityLabel="Retour">
      <Icon name="chevron-back" size={24} color={colors.text} />
    </TouchableOpacity>
    <Text className="mt-8 text-3xl font-extrabold" style={{ color: colors.text }}>“{isDemo ? demo!.text : translation?.title ?? content!.slug}”</Text>
    <Text className="mt-4 text-sm font-bold" style={{ color: colors.primary }}>{isDemo ? demo!.language.toUpperCase() : details?.originLanguageCode ?? content!.primaryLanguageCode}</Text>
    {!isDemo && details?.literalTranslation ? <View className="mt-6 rounded-xl p-4" style={{ backgroundColor: colors.elevated }}><Text className="text-xs font-bold" style={{ color: colors.textSecondary }}>TRADUCTION LITTÉRALE</Text><Text className="mt-1 text-base" style={{ color: colors.text }}>{details.literalTranslation}</Text></View> : null}
    {meaning ? <><Text className="mt-6 text-lg font-bold" style={{ color: colors.text }}>Sens</Text><Text className="mt-2 leading-7" style={{ color: colors.textSecondary }}>{meaning}</Text></> : null}
    {!isDemo ? <View className="mt-6"><RemoteAudioPlayer source={details?.audioUrl} transcript={translation?.title ?? null} label="Écouter la prononciation" /></View> : null}
  </ScrollView></SafeScreen>;
}

function Missing() { const colors = useThemeStore((state) => state.colors); return <SafeScreen><View className="flex-1 items-center justify-center"><Text style={{ color: colors.text }}>Proverbe introuvable.</Text></View></SafeScreen>; }
