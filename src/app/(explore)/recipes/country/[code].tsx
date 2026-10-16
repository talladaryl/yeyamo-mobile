import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CatalogListScreen } from '@/features/culture/components/CatalogListScreen';
import { useCultureContents } from '@/features/culture/culture.hooks';
import { demoRecipes, recipeCategories } from '@/features/culture/culturalCatalog.demo';
import { useAuthStore } from '@/features/auth/auth.store';
import { useThemeStore } from '@/features/theme/theme.store';
export default function CountryRecipes(){const {code}=useLocalSearchParams<{code:string}>();const demo=useAuthStore((s)=>s.sessionMode?.startsWith('demo-')??false);const colors=useThemeStore((s)=>s.colors);const query=useCultureContents({type:'RECIPE',countryCode:code,size:100});if(!demo&&query.isLoading)return <View className="flex-1 items-center justify-center" style={{backgroundColor:colors.background}}><ActivityIndicator color={colors.primary}/></View>;const source=demo?demoRecipes.filter((x)=>x.countryCode===code):(query.data?.content??[]).map((x)=>({id:x.id,name:x.slug,region:x.communityName??x.countryCode,category:x.type,imageUrl:undefined,preparationMinutes:0}));const items=source.map((x)=>({id:x.id,title:x.name,subtitle:`${x.region}${x.preparationMinutes?` · ${x.preparationMinutes} min`:''}`,category:x.category,imageUrl:x.imageUrl}));const categories=demo?recipeCategories:['Tous',...new Set(items.map((x)=>x.category))];return <CatalogListScreen title={`Cuisine · ${code}`} subtitle="Recettes publiées" categories={categories} detailBase="/(explore)/recipes" items={items}/>;}
