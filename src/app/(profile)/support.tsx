import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { SupportPageLayout } from '@/components/profile/SupportPageLayout';
import { i18n } from '@/i18n';
import { useThemeStore } from '@/features/theme/theme.store';

export default function SupportScreen() {
  const colors = useThemeStore((state) => state.colors);
  const email = process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? i18n.t('support.contactEmail');
  return (
    <SupportPageLayout title={i18n.t('support.contactTitle')}>
      <View className="rounded-2xl border p-5" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${colors.primary}12` }}><Icon name="help-circle-outline" size={28} color={colors.primary} /></View>
        <Text className="mt-4 text-base font-bold" style={{ color: colors.text }}>{i18n.t('support.contactTitle')}</Text>
        <Text className="mt-2 text-sm leading-6" style={{ color: colors.textSecondary }}>{i18n.t('support.contactDescription')}</Text>
        <TouchableOpacity onPress={() => void Linking.openURL(`mailto:${email}`)} className="mt-5 min-h-12 flex-row items-center justify-center rounded-xl px-4" style={{ backgroundColor: colors.primary }} accessibilityRole="button" accessibilityLabel={i18n.t('support.openEmail')}>
          <Icon name="mail-outline" size={19} color={colors.card} />
          <Text className="ml-2 text-sm font-bold" style={{ color: colors.card }}>{i18n.t('support.openEmail')}</Text>
        </TouchableOpacity>
        <Text className="mt-3 text-center text-xs" style={{ color: colors.textMuted }}>{email}</Text>
      </View>
    </SupportPageLayout>
  );
}
