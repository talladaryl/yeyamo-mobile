import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A' } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="account-type" />
      <Stack.Screen name="register" />
      <Stack.Screen name="register-partner" />
      <Stack.Screen name="register-partner-multistep" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-code" />
    </Stack>
  );
}
