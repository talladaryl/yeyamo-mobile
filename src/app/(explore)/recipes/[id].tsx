import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useCultureContent } from '@/features/culture/culture.hooks';
import { demoRecipes } from '@/features/culture/culturalCatalog.demo';
import { useAuthStore } from '@/features/auth/auth.store';
import { useThemeStore } from '@/features/theme/theme.store';

function formatIngredient(name: string, quantity: string | null, unit: string | null) { return [quantity, unit, name].filter(Boolean).join(' '); }

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(); const router = useRouter(); const colors = useThemeStore((state) => state.colors);
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false); const query = useCultureContent(id);
  const demo = demoRecipes.find((value) => value.id === id);
  if (!isDemo && query.isLoading) return <SafeScreen><ActivityIndicator className="mt-20" color={colors.primary} /></SafeScreen>;
  if ((isDemo && !demo) || (!isDemo && !query.data)) return <Missing />;
  const content = query.data?.content; const translation = !isDemo ? query.data?.translations[0] : undefined; const details = content?.recipeDetails;
  const hasStructuredRecipe = !isDemo && Boolean(details && (details.ingredients.length || details.steps.length));

  return <SafeScreen><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}><TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center" accessibilityLabel="Retour"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="mt-4 text-3xl font-extrabold" style={{ color: colors.text }}>{isDemo ? demo!.name : translation?.title ?? content!.slug}</Text><Text className="mt-2 text-xs font-bold" style={{ color: colors.primary }}>{isDemo ? demo!.category : content!.type}</Text>
    {isDemo || hasStructuredRecipe ? <><View className="mt-5 flex-row gap-4">{(isDemo ? demo!.preparationMinutes : details?.prepTimeMinutes) ? <Text style={{ color: colors.textSecondary }}>Préparation : {isDemo ? demo!.preparationMinutes : details!.prepTimeMinutes} min</Text> : null}{!isDemo && details?.servings ? <Text style={{ color: colors.textSecondary }}>{details.servings} portions</Text> : null}</View><Text className="mt-5 text-lg font-bold" style={{ color: colors.text }}>Ingrédients</Text>{isDemo ? demo!.ingredients.map((value) => <Text key={value} className="mt-2" style={{ color: colors.textSecondary }}>• {value}</Text>) : details!.ingredients.map((item, index) => <Text key={`${item.name}-${index}`} className="mt-2" style={{ color: colors.textSecondary }}>• {formatIngredient(item.name, item.quantity, item.unit)}</Text>)}<Text className="mt-6 text-lg font-bold" style={{ color: colors.text }}>Préparation</Text>{isDemo ? demo!.steps.map((value, index) => <Text key={`${value}-${index}`} className="mt-2" style={{ color: colors.textSecondary }}>{index + 1}. {value}</Text>) : details!.steps.map((item, index) => <Text key={`${item.instruction}-${index}`} className="mt-2" style={{ color: colors.textSecondary }}>{index + 1}. {item.instruction}</Text>)}</> : <Text className="mt-5 leading-6" style={{ color: colors.textSecondary }}>{translation?.body ?? translation?.summary ?? 'Cette recette ne contient pas encore de préparation détaillée.'}</Text>}</ScrollView></SafeScreen>;
}
function Missing() { const colors = useThemeStore((state) => state.colors); return <SafeScreen><View className="flex-1 items-center justify-center"><Text style={{ color: colors.text }}>Recette introuvable.</Text></View></SafeScreen>; }
