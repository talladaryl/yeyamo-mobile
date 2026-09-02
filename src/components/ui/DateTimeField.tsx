import { useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

function parseValue(value: string | undefined, mode: 'date' | 'time') { if (!value) return new Date(); if (mode === 'date') { const parsed = new Date(`${value}T12:00:00`); return Number.isNaN(parsed.getTime()) ? new Date() : parsed; } const [hours, minutes] = value.split(':').map(Number); const date = new Date(); if (Number.isFinite(hours) && Number.isFinite(minutes)) date.setHours(hours, minutes, 0, 0); return date; }
function serialize(date: Date, mode: 'date' | 'time') { if (mode === 'time') return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`; return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }

export function DateTimeField({ label, value, onChange, mode = 'date', minimumDate, maximumDate, error, required }: { label: string; value?: string; onChange: (value: string) => void; mode?: 'date' | 'time'; minimumDate?: Date; maximumDate?: Date; error?: string; required?: boolean }) {
  const colors = useThemeStore((state) => state.colors);
  const [visible, setVisible] = useState(false);
  const selectedDate = parseValue(value, mode);
  const handleChange = (event: DateTimePickerEvent, date?: Date) => { if (Platform.OS === 'android') setVisible(false); if (event.type !== 'dismissed' && date) onChange(serialize(date, mode)); };
  const display = value ? mode === 'date' ? selectedDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : value : mode === 'date' ? 'Choisir une date' : 'Choisir une heure';
  return <View className="mb-4"><Text className="mb-2 text-sm font-semibold" style={{ color: colors.textSecondary }}>{label}{required ? <Text style={{ color: colors.primary }}> *</Text> : null}</Text>
    <TouchableOpacity onPress={() => setVisible((current) => !current)} className="min-h-12 flex-row items-center rounded-xl border px-4" style={{ backgroundColor: colors.surface, borderColor: error ? colors.primary : colors.border }} accessibilityRole="button"><Icon name={mode === 'date' ? 'calendar-outline' : 'time-outline'} size={20} color={colors.textSecondary} /><Text className="ml-3 flex-1 text-sm" style={{ color: value ? colors.text : colors.textMuted }}>{display}</Text><Icon name="chevron-down" size={17} color={colors.textMuted} /></TouchableOpacity>
    {visible ? <View className="mt-2 overflow-hidden rounded-2xl border p-2" style={{ backgroundColor: colors.card, borderColor: colors.border }}><DateTimePicker value={selectedDate} mode={mode} display={Platform.OS === 'ios' ? (mode === 'date' ? 'inline' : 'spinner') : 'default'} minimumDate={minimumDate} maximumDate={maximumDate} onChange={handleChange} themeVariant={colors.background.startsWith('#0') ? 'dark' : 'light'} />{Platform.OS === 'ios' ? <TouchableOpacity onPress={() => setVisible(false)} className="mt-1 self-end rounded-xl px-4 py-2" style={{ backgroundColor: colors.primary }}><Text className="font-bold text-white">Terminé</Text></TouchableOpacity> : null}</View> : null}
    {error ? <Text className="mt-1 text-xs" style={{ color: colors.primary }}>{error}</Text> : null}</View>;
}
