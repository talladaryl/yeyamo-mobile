import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { CatalogListScreen } from '@/features/culture/components/CatalogListScreen';
import { useInfiniteCultureContents } from '@/features/culture/culture.hooks';
import { demoRecipeFixtures, demoRecipeCategories } from '@/features/culture/recipe.demo';
import { recipeCountryCatalog } from '@/features/country/recipe-country-catalog';
import { getMediaAttachments } from '@/features/media/media.api';
import { useAuthStore } from '@/features/auth/auth.store';
import { useThemeStore } from '@/features/theme/theme.store';

export default function CountryRecipes(){
 const {code}=useLocalSearchParams<{code:string}>();const demo=useAuthStore((state)=>state.sessionMode?.startsWith('demo-')??false);const colors=useThemeStore((state)=>state.colors);const query=useInfiniteCultureContents({type:'RECIPE',countryCode:code,size:20});const contents=query.data?.pages.flatMap((page)=>page.content)??[];const heroIds=demo?[]:contents.map((item)=>item.recipeDetails?.heroMediaId).filter((value):value is string=>Boolean(value));const media=useQuery({queryKey:['recipe-list-media',code,heroIds],enabled:heroIds.length>0,queryFn:()=>getMediaAttachments(heroIds)});
 if(!demo&&query.isLoading)return <View className="flex-1 items-center justify-center" style={{backgroundColor:colors.background}}><ActivityIndicator color={colors.primary}/></View>;
 if(!demo&&query.isError)return <View className="flex-1 items-center justify-center px-8" style={{backgroundColor:colors.background}}><Text className="text-center" style={{color:colors.textSecondary}}>Impossible de charger les recettes publiées.</Text><TouchableOpacity onPress={()=>query.refetch()} className="mt-4"><Text className="font-bold" style={{color:colors.primary}}>Réessayer</Text></TouchableOpacity></View>;
 const source=demo?demoRecipeFixtures.filter((item)=>item.countryCode===code).map((item)=>({id:item.id,name:item.title,region:item.region??item.countryName,category:item.category,imageUrl:item.details.heroMediaUrl??undefined,preparationMinutes:item.details.prepTimeMinutes??0})):contents.map((item)=>({id:item.id,name:item.slug,region:item.communityName??item.countryCode,category:'Recette',imageUrl:item.recipeDetails?.heroMediaId?media.data?.get(item.recipeDetails.heroMediaId)?.url:undefined,preparationMinutes:item.recipeDetails?.prepTimeMinutes??0}));
 const items=source.map((item)=>({id:item.id,title:item.name,subtitle:`${item.region}${item.preparationMinutes?` · ${item.preparationMinutes} min`:''}`,category:item.category,imageUrl:item.imageUrl}));const categories=demo?demoRecipeCategories:['Tous',...new Set(items.map((item)=>item.category))];const country=recipeCountryCatalog.find((item)=>item.code===code);
 return <CatalogListScreen title={country?`${country.flag} ${country.name}`:`Cuisine · ${code}`} subtitle={demo?'Catalogue fictif de démonstration':'Recettes réellement publiées'} categories={categories} detailBase="/(explore)/recipes" items={items} loadingMore={query.isFetchingNextPage} onEndReached={()=>{if(query.hasNextPage&&!query.isFetchingNextPage)void query.fetchNextPage();}}/>;
}
