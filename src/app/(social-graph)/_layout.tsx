// Layout pour la section Social Graph
import { Stack } from 'expo-router';

export default function SocialGraphLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0A0A0A' },
      }}
    >
      <Stack.Screen name="badges" />
      <Stack.Screen name="badges/[id]" />
      <Stack.Screen name="passport" />
      <Stack.Screen name="passport/[section]" />
    </Stack>
  );
}
