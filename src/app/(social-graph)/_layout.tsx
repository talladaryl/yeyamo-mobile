// Layout pour la section Social Graph
import { Stack } from 'expo-router';
import { useThemeStore } from '@/features/theme/theme.store';

export default function SocialGraphLayout() {
  const colors = useThemeStore((state) => state.colors);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="badges" />
      <Stack.Screen name="badges/[id]" />
      <Stack.Screen name="passport" />
      <Stack.Screen name="passport/[section]" />
    </Stack>
  );
}
