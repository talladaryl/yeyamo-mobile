import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import type { CultureChallenge } from '../culture.types';

export function CultureChallengeCard({ challenge, onPress }: { challenge: CultureChallenge; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} accessibilityRole="button" accessibilityLabel={`Défi ${challenge.title}`} className="mr-3 w-64 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
    <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EDE9FE]"><Icon name="trophy-outline" size={21} color="#7C3AED" /></View>
    <Text className="mt-4 font-bold" style={{ color: colors.text }} numberOfLines={2}>{challenge.title}</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }} numberOfLines={2}>{challenge.description}</Text>
    <Text className="mt-3 text-xs font-bold text-[#7C3AED]">Participer</Text>
  </TouchableOpacity>;
}
