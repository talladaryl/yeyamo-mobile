import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CatalogListScreen } from '@/features/culture/components/CatalogListScreen';
import { useCultureContents } from '@/features/culture/culture.hooks';
import { demoProverbs } from '@/features/culture/culturalCatalog.demo';
import { useAuthStore } from '@/features/auth/auth.store';
import { useThemeStore } from '@/features/theme/theme.store';
export default function ProverbResults(){const {slug,name,kind}=useLocalSearchParams<{slug:string;name?:string;kind?:string}>();const demo=useAuthStore((s)=>s.sessionMode?.startsWith('demo-')??false);const colors=useThemeStore((s)=>s.colors);const query=useCultureContents({type:'PROVERB',languageCode:kind==='language'?slug:undefined,size:100});if(!demo&&query.isLoading)return <View className="flex-1 items-center justify-center" style={{backgroundColor:colors.background}}><ActivityIndicator color={colors.primary}/></View>;const items=demo?demoProverbs.filter((x)=>x.category===slug).map((x)=>({id:x.id,title:x.text,subtitle:`${x.region} · ${x.language.toUpperCase()}`,category:x.category,imageUrl:x.imageUrl})):(query.data?.content??[]).map((x)=>({id:x.id,title:x.slug,subtitle:x.communityName??x.primaryLanguageCode,category:x.primaryLanguageCode,imageUrl:undefined}));return <CatalogListScreen title={name??'Proverbes'} subtitle="Proverbes publiés" categories={['Tous']} detailBase="/(explore)/proverbs" items={items}/>;}
