import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import type { CultureLanguage } from '../culture.types';

export function LanguageCard({ language, onPress }: { language: CultureLanguage; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Découvrir la langue ${language.name}`} onPress={onPress} className="mr-3 w-52 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
    <View className="flex-row items-center justify-between"><View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FEF3C7]"><Icon name="chatbubbles-outline" size={20} color="#B45309" /></View>{language.verified ? <Icon name="checkmark-circle" size={18} color="#22C55E" /> : null}</View>
    <Text className="mt-4 font-bold" style={{ color: colors.text }}>{language.nativeName || language.name}</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{language.name}</Text>
    <Text className="mt-3 text-xs font-semibold" style={{ color: colors.textMuted }}>{language.countryCodes.join(', ')}</Text>
  </TouchableOpacity>;
}
