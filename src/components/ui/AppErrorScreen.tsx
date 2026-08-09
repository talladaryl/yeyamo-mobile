import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

type AppErrorScreenProps = {
  title?: string;
  message?: string;
  error?: Error;
  onRetry?: () => void;
  showContinue?: boolean;
};

export function AppErrorScreen({
  title = 'Une erreur est survenue',
  message = "Cette page n'a pas pu être affichée. Vous pouvez réessayer ou continuer vos tests.",
  error,
  onRetry,
  showContinue = true,
}: AppErrorScreenProps) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-6">
        <View
          className="h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: '#FEE2E2' }}
        >
          <Icon name="alert-circle-outline" size={44} color="#DC2626" />
        </View>

        <Text className="mt-6 text-center text-2xl font-extrabold" style={{ color: colors.text }}>
          {title}
        </Text>
        <Text className="mt-3 text-center text-sm leading-6" style={{ color: colors.textSecondary }}>
          {message}
        </Text>

        {__DEV__ && error?.message ? (
          <View
            className="mt-5 w-full rounded-xl border p-3"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Text className="text-xs font-bold" style={{ color: colors.textSecondary }}>
              Détail technique
            </Text>
            <Text className="mt-1 text-xs leading-5" selectable style={{ color: colors.textMuted }}>
              {error.message}
            </Text>
          </View>
        ) : null}

        <View className="mt-7 w-full gap-3">
          {onRetry ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Réessayer de charger la page"
              onPress={onRetry}
              className="items-center rounded-xl bg-[#EF4444] px-5 py-4"
            >
              <Text className="font-bold text-white">Réessayer</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Revenir à la page précédente"
            onPress={goBack}
            className="items-center rounded-xl border px-5 py-4"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Text className="font-bold" style={{ color: colors.text }}>Retour</Text>
          </TouchableOpacity>

          {showContinue ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Ignorer cette erreur et continuer vers l'accueil"
              onPress={() => router.replace('/(tabs)')}
              className="items-center px-5 py-3"
            >
              <Text className="font-semibold text-[#EF4444]">Ignorer et continuer les tests</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </SafeScreen>
  );
}
