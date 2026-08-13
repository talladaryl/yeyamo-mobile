import { Text, TouchableOpacity, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useThemeStore } from '@/features/theme/theme.store';
import { useFloatingNavigationStore } from '@/hooks/useFloatingNavigation';

export type FeedMode = 'for-you' | 'following';

type FeedModeSwitchProps = {
  value: FeedMode;
  onChange: (mode: FeedMode) => void;
};

export function FeedModeSwitch({ value, onChange }: FeedModeSwitchProps) {
  const colors = useThemeStore((state) => state.colors);
  const isScrolling = useFloatingNavigationStore((state) => state.isScrolling);
  const scrollDirection = useFloatingNavigationStore((state) => state.scrollDirection);
  const reducedMotion = useReducedMotion();
  const subdued = isScrolling && scrollDirection === 'down';

  return (
    <View
      className="items-center border-b py-2"
      style={{
        backgroundColor: colors.background,
        borderColor: colors.borderSoft,
        opacity: subdued && !reducedMotion ? 0.28 : 1,
        transform: [{ translateY: subdued && !reducedMotion ? -4 : 0 }],
      }}
      pointerEvents={subdued ? 'none' : 'auto'}
    >
      <View
        className="flex-row rounded-full border p-1"
        style={{ backgroundColor: colors.surfaceGlass, borderColor: colors.borderGlass }}
        accessibilityRole="tablist"
      >
        <FeedModeOption label="Pour vous" selected={value === 'for-you'} onPress={() => onChange('for-you')} />
        <FeedModeOption label="Abonnements" selected={value === 'following'} onPress={() => onChange('following')} />
      </View>
    </View>
  );
}

function FeedModeOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-full px-4 py-2"
      style={{ backgroundColor: selected ? colors.surfaceElevated : 'transparent' }}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Text className="text-xs font-bold" style={{ color: selected ? colors.accent : colors.textSecondary }}>{label}</Text>
    </TouchableOpacity>
  );
}
