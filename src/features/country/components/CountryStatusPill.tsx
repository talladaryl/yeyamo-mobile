import { Text, View } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';
import type { CountryStatus } from '../country.types';

const labels: Record<CountryStatus, string> = { LIVE: 'Disponible', BETA: 'Bêta', COMING_SOON: 'Bientôt disponible', DISABLED: 'Indisponible' };
export function CountryStatusPill({ status }: { status: CountryStatus }) {
  const colors = useThemeStore((state) => state.colors);
  const backgroundColor = status === 'LIVE' ? '#DCFCE7' : status === 'BETA' ? '#FEF3C7' : colors.elevated;
  const color = status === 'LIVE' ? '#166534' : status === 'BETA' ? '#92400E' : colors.textSecondary;
  return <View className="rounded-full px-2.5 py-1" style={{ backgroundColor }}><Text className="text-xs font-bold" style={{ color }}>{labels[status]}</Text></View>;
}
