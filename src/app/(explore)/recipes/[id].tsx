import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useCultureContent } from '@/features/culture/culture.hooks';
import { demoRecipes } from '@/features/culture/culturalCatalog.demo';
import { useAuthStore } from '@/features/auth/auth.store';
import { useThemeStore } from '@/features/theme/theme.store';

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(); const router = useRouter(); const colors = useThemeStore((state) => state.colors); const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false); const query = useCultureContent(id);
  const demo = demoRecipes.find((value) => value.id === id);
  if (!isDemo && query.isLoading) return <SafeScreen><ActivityIndicator className="mt-20" color={colors.primary} /></SafeScreen>;
  if (isDemo && !demo) return <Missing />;
  if (!isDemo && !query.data) return <Missing />;
  const translation = !isDemo ? query.data?.translations[0] : undefined;
  return <SafeScreen><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}><TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="mt-4 text-3xl font-extrabold" style={{ color: colors.text }}>{isDemo ? demo!.name : translation?.title ?? query.data!.content.slug}</Text><Text className="mt-2 text-xs font-bold" style={{ color: colors.primary }}>{isDemo ? demo!.category : query.data!.content.type}</Text>{isDemo ? <><Text className="mt-5 text-lg font-bold" style={{ color: colors.text }}>Ingrédients</Text>{demo!.ingredients.map((value) => <Text key={value} className="mt-2" style={{ color: colors.textSecondary }}>• {value}</Text>)}<Text className="mt-6 text-lg font-bold" style={{ color: colors.text }}>Préparation</Text>{demo!.steps.map((value, index) => <Text key={value} className="mt-2" style={{ color: colors.textSecondary }}>{index + 1}. {value}</Text>)}</> : <Text className="mt-5 leading-6" style={{ color: colors.textSecondary }}>{translation?.body ?? translation?.summary ?? 'Non renseigné'}</Text>}</ScrollView></SafeScreen>;
}
function Missing() { const colors = useThemeStore((state) => state.colors); return <SafeScreen><View className="flex-1 items-center justify-center"><Text style={{ color: colors.text }}>Recette introuvable.</Text></View></SafeScreen>; }
