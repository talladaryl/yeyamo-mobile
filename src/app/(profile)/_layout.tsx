import { Stack } from 'expo-router';
import { useThemeStore } from '@/features/theme/theme.store';

const titles: Record<string, string> = {
  search: 'Recherche utilisateur',
  suggestions: 'Suggestions',
  'find-friends': 'Trouver des amis',
  activity: 'Activité',
  'social-settings': 'Paramètres réseau',
  followers: 'Abonnés',
  following: 'Abonnements',
  'place-suggestions': 'Mes suggestions de lieux',
};

export default function ProfileLayout() {
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

  return (
    <Stack screenOptions={{ ...headerOptions, headerShown: false }}>
      {Object.entries(titles).map(([name, title]) => <Stack.Screen key={name} name={name} options={{ ...headerOptions, title }} />)}
    </Stack>
  );
}
