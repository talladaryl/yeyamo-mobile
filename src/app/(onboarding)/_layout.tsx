import { Stack } from 'expo-router';
import { useThemeStore } from '@/features/theme/theme.store';

export default function OnboardingLayout() {
  const colors = useThemeStore((state) => state.colors);
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="step1" />
      <Stack.Screen name="step2" />
      <Stack.Screen name="step3" />
    </Stack>
  );
}
