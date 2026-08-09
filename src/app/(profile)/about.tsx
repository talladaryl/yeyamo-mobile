import Constants from 'expo-constants';
import { Text, View } from 'react-native';
import { Logo } from '@/components/ui/Logo';
import { SupportPageLayout } from '@/components/profile/SupportPageLayout';
import { i18n } from '@/i18n';
import { useThemeStore } from '@/features/theme/theme.store';

export default function AboutScreen() {
  const colors = useThemeStore((state) => state.colors);
  const version = Constants.expoConfig?.version ?? i18n.t('support.versionUnknown');
  return (
    <SupportPageLayout title={i18n.t('support.aboutTitle')}>
      <View className="items-center rounded-3xl border p-6" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <Logo size="large" />
        <Text className="mt-3 text-3xl font-extrabold" style={{ color: colors.text }}>{i18n.t('support.aboutTitle')}</Text>
        <Text className="mt-2 text-center text-base font-bold" style={{ color: colors.primary }}>{i18n.t('support.signature')}</Text>
      </View>
      <Text className="mt-6 text-base leading-7" style={{ color: colors.text }}>{i18n.t('support.aboutBody')}</Text>
      <View className="mt-7 flex-row items-center justify-between border-t pt-4" style={{ borderColor: colors.border }}>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>{i18n.t('support.version')}</Text>
        <Text className="text-sm font-bold" style={{ color: colors.text }}>v{version}</Text>
      </View>
    </SupportPageLayout>
  );
}
