import { ActivityIndicator, Alert, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { preferredTranslation } from '@/features/culture/culture.mappers';
import { useCultureContent, useCultureGraphRelations } from '@/features/culture/culture.hooks';

export default function CultureDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const detail = useCultureContent(id);
  const related = useCultureGraphRelations(id);

  if (detail.isLoading) return <SafeScreen><View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View></SafeScreen>;
  if (detail.isError || !detail.data) return <SafeScreen><View className="flex-1 items-center justify-center px-6"><Icon name="alert-circle-outline" size={36} color={colors.primary} /><Text className="mt-4 text-center font-bold" style={{ color: colors.text }}>Ce contenu n’est pas accessible.</Text><TouchableOpacity onPress={() => detail.refetch()} className="mt-4"><Text className="font-bold" style={{ color: colors.primary }}>Réessayer</Text></TouchableOpacity></View></SafeScreen>;

  const { content, translations } = detail.data;
  const translation = preferredTranslation(translations);
  const sensitive = content.sensitivityLevel !== 'PUBLIC';
  const title = translation?.title ?? content.slug.replace(/-/g, ' ');
  const share = async () => {
    try {
      const deepLink = Linking.createURL(`/explore/culture/${id}`, { scheme: 'yeyamo' });
      await Share.share({ title, message: `${title}\n${deepLink}` });
    } catch {
      Alert.alert('Partage impossible', 'Le menu de partage du téléphone n’a pas pu être ouvert.');
    }
  };

  return <SafeScreen><ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
    <View className="flex-row items-center px-4 pt-3"><TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2" accessibilityLabel="Retour"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="ml-2 flex-1 text-lg font-bold" style={{ color: colors.text }}>Contenu culturel</Text><TouchableOpacity onPress={() => void share()} className="p-2" accessibilityLabel="Partager"><Icon name="share-outline" size={22} color={colors.text} /></TouchableOpacity></View>
    {sensitive ? <View className="mx-4 mt-4 rounded-xl p-3" style={{ backgroundColor: '#FEF3C7' }}><Text className="font-bold text-[#92400E]">Contenu à consulter avec respect</Text><Text className="mt-1 text-sm text-[#92400E]">Les règles et restrictions publiées par la communauté s’appliquent.</Text></View> : null}
    <View className="px-5 pt-7"><Text className="text-xs font-bold" style={{ color: colors.primary }}>{content.type.replace(/_/g, ' ')}</Text><Text className="mt-2 text-3xl font-extrabold" style={{ color: colors.text }}>{title}</Text><Text className="mt-3 text-sm" style={{ color: colors.textSecondary }}>{content.countryCode} · {content.primaryLanguageCode.toUpperCase()}{content.communityName ? ` · ${content.communityName}` : ''}</Text><View className="mt-6 border-t pt-5" style={{ borderColor: colors.borderSoft }}><Text className="text-base leading-7" style={{ color: colors.text }}>{translation?.body ?? translation?.summary ?? 'La traduction détaillée sera disponible dès sa publication.'}</Text></View>{translation?.summary ? <View className="mt-5 rounded-xl p-4" style={{ backgroundColor: colors.elevated }}><Text className="font-semibold" style={{ color: colors.text }}>{translation.summary}</Text></View> : null}
      {related.data?.length ? <View className="mt-8"><Text className="text-lg font-bold" style={{ color: colors.text }}>À découvrir aussi</Text>{related.data.slice(0, 6).map((item) => <View key={`${item.targetId}-${item.relationType}`} className="mt-2 rounded-xl border p-3" style={{ borderColor: colors.borderSoft, backgroundColor: colors.surface }}><Text className="font-semibold" style={{ color: colors.text }}>{item.targetLabel}</Text><Text className="mt-1 text-xs" style={{ color: colors.textMuted }}>{item.relationType}</Text></View>)}</View> : null}
      <TouchableOpacity onPress={() => void share()} className="mt-7 flex-row items-center self-start rounded-xl border px-4 py-3" style={{ borderColor: colors.borderSoft }}><Icon name="share-outline" size={19} color={colors.text} /><Text className="ml-2 font-semibold" style={{ color: colors.text }}>Partager</Text></TouchableOpacity>
      <Text className="mt-8 text-xs" style={{ color: colors.textMuted }}>Source : {content.sourceType} · Vérification : {content.verificationStatus}</Text>
    </View>
  </ScrollView></SafeScreen>;
}
