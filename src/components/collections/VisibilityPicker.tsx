import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VISIBILITY_OPTIONS } from '@/features/collections/types';
import type { Collection } from '@/features/collections/types';
import { useThemeStore } from '@/features/theme/theme.store';

interface VisibilityPickerProps { value: Collection['visibility']; onChange: (value: Collection['visibility']) => void; }

export function VisibilityPicker({ value, onChange }: VisibilityPickerProps) {
  const colors = useThemeStore((state) => state.colors);
  return <View><Text className="mb-3 text-base font-semibold" style={{ color: colors.text }}>Visibilité</Text>{VISIBILITY_OPTIONS.map((option) => { const selected = value === option.value; return <TouchableOpacity key={option.value} onPress={() => onChange(option.value)} className="flex-row items-center border-b py-3" style={{ borderColor: colors.border }} activeOpacity={0.7} accessibilityRole="radio" accessibilityState={{ selected }}><View className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Ionicons name={option.icon as any} size={20} color={colors.primary} /></View><View className="flex-1"><Text className="text-base font-medium" style={{ color: colors.text }}>{option.label}</Text><Text className="text-sm" style={{ color: colors.textSecondary }}>{option.description}</Text></View><View className="h-5 w-5 items-center justify-center rounded-full border-2" style={{ borderColor: selected ? colors.primary : colors.textMuted, backgroundColor: selected ? colors.primary : 'transparent' }}>{selected ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}</View></TouchableOpacity>; })}</View>;
}
