import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

export type FormSelectOption = { label: string; value: string; description?: string };

export function FormSelect({ label, value, options, placeholder = 'Sélectionner', error, required, onChange }: { label: string; value?: string; options: readonly FormSelectOption[]; placeholder?: string; error?: string; required?: boolean; onChange: (value: string) => void }) {
  const colors = useThemeStore((state) => state.colors);
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  return <View className="mb-4">
    <Text className="mb-2 text-sm font-semibold" style={{ color: colors.textSecondary }}>{label}{required ? <Text style={{ color: colors.primary }}> *</Text> : null}</Text>
    <TouchableOpacity onPress={() => setOpen(true)} className="min-h-12 flex-row items-center rounded-xl border px-4" style={{ backgroundColor: colors.surface, borderColor: error ? colors.primary : colors.border }} accessibilityRole="button" accessibilityLabel={`${label}. ${selected?.label ?? placeholder}`}>
      <Text className="flex-1 text-sm" style={{ color: selected ? colors.text : colors.textMuted }}>{selected?.label ?? placeholder}</Text><Icon name="chevron-down" size={18} color={colors.textMuted} />
    </TouchableOpacity>
    {error ? <Text className="mt-1 text-xs" style={{ color: colors.primary }}>{error}</Text> : null}
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)} statusBarTranslucent>
      <View className="flex-1 justify-end"><Pressable className="absolute inset-0" style={{ backgroundColor: colors.overlay }} onPress={() => setOpen(false)} />
        <View className="max-h-[70%] rounded-t-[28px] border-t px-4 pb-8 pt-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <View className="mb-4 h-1 w-10 self-center rounded-full" style={{ backgroundColor: colors.textMuted }} />
          <View className="mb-3 flex-row items-center"><Text className="flex-1 text-xl font-extrabold" style={{ color: colors.text }}>{label}</Text><TouchableOpacity onPress={() => setOpen(false)} className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="close" size={22} color={colors.text} /></TouchableOpacity></View>
          <ScrollView showsVerticalScrollIndicator={false}>{options.map((option) => { const active = option.value === value; return <TouchableOpacity key={option.value} onPress={() => { onChange(option.value); setOpen(false); }} className="mb-2 min-h-14 flex-row items-center rounded-2xl border px-4 py-3" style={{ backgroundColor: active ? `${colors.primary}12` : colors.background, borderColor: active ? colors.primary : colors.border }} accessibilityRole="radio" accessibilityState={{ selected: active }}><View className="flex-1"><Text className="font-bold" style={{ color: colors.text }}>{option.label}</Text>{option.description ? <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{option.description}</Text> : null}</View>{active ? <Icon name="checkmark-circle" size={22} color={colors.primary} /> : null}</TouchableOpacity>; })}</ScrollView>
        </View>
      </View>
    </Modal>
  </View>;
}
