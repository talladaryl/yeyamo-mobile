import '../../../global.css';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { registerUnauthenticatedHandler } from '@/services/api/client';
import { authService } from '@/features/auth/auth.service';
import { useAuthStore } from '@/features/auth/auth.store';
import { useOnboardingStore } from '@/features/onboarding/onboarding.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2, // 2 min
      gcTime: 1000 * 60 * 10,   // 10 min
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const { hasSeenOnboarding, checkOnboardingStatus } = useOnboardingStore();

  // Register 401 handler — clears store and redirects to login
  useEffect(() => {
    registerUnauthenticatedHandler(() => {
      router.replace('/(auth)/login');
    });
  }, [router]);

  // Hydrate session from SecureStore on boot
  useEffect(() => {
    authService.hydrate();
    checkOnboardingStatus();
  }, []);

  // Route guard — runs after hydration
  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!hasSeenOnboarding && !inOnboardingGroup) {
      router.replace('/(onboarding)/splash');
    } else if (!isAuthenticated && !inAuthGroup && hasSeenOnboarding) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && (inAuthGroup || inOnboardingGroup)) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isHydrated, hasSeenOnboarding, segments, router]);

  if (!isHydrated) {
    // Splash is shown by Expo while JS loads — nothing to render here
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(post)/[id]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="(chat)/[id]"
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="(story)/[id]"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen name="(places)/[id]" />
        <Stack.Screen name="(events)/[id]" />
        <Stack.Screen name="(experiences)/[id]" />
        <Stack.Screen name="(explore)/events" />
        <Stack.Screen name="(explore)/experiences" />
        <Stack.Screen name="(create)/choice" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(create)/publication" />
        <Stack.Screen name="(create)/story" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="(create)/event" />
        <Stack.Screen name="(create)/event-settings" />
        <Stack.Screen name="(create)/suggest-place-step1" />
        <Stack.Screen name="(create)/suggest-place-step2" />
        <Stack.Screen name="(partner)/choice" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(partner)/publication" />
        <Stack.Screen name="(partner)/story" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="(partner)/add-place-step1" />
        <Stack.Screen name="(partner)/add-place-step2" />
        <Stack.Screen name="(partner)/add-event-step1" />
        <Stack.Screen name="(partner)/add-event-step2" />
        <Stack.Screen name="(partner-dashboard)/dashboard" />
        <Stack.Screen name="(partner-dashboard)/establishments" />
        <Stack.Screen name="(partner-dashboard)/events" />
        <Stack.Screen name="(partner-dashboard)/reservations" />
        <Stack.Screen name="(partner-dashboard)/reviews" />
        <Stack.Screen name="(partner-dashboard)/statistics" />
        <Stack.Screen name="(partner-dashboard)/notifications" />
        <Stack.Screen name="(partner-dashboard)/settings" />
        <Stack.Screen name="(social-graph)/badges" />
        <Stack.Screen name="(social-graph)/badges/[id]" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
