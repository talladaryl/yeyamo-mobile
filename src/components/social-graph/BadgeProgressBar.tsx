import { Text, View } from 'react-native';
import { AnimatedProgressBar } from './AnimatedProgressBar';
import { useThemeStore } from '@/features/theme/theme.store';

export function BadgeProgressBar({ currentXP, nextLevelXP }: { currentXP: number; nextLevelXP: number }) {
  const colors = useThemeStore((state) => state.colors);
  const safeTarget = Math.max(nextLevelXP, 1); const percentage = Math.min((currentXP / safeTarget) * 100, 100); const remaining = Math.max(nextLevelXP - currentXP, 0);
  return <View><View className="mb-3 flex-row justify-between"><Text className="text-sm" style={{ color: colors.textSecondary }}>Progression</Text><Text className="text-sm font-bold" style={{ color: colors.text }}>{currentXP.toLocaleString('fr-FR')} / {nextLevelXP.toLocaleString('fr-FR')} XP</Text></View><AnimatedProgressBar value={percentage} height={11} /><Text className="mt-3 text-xs font-semibold text-[#16A34A]">{remaining > 0 ? `Plus que ${remaining.toLocaleString('fr-FR')} XP pour le prochain niveau` : 'Niveau accompli'}</Text></View>;
}
