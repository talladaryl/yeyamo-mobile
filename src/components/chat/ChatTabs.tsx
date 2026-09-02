import { Text, TouchableOpacity, View } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';
import type { ChatTab } from '@/features/chat/types';

interface ChatTabsProps {
  activeTab: ChatTab;
  onTabChange: (tab: ChatTab) => void;
  counts?: Record<ChatTab, number>;
}

const tabs: { id: ChatTab; label: string }[] = [
  { id: 'recent', label: 'Toutes' },
  { id: 'main', label: 'Principales' },
  { id: 'unread', label: 'Non lues' },
  { id: 'groups', label: 'Groupes' },
];

export function ChatTabs({ activeTab, onTabChange, counts }: ChatTabsProps) {
  const colors = useThemeStore((state) => state.colors);

  return (
    <View className="flex-row gap-2 px-4 py-3">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts?.[tab.id] ?? 0;

        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.75}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            className="min-h-9 flex-1 items-center justify-center rounded-full border px-1"
            style={{
              backgroundColor: isActive ? colors.primary : colors.elevated,
              borderColor: isActive ? colors.primary : colors.border,
            }}
          >
            <Text
              className="text-[11px] font-semibold"
              numberOfLines={1}
              style={{ color: isActive ? '#FFFFFF' : colors.textSecondary }}
            >
              {tab.label}{tab.id === 'unread' && count > 0 ? ` ${count}` : ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
