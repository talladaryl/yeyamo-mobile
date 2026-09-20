import { Stack } from 'expo-router';
import { useThemeStore } from '@/features/theme/theme.store';

const titles: Record<string, string> = {
  event: 'Créer une sortie',
  'event-location': 'Lieu de la sortie',
  'event-organization': 'Organisation de la sortie',
  'event-settings': 'Visibilité de la sortie',
  'event-review': 'Vérifier la sortie',
  'suggest-place-step1': 'Suggérer un lieu',
  'suggest-place-step2': 'Localisation du lieu',
  'suggest-place-details': 'Détails du lieu',
  'suggest-place-review': 'Vérifier la suggestion',
  'culture-contribution': 'Transmettre un savoir',
};

export default function CreateLayout() {
  const colors = useThemeStore((state) => state.colors);
  const headerOptions = {
    headerShown: true,
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
    headerTitleStyle: { fontSize: 18, fontWeight: '600' as const },
    headerBackTitle: 'Retour',
    headerBackTitleVisible: false,
    contentStyle: { backgroundColor: colors.background },
  };

  return <Stack screenOptions={{ ...headerOptions, headerShown: false }}>
    <Stack.Screen name="choice" options={{ headerShown: false, presentation: 'modal' }} />
    {Object.entries(titles).map(([name, title]) => <Stack.Screen key={name} name={name} options={{ ...headerOptions, title }} />)}
    <Stack.Screen name="publication" options={{ ...headerOptions, title: 'Créer une publication' }} />
    <Stack.Screen name="story" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
  </Stack>;
}
