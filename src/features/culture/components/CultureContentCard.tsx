import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { contentLabel } from '../culture.mappers';
import type { CultureContent } from '../culture.types';

export function CultureContentCard({ content, title, subtitle, onPress }: { content: CultureContent; title?: string; subtitle?: string; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Découvrir ${title ?? content.type}`} onPress={onPress} activeOpacity={0.8} className="mr-3 w-64 overflow-hidden rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
    <View className="flex-row items-center justify-between"><View className="rounded-full bg-[#FEE2E2] px-2.5 py-1"><Text className="text-xs font-bold text-[#B91C1C]">{contentLabel(content)}</Text></View>{content.verificationStatus === 'VERIFIED' ? <Icon name="checkmark-circle" size={18} color="#22C55E" /> : null}</View>
    <Text className="mt-4 text-base font-bold" style={{ color: colors.text }} numberOfLines={2}>{title ?? content.slug.replace(/-/g, ' ')}</Text>
    {subtitle ? <Text className="mt-1 text-sm leading-5" style={{ color: colors.textSecondary }} numberOfLines={2}>{subtitle}</Text> : null}
    <Text className="mt-4 text-xs font-semibold" style={{ color: colors.textMuted }}>{content.countryCode} · {content.primaryLanguageCode.toUpperCase()}</Text>
  </TouchableOpacity>;
}
