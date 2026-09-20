import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { YeyamoModal } from '@/components/ui/YeyamoModal';
import { useThemeStore } from '@/features/theme/theme.store';

export type MultiSelectOption = { label: string; value: string; description?: string };

export function MultiSelect({ label, values, options, placeholder = 'Sélectionner', onChange }: { label: string; values: string[]; options: readonly MultiSelectOption[]; placeholder?: string; onChange: (values: string[]) => void }) {
  const colors = useThemeStore((state) => state.colors);
  const [open, setOpen] = useState(false);
  const selectedLabels = options.filter((option) => values.includes(option.value)).map((option) => option.label);
  const toggle = (value: string) => onChange(values.includes(value) ? values.filter((candidate) => candidate !== value) : [...values, value]);
  return <View><Text className="mb-2 text-sm font-semibold" style={{ color: colors.textSecondary }}>{label}</Text><TouchableOpacity onPress={() => setOpen(true)} className="min-h-12 flex-row items-center rounded-xl border px-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }} accessibilityRole="button" accessibilityLabel={`${label}. ${selectedLabels.length ? selectedLabels.join(', ') : placeholder}`}><Text className="flex-1 text-sm" style={{ color: selectedLabels.length ? colors.text : colors.textMuted }} numberOfLines={2}>{selectedLabels.length ? selectedLabels.join(', ') : placeholder}</Text><Icon name="chevron-down" size={18} color={colors.textMuted} /></TouchableOpacity><YeyamoModal visible={open} onClose={() => setOpen(false)} title={label}><ScrollView keyboardShouldPersistTaps="always">{options.map((option) => { const selected = values.includes(option.value); return <TouchableOpacity key={option.value} onPress={() => toggle(option.value)} className="mb-2 flex-row items-center rounded-2xl border px-4 py-3" style={{ backgroundColor: selected ? `${colors.primary}12` : colors.background, borderColor: selected ? colors.primary : colors.border }} accessibilityRole="checkbox" accessibilityState={{ checked: selected }}><View className="flex-1"><Text className="font-bold" style={{ color: colors.text }}>{option.label}</Text>{option.description ? <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{option.description}</Text> : null}</View><Icon name={selected ? 'checkbox' : 'square-outline'} size={22} color={selected ? colors.primary : colors.textMuted} /></TouchableOpacity>; })}</ScrollView></YeyamoModal></View>;
}
