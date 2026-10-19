import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { CultureCategoryCard } from '@/features/culture/components/CultureCategoryCard';
import { demoLanguageCountries } from '@/features/culture/culture.demo';
import { useAvailableCountries } from '@/features/country/country.hooks';
import { useAuthStore } from '@/features/auth/auth.store';
import { useThemeStore } from '@/features/theme/theme.store';

export default function LanguageCountries(){
 const router=useRouter();const colors=useThemeStore((s)=>s.colors);const demo=useAuthStore((s)=>s.sessionMode?.startsWith('demo-')??false);const backendCountries=useAvailableCountries();
 const countries:{code:string;name:string;flag:string}[]=demo?[...demoLanguageCountries]:(backendCountries.data??[]);
 return <SafeScreen><View className="flex-row items-center px-4 py-3"><TouchableOpacity onPress={()=>router.back()} className="h-11 w-11 items-center justify-center"><Icon name="chevron-back" size={24} color={colors.text}/></TouchableOpacity><View className="ml-2 flex-1"><Text className="text-2xl font-extrabold" style={{color:colors.text}}>Langues & Culture</Text><Text className="mt-1 text-sm" style={{color:colors.textSecondary}}>Choisissez un pays.</Text></View></View>{!demo&&backendCountries.isLoading?<ActivityIndicator className="mt-16" color={colors.primary}/>:!demo&&backendCountries.isError?<View className="items-center px-8 py-20"><Text style={{color:colors.textSecondary}}>Les pays sont indisponibles.</Text><TouchableOpacity onPress={()=>backendCountries.refetch()} className="mt-4"><Text className="font-bold" style={{color:colors.primary}}>Réessayer</Text></TouchableOpacity></View>:<FlatList data={countries} numColumns={2} columnWrapperStyle={{gap:12}} keyExtractor={(item)=>item.code} contentContainerStyle={{padding:16,paddingBottom:40}} renderItem={({item})=><CultureCategoryCard title={item.name} subtitle={item.flag} icon="language-outline" onPress={()=>router.push({pathname:'/(explore)/languages/country/[code]',params:{code:item.code,name:item.name}})}/>} ListEmptyComponent={<Text className="p-8 text-center" style={{color:colors.textSecondary}}>Aucun pays disponible.</Text>}/>}</SafeScreen>;
}
