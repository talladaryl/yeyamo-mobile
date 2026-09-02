import { CatalogListScreen } from '@/features/culture/components/CatalogListScreen';
import { demoRecipes, recipeCategories } from '@/features/culture/culturalCatalog.demo';
export default function RecipesScreen() { return <CatalogListScreen title="Cuisine camerounaise" subtitle="100 recettes, boissons et accompagnements" categories={recipeCategories} detailBase="/(explore)/recipes" items={demoRecipes.map((item) => ({ id: item.id, title: item.name, subtitle: `${item.region} · ${item.preparationMinutes} min`, category: item.category, imageUrl: item.imageUrl }))} />; }
