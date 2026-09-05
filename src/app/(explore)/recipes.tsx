import { ActivityIndicator, View } from 'react-native';
import { CatalogListScreen } from '@/features/culture/components/CatalogListScreen';
import { useCultureContents } from '@/features/culture/culture.hooks';
import { demoRecipes, recipeCategories } from '@/features/culture/culturalCatalog.demo';
import { useAuthStore } from '@/features/auth/auth.store';
import { useThemeStore } from '@/features/theme/theme.store';

export default function RecipesScreen() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const colors = useThemeStore((state) => state.colors);
  const query = useCultureContents({ type: 'RECIPE', size: 100 });
  if (!isDemo && query.isLoading) return <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}><ActivityIndicator color={colors.primary} /></View>;
  const items = isDemo ? demoRecipes.map((item) => ({ id: item.id, title: item.name, subtitle: `${item.region} · ${item.preparationMinutes} min`, category: item.category, imageUrl: item.imageUrl })) : (query.data?.content ?? []).map((item) => ({ id: item.id, title: item.slug, subtitle: item.communityName ?? 'Non renseigné', category: item.type, imageUrl: undefined }));
  const categories = isDemo ? recipeCategories : ['Tous', ...new Set(items.map((item) => item.category))];
  return <CatalogListScreen title="Cuisine camerounaise" subtitle={isDemo ? 'Catalogue de démonstration' : 'Contenus culturels publiés'} categories={categories} detailBase="/(explore)/recipes" items={items} />;
}
