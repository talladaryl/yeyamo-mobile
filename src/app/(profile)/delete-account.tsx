import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useThemeStore } from '@/features/theme/theme.store';

/**
 * Intentionally non-destructive until the account-owner explicitly authorizes
 * wiring the irreversible server calls in this client build.
 */
export default function DeleteAccountScreen() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors);
  return <SafeScreen><View className="flex-row items-center border-b px-4 py-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2" accessibilityRole="button" accessibilityLabel="Retour"><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="ml-2 text-xl font-bold" style={{ color: colors.text }}>Gérer le compte</Text></View><ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}><View className="rounded-2xl border p-5" style={{ backgroundColor: colors.surface, borderColor: colors.border }}><Ionicons name="shield-outline" size={30} color={colors.primary} /><Text className="mt-4 text-xl font-extrabold" style={{ color: colors.text }}>Action protégée</Text><Text className="mt-2 leading-6" style={{ color: colors.textSecondary }}>La désactivation et la suppression définitive sont des actions irréversibles côté serveur. Cet écran ne simule plus de succès ni de déconnexion locale.</Text><Text className="mt-3 leading-6" style={{ color: colors.textSecondary }}>Les routes backend confirmées existent, mais leur activation dans le client nécessite l’autorisation explicite du propriétaire du compte.</Text></View><View className="mt-5 rounded-2xl border p-5" style={{ backgroundColor: colors.surface, borderColor: colors.border }}><Text className="font-bold" style={{ color: colors.text }}>Besoin d’aide ?</Text><Text className="mt-2 leading-6" style={{ color: colors.textSecondary }}>Contactez l’assistance depuis les paramètres avant toute action irréversible.</Text><TouchableOpacity onPress={() => router.push('/(profile)/support')} className="mt-4 self-start rounded-xl px-4 py-3" style={{ backgroundColor: colors.elevated }} accessibilityRole="button"><Text className="font-semibold" style={{ color: colors.text }}>Ouvrir le support</Text></TouchableOpacity></View></ScrollView></SafeScreen>;
}
