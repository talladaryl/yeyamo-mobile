import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { getCurrentLanguage, saveLanguage } from '@/i18n';
import { useThemeStore } from '@/features/theme/theme.store';

export default function LanguageScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [language, setLanguage] = useState<'fr' | 'en'>(getCurrentLanguage());
  const chooseLanguage = (next: 'fr' | 'en') => {
    setLanguage(next);
    void saveLanguage(next);
  };

  return <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
    <View className="border-b px-4 py-3" style={{ borderColor: colors.border }}><View className="flex-row items-center"><TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2" accessibilityRole="button" accessibilityLabel="Retour"><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="ml-2 text-xl font-bold" style={{ color: colors.text }}>Langue</Text></View></View>
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}><Text className="text-2xl font-extrabold" style={{ color: colors.text }}>Langue de l’application</Text><Text className="mt-2 text-sm leading-5" style={{ color: colors.textSecondary }}>Choisissez la langue de l’interface YeYamo.</Text><View className="mt-8 gap-3"><LanguageChoice code="fr" title="Français" description="Interface en français" selected={language === 'fr'} onPress={() => chooseLanguage('fr')} /><LanguageChoice code="en" title="English" description="English interface" selected={language === 'en'} onPress={() => chooseLanguage('en')} /></View></ScrollView>
  </SafeAreaView>;
}

function LanguageChoice({ code, title, description, selected, onPress }: { code: 'fr' | 'en'; title: string; description: string; selected: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="flex-row items-center rounded-xl border p-4" style={{ backgroundColor: selected ? colors.primary : colors.card, borderColor: selected ? colors.primary : colors.border }} accessibilityRole="radio" accessibilityState={{ selected }}><View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: selected ? 'rgba(255,255,255,0.2)' : colors.elevated }}><Text className="font-extrabold" style={{ color: selected ? '#FFFFFF' : colors.text }}>{code.toUpperCase()}</Text></View><View className="ml-3 flex-1"><Text className="font-semibold" style={{ color: selected ? '#FFFFFF' : colors.text }}>{title}</Text><Text className="mt-0.5 text-xs" style={{ color: selected ? '#FEE2E2' : colors.textSecondary }}>{description}</Text></View>{selected ? <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" /> : null}</TouchableOpacity>;
}
