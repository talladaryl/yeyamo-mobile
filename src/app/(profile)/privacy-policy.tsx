import { Text, View } from 'react-native';
import { SupportPageLayout } from '@/components/profile/SupportPageLayout';
import { i18n } from '@/i18n';
import { useThemeStore } from '@/features/theme/theme.store';

const SECTION_KEYS = ['collected', 'use', 'location', 'content', 'security', 'choices', 'contact'] as const;

export default function PrivacyPolicyScreen() {
  const colors = useThemeStore((state) => state.colors);
  return (
    <SupportPageLayout title={i18n.t('support.privacyPolicyTitle')}>
      <View className="mb-5 rounded-2xl border p-4" style={{ backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}35` }}>
        <Text className="text-sm leading-6" style={{ color: colors.text }}>{i18n.t('support.privacyNotice')}</Text>
      </View>
      {SECTION_KEYS.map((key) => (
        <View key={key} className="mb-5">
          <Text className="mb-2 text-base font-extrabold" style={{ color: colors.text }}>{i18n.t(`support.privacySections.${key}.title`)}</Text>
          <Text className="text-sm leading-6" style={{ color: colors.textSecondary }}>{i18n.t(`support.privacySections.${key}.body`)}</Text>
        </View>
      ))}
    </SupportPageLayout>
  );
}
