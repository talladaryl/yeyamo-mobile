import type { ReactNode } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { i18n } from '@/i18n';

export function SupportPageLayout({ title, children }: { title: string; children: ReactNode }) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);

  return (
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center border-b px-4 py-3" style={{ borderColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }} accessibilityRole="button" accessibilityLabel={i18n.t('common.back')}>
          <Icon name="chevron-back" size={23} color={colors.text} />
        </TouchableOpacity>
        <Text className="ml-3 flex-1 text-xl font-extrabold" style={{ color: colors.text }}>{title}</Text>
      </View>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
