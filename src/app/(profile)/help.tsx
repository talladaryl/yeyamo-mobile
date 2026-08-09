import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { SupportPageLayout } from '@/components/profile/SupportPageLayout';
import { i18n } from '@/i18n';
import { useThemeStore } from '@/features/theme/theme.store';

const SECTIONS = [
  ['discover', 'compass-outline'],
  ['publish', 'create-outline'],
  ['interact', 'people-outline'],
  ['culture', 'leaf-outline'],
  ['language', 'language-outline'],
  ['save', 'bookmark-outline'],
  ['reserve', 'calendar-outline'],
  ['artisan', 'color-palette-outline'],
  ['safety', 'shield-checkmark-outline'],
] as const;

export default function HelpScreen() {
  const colors = useThemeStore((state) => state.colors);
  const [expanded, setExpanded] = useState<string | null>('discover');

  return (
    <SupportPageLayout title={i18n.t('support.helpTitle')}>
      <Text className="mb-4 text-sm leading-6" style={{ color: colors.textSecondary }}>{i18n.t('support.helpIntro')}</Text>
      <View className="gap-3">
        {SECTIONS.map(([key, icon]) => {
          const isExpanded = expanded === key;
          return (
            <View key={key} className="overflow-hidden rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <TouchableOpacity onPress={() => setExpanded(isExpanded ? null : key)} className="min-h-14 flex-row items-center px-4 py-3" activeOpacity={0.78} accessibilityRole="button" accessibilityState={{ expanded: isExpanded }} accessibilityLabel={i18n.t(`support.helpSections.${key}.title`)}>
                <View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${colors.primary}12` }}><Icon name={icon} size={21} color={colors.primary} /></View>
                <Text className="ml-3 flex-1 text-sm font-bold" style={{ color: colors.text }}>{i18n.t(`support.helpSections.${key}.title`)}</Text>
                <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={19} color={colors.textSecondary} />
              </TouchableOpacity>
              {isExpanded ? <Text className="px-4 pb-4 pl-[68px] text-sm leading-6" style={{ color: colors.textSecondary }}>{i18n.t(`support.helpSections.${key}.body`)}</Text> : null}
            </View>
          );
        })}
      </View>
    </SupportPageLayout>
  );
}
