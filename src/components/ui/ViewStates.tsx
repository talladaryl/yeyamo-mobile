import type { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useThemeStore } from '@/features/theme/theme.store';

export function LoadingState({ label = 'Chargement…' }: { label?: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="flex-1 items-center justify-center px-6"><ActivityIndicator color={colors.primary} /><Text className="mt-3 text-center" style={{ color: colors.textSecondary }}>{label}</Text></View>;
}

export function ErrorState({ title = 'Impossible de charger cette page', message, retry }: { title?: string; message?: string; retry?: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="flex-1 items-center justify-center px-8"><Text className="text-center text-lg font-bold" style={{ color: colors.text }}>{title}</Text>{message ? <Text className="mt-2 text-center" style={{ color: colors.textSecondary }}>{message}</Text> : null}{retry ? <View className="mt-5"><Button label="Réessayer" onPress={retry} /></View> : null}</View>;
}

export function EmptyState({ title, message, icon }: { title: string; message?: string; icon?: ReactNode }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="flex-1 items-center justify-center px-8">{icon}<Text className="mt-4 text-center text-lg font-semibold" style={{ color: colors.text }}>{title}</Text>{message ? <Text className="mt-2 text-center" style={{ color: colors.textSecondary }}>{message}</Text> : null}</View>;
}
