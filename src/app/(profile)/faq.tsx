import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { SupportPageLayout } from '@/components/profile/SupportPageLayout';
import { i18n } from '@/i18n';
import { useThemeStore } from '@/features/theme/theme.store';

const FAQ_KEYS = Array.from({ length: 24 }, (_, index) => `q${index + 1}`);

export default function FaqScreen() {
  const colors = useThemeStore((state) => state.colors);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <SupportPageLayout title={i18n.t('support.faqTitle')}>
      <View className="gap-2">
        {FAQ_KEYS.map((key, index) => {
          const isExpanded = expanded === key;
          return (
            <View key={key} className="overflow-hidden rounded-xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <TouchableOpacity onPress={() => setExpanded(isExpanded ? null : key)} className="min-h-14 flex-row items-center px-4 py-3" activeOpacity={0.78} accessibilityRole="button" accessibilityState={{ expanded: isExpanded }} accessibilityLabel={`${index + 1}. ${i18n.t(`support.faqQuestions.${key}`)}`}>
                <Text className="mr-3 text-xs font-bold" style={{ color: colors.primary }}>{String(index + 1).padStart(2, '0')}</Text>
                <Text className="flex-1 text-sm font-semibold" style={{ color: colors.text }}>{i18n.t(`support.faqQuestions.${key}`)}</Text>
                <Icon name={isExpanded ? 'remove-circle-outline' : 'add-circle-outline'} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              {isExpanded ? <Text className="px-4 pb-4 pl-12 text-sm leading-6" style={{ color: colors.textSecondary }}>{i18n.t(`support.faqAnswers.${key}`)}</Text> : null}
            </View>
          );
        })}
      </View>
    </SupportPageLayout>
  );
}
