import '../../global.css';
import '@/i18n'; // Initialiser i18n
import { useEffect } from 'react';
import { Appearance, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { registerUnauthenticatedHandler } from '@/services/api/client';
import { authService } from '@/features/auth/auth.service';
import { useAuthStore } from '@/features/auth/auth.store';
import { useOnboardingStore } from '@/features/onboarding/onboarding.store';
import { useThemeStore } from '@/features/theme/theme.store';
import { useInterestsStore } from '@/features/interests/interests.store';
import { useCountryStore } from '@/features/country/country.store';
import { countryApi } from '@/features/country/country.api';
import { mapCountryConfiguration } from '@/features/country/country.mappers';
import {
  subscribeToNotificationEvents,
  subscribeToPushTokenChanges,
  synchronizePushToken,
} from '@/features/notifications/push.service';
import { AppErrorScreen } from '@/components/ui/AppErrorScreen';
import type { ErrorBoundaryProps } from 'expo-router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2, // 2 min
      gcTime: 1000 * 60 * 10,   // 10 min
    },
  },
});

export const unstable_settings = {
  initialRouteName: 'index',
};

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <AppErrorScreen error={error} onRetry={retry} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const {
    colors,
    resolvedTheme,
    hydrateTheme,
    syncSystemTheme,
  } = useThemeStore();
  const { user, isAuthenticated, isHydrated, clearAuth } = useAuthStore();
  const {
    hasCompletedInterestSelection,
    isHydrated: areInterestsHydrated,
    hydrate: hydrateInterests,
  } = useInterestsStore();
  const {
    hasCompletedLaunchFlow,
    isHydrated: isOnboardingHydrated,
    checkOnboardingStatus,
  } = useOnboardingStore();
  const hydrateCountry = useCountryStore((state) => state.hydrate);
  const selectedCountryCode = useCountryStore((state) => state.selectedCountryCode);
  const selectCountry = useCountryStore((state) => state.selectCountry);
  const applyCountryProfile = useCountryStore((state) => state.applyProfilePreferences);
  const markCountryConfigurationUnavailable = useCountryStore((state) => state.markConfigurationUnavailable);

  // Register 401 handler — clears store and redirects to login
  useEffect(() => {
    registerUnauthenticatedHandler(() => {
      clearAuth();
      router.replace('/(auth)/login');
    });
  }, [clearAuth, router]);

  // Hydrate session from SecureStore on boot
  useEffect(() => {
    authService.hydrate();
    checkOnboardingStatus();
    hydrateTheme();
    hydrateInterests();
    hydrateCountry();
  }, [hydrateCountry, hydrateInterests, hydrateTheme, checkOnboardingStatus]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(() => {
      syncSystemTheme();
    });

    return () => subscription.remove();
  }, [syncSystemTheme]);

  useEffect(() => {
    let unsubscribe: () => void = () => undefined;
    void subscribeToNotificationEvents(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }).then((cleanup) => {
      unsubscribe = cleanup;
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isHydrated || useAuthStore.getState().sessionMode !== 'backend') return;
    void synchronizePushToken();
    let unsubscribe: () => void = () => undefined;
    void subscribeToPushTokenChanges().then((cleanup) => {
      unsubscribe = cleanup;
    });
    return () => unsubscribe();
  }, [isAuthenticated, isHydrated]);

  // Profile remains the source of truth once authenticated. The persisted
  // selection only avoids a blank UI while the profile request is in flight.
  useEffect(() => {
    if (!isAuthenticated || !isHydrated || useAuthStore.getState().sessionMode !== 'backend') return;
    let active = true;
    void countryApi.myPreferences()
      .then(async (preferences) => { if (active) await applyCountryProfile(preferences); })
      .catch(() => { if (active) markCountryConfigurationUnavailable(); });
    return () => { active = false; };
  }, [applyCountryProfile, isAuthenticated, isHydrated, markCountryConfigurationUnavailable]);

  useEffect(() => {
    if (!selectedCountryCode) return;
    let active = true;
    void Promise.all([countryApi.configuration(selectedCountryCode), countryApi.features(selectedCountryCode)])
      .then(async ([configuration, features]) => {
        if (active) await selectCountry(mapCountryConfiguration(configuration, features));
      })
      .catch(() => { if (active) markCountryConfigurationUnavailable(); });
    return () => { active = false; };
  }, [markCountryConfigurationUnavailable, selectCountry, selectedCountryCode]);

  // Route guard — runs after hydration
  useEffect(() => {
    if (!isHydrated || !isOnboardingHydrated || !areInterestsHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inInterests = segments[0] === 'interests';

    // Every cold launch starts with the animated logo and keeps the full
    // onboarding group accessible until the user finishes or skips it.
    if (!hasCompletedLaunchFlow) {
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)/splash');
      }
      return;
    }

    if (!isAuthenticated && !inAuthGroup && !inOnboardingGroup) {
      router.replace('/(auth)/login');
    } else if (
      isAuthenticated
      && !hasCompletedInterestSelection
      && !inInterests
      && !inAuthGroup
    ) {
      router.replace('/interests');
    } else if (
      isAuthenticated
      && hasCompletedInterestSelection
      && (inAuthGroup || inOnboardingGroup || inInterests)
    ) {
      // A partner keeps the complete consumer experience. Professional tools are
      // exposed from the Profile tab instead of replacing the main navigation.
      router.replace('/(tabs)');
    }
  }, [
    isAuthenticated,
    isHydrated,
    isOnboardingHydrated,
    areInterestsHydrated,
    hasCompletedLaunchFlow,
    hasCompletedInterestSelection,
    user?.user_type,
    segments,
    router,
  ]);

  if (!isHydrated || !isOnboardingHydrated || !areInterestsHydrated) {
    // Splash is shown by Expo while JS loads — nothing to render here
    return null;
  }

  return (
    <>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack initialRouteName="index" screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="interests" />
        <Stack.Screen
          name="(post)/[id]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="(post)/[id]/comments"
          options={{
            presentation: 'transparentModal',
            animation: 'slide_from_bottom',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="(chat)/[id]"
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="(chat)/info/[id]"
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="(chat)/tools/[section]"
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="(story)/[id]"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen name="(places)/[id]" />
        <Stack.Screen name="(places)/route/[id]" />
        <Stack.Screen name="(events)/[id]" />
        <Stack.Screen name="(events)/[id]/tickets" />
        <Stack.Screen name="(events)/[id]/checkout" />
        <Stack.Screen name="(experiences)/[id]" />
        <Stack.Screen name="(explore)/events" />
        <Stack.Screen name="(explore)/experiences" />
        <Stack.Screen name="(explore)/places" />
        <Stack.Screen name="(explore)/search" />
        <Stack.Screen name="(explore)/map" />
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
        <Stack.Screen name="(partner)/add-place-step3" />
        <Stack.Screen name="(partner)/add-place-step4" />
        <Stack.Screen name="(partner)/add-event-step1" />
        <Stack.Screen name="(partner)/add-event-step2" />
        <Stack.Screen name="(partner)/add-event-step3" />
        <Stack.Screen name="(partner)/add-event-step4" />
        <Stack.Screen name="(partner)/offer" />
        <Stack.Screen name="(partner-dashboard)/dashboard" />
        <Stack.Screen name="(partner-dashboard)/establishments" />
        <Stack.Screen name="(partner-dashboard)/events" />
        <Stack.Screen name="(partner-dashboard)/reservations" />
        <Stack.Screen name="(partner-dashboard)/reviews" />
        <Stack.Screen name="(partner-dashboard)/statistics" />
        <Stack.Screen name="(partner-dashboard)/campaigns" />
        <Stack.Screen name="(partner-dashboard)/campaign-create" />
        <Stack.Screen name="(partner-dashboard)/campaign/[id]" />
        <Stack.Screen name="(partner-dashboard)/event/[id]/tickets" />
        <Stack.Screen name="(partner-dashboard)/event/[id]/ticket-create" />
        <Stack.Screen name="(partner-dashboard)/event/[id]/ticket-orders" />
        <Stack.Screen name="(partner-dashboard)/event/[id]/ticket-scans" />
        <Stack.Screen name="(partner-dashboard)/event/[id]/staff" />
        <Stack.Screen name="(partner-dashboard)/event/[id]/analytics" />
        <Stack.Screen name="(partner-dashboard)/promotions" />
        <Stack.Screen name="(partner-dashboard)/promotion-create" />
        <Stack.Screen name="(partner-dashboard)/finance" />
        <Stack.Screen name="(partner-dashboard)/transaction/[id]" />
        <Stack.Screen name="(partner-dashboard)/notifications" />
        <Stack.Screen name="(partner-dashboard)/settings" />
        <Stack.Screen name="(social-graph)" />
        <Stack.Screen name="(collections)" />
        <Stack.Screen name="(profile)/publications" />
        <Stack.Screen name="(profile)/favorites" />
        <Stack.Screen name="(profile)/events" />
        <Stack.Screen name="(profile)/reservations" />
        <Stack.Screen name="(profile)/reviews" />
        <Stack.Screen name="(profile)/notifications" />
        <Stack.Screen name="(profile)/settings" />
        <Stack.Screen name="(profile)/help" />
        <Stack.Screen name="(profile)/faq" />
        <Stack.Screen name="(profile)/support" />
        <Stack.Screen name="(profile)/privacy-policy" />
        <Stack.Screen name="(profile)/about" />
        <Stack.Screen name="(profile)/tickets" />
        <Stack.Screen name="(profile)/ticket/[id]" />
        <Stack.Screen name="+not-found" />
      </Stack>
      </View>
    </>
  );
}
