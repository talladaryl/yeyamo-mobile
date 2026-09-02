import { Stack } from 'expo-router';
import { useThemeStore } from '@/features/theme/theme.store';

export default function AuthLayout() {
  const backgroundColor = useThemeStore((state) => state.colors.background);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="account-type" />
      <Stack.Screen name="register" />
      <Stack.Screen name="register-partner" />
      <Stack.Screen name="register-partner-multistep" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-code" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
