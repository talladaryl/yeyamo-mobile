import type { ReactNode } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

export function PassportPage({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const back = () => router.canGoBack() ? router.back() : router.replace('/(social-graph)/passport');
  return (
    <SafeScreen>
      <View className="flex-row items-center border-b px-4 pb-3 pt-2" style={{ borderColor: colors.border }}>
        <TouchableOpacity onPress={back} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="chevron-back" size={22} color={colors.text} /></TouchableOpacity>
        <View className="ml-3 flex-1"><Text className="text-xl font-extrabold" style={{ color: colors.text }}>{title}</Text>{subtitle ? <Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{subtitle}</Text> : null}</View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 36 }} showsVerticalScrollIndicator={false}>{children}</ScrollView>
    </SafeScreen>
  );
}

export function PassportSectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mb-3 mt-6 flex-row items-center justify-between"><Text className="text-lg font-extrabold" style={{ color: colors.text }}>{title}</Text>{action ? <TouchableOpacity onPress={onAction}><Text className="text-xs font-bold text-[#EF4444]">{action}</Text></TouchableOpacity> : null}</View>;
}

export function AnimatedCard({ children, index = 0, className = '' }: { children: ReactNode; index?: number; className?: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <Animated.View entering={FadeInDown.delay(Math.min(index * 60, 360)).duration(420)} className={`rounded-2xl border ${className}`} style={{ backgroundColor: colors.card, borderColor: colors.border }}>{children}</Animated.View>;
}
