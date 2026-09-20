import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Input } from '@/components/ui/Input';
import { useThemeStore } from '@/features/theme/theme.store';

export type SearchSelectItem = {
  id: string;
  label: string;
  description?: string | null;
};

type SearchSelectProps = {
  label: string;
  query: string;
  onQueryChange: (query: string) => void;
  items: readonly SearchSelectItem[];
  onSelect: (item: SearchSelectItem) => void;
  selectedId?: string;
  placeholder?: string;
  helperText?: string;
  isLoading?: boolean;
  error?: string;
  emptyMessage?: string;
};

/** Controlled remote-result selector. It never owns form state, so typing cannot remount its input. */
export function SearchSelect({
  label, query, onQueryChange, items, onSelect, selectedId, placeholder = 'Rechercher…', helperText, isLoading = false, error, emptyMessage = 'Aucun résultat.',
}: SearchSelectProps) {
  const colors = useThemeStore((state) => state.colors);
  const hasQuery = query.trim().length >= 2;

  return <View>
    <Input label={label} value={query} onChangeText={onQueryChange} placeholder={placeholder} helperText={helperText} autoCapitalize="words" returnKeyType="search" />
    {hasQuery ? <View className="mt-2 overflow-hidden rounded-xl border" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
      {isLoading ? <View className="items-center py-4"><ActivityIndicator color={colors.primary} /></View> : null}
      {!isLoading && error ? <Text className="px-4 py-3 text-sm" style={{ color: colors.textSecondary }}>{error}</Text> : null}
      {!isLoading && !error && items.length === 0 ? <Text className="px-4 py-3 text-sm" style={{ color: colors.textSecondary }}>{emptyMessage}</Text> : null}
      {!isLoading && !error ? items.map((item) => {
        const selected = selectedId === item.id;
        return <TouchableOpacity key={item.id} onPress={() => onSelect(item)} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={`Choisir ${item.label}`} className="border-b px-4 py-3 last:border-b-0" style={{ borderColor: colors.border, backgroundColor: selected ? colors.accentSoft : 'transparent' }}>
          <Text className="font-semibold" style={{ color: colors.text }}>{item.label}</Text>
          {item.description ? <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{item.description}</Text> : null}
        </TouchableOpacity>;
      }) : null}
    </View> : null}
  </View>;
}
