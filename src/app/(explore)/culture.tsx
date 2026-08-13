import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { useCountryStore } from '@/features/country/country.store';
import { CultureChallengeCard } from '@/features/culture/components/CultureChallengeCard';
import { CultureContentCard } from '@/features/culture/components/CultureContentCard';
import { LanguageCard } from '@/features/culture/components/LanguageCard';
import { useChallenges, useCultureContents, useCultureLanguages, useDailyWord } from '@/features/culture/culture.hooks';

export default function CultureExploreScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const countryCode = useCountryStore((state) => state.selectedCountryCode ?? undefined);
  const contents = useCultureContents({ verified: true, countryCode, size: 12 });
  const languages = useCultureLanguages();
  const challenges = useChallenges();
  const dailyWord = useDailyWord();
  const failed = contents.isError || languages.isError || challenges.isError;

  return <SafeScreen><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
    <View className="flex-row items-center px-4 pt-3">
      <TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2" accessibilityLabel="Retour"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
      <View className="ml-2 flex-1"><Text className="text-2xl font-extrabold" style={{ color: colors.text }}>Cultures à découvrir</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>Histoires, langues et savoirs transmis.</Text></View>
    </View>
    {!countryCode ? <StateCard title="Pays à sélectionner" description="Choisissez votre pays dans vos préférences pour afficher les contenus locaux." onRetry={() => router.push('/(profile)/preferences')} /> : null}
    {failed ? <StateCard onRetry={() => { void contents.refetch(); void languages.refetch(); void challenges.refetch(); }} /> : null}
    <Section title="Mot du jour" route="/(explore)/languages"><View className="mx-4 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      {dailyWord.isLoading ? <ActivityIndicator color={colors.primary} /> : dailyWord.data ? <TouchableOpacity onPress={() => router.push(`/(explore)/culture/${dailyWord.data.id}`)}><Text className="text-xs font-bold text-[#B91C1C]">{dailyWord.data.primaryLanguageCode.toUpperCase()}</Text><Text className="mt-2 text-lg font-bold" style={{ color: colors.text }}>{dailyWord.data.slug.replace(/-/g, ' ')}</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>Découvrir le mot et son contexte culturel</Text></TouchableOpacity> : <Text style={{ color: colors.textSecondary }}>Aucun mot publié aujourd’hui.</Text>}
    </View></Section>
    <Section title="À transmettre"><Horizontal loading={contents.isLoading}>{contents.data?.content.map((item) => <CultureContentCard key={item.id} content={item} onPress={() => router.push(`/(explore)/culture/${item.id}`)} />)}</Horizontal></Section>
    <Section title="Langues" route="/(explore)/languages"><Horizontal loading={languages.isLoading}>{languages.data?.map((language) => <LanguageCard key={language.code} language={language} onPress={() => router.push(`/(explore)/languages/${language.code}`)} />)}</Horizontal></Section>
    <Section title="Défis culturels" route="/(explore)/challenges"><Horizontal loading={challenges.isLoading}>{challenges.data?.content.map((challenge) => <CultureChallengeCard key={challenge.id} challenge={challenge} onPress={() => router.push(`/(explore)/challenges/${challenge.id}`)} />)}</Horizontal></Section>
    <View className="mx-4 mt-3 flex-row gap-3"><Shortcut icon="leaf-outline" label="Traditions" onPress={() => router.push('/(explore)/traditions')} /><Shortcut icon="book-outline" label="Récits" onPress={() => router.push('/(explore)/stories')} /></View>
  </ScrollView></SafeScreen>;
}

function Section({ title, route, children }: { title: string; route?: string; children: React.ReactNode }) { const router = useRouter(); const colors = useThemeStore((state) => state.colors); return <View className="mt-7"><View className="mb-3 flex-row items-center justify-between px-4"><Text className="text-lg font-bold" style={{ color: colors.text }}>{title}</Text>{route ? <TouchableOpacity onPress={() => router.push(route as never)}><Text className="text-sm font-bold text-[#EF4444]">Voir tout</Text></TouchableOpacity> : null}</View>{children}</View>; }
function Horizontal({ loading, children }: { loading: boolean; children: React.ReactNode }) { const colors = useThemeStore((state) => state.colors); return loading ? <View className="h-28 items-center justify-center"><ActivityIndicator color={colors.primary} /></View> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>{children}</ScrollView>; }
function StateCard({ onRetry, title = 'Impossible de charger la culture', description = 'Vérifiez votre connexion puis réessayez.' }: { onRetry: () => void; title?: string; description?: string }) { const colors = useThemeStore((state) => state.colors); return <View className="mx-4 mt-5 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Icon name="cloud-offline-outline" size={24} color={colors.primary} /><Text className="mt-2 font-bold" style={{ color: colors.text }}>{title}</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{description}</Text><TouchableOpacity onPress={onRetry} className="mt-3 self-start"><Text className="font-bold text-[#EF4444]">{title === 'Pays à sélectionner' ? 'Ouvrir les préférences' : 'Réessayer'}</Text></TouchableOpacity></View>; }
function Shortcut({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) { const colors = useThemeStore((state) => state.colors); return <TouchableOpacity onPress={onPress} className="flex-1 rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Icon name={icon} size={22} color={colors.primary} /><Text className="mt-2 font-bold" style={{ color: colors.text }}>{label}</Text></TouchableOpacity>; }
