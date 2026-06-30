import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { ChatTab } from '@/features/chat/types';

interface ChatTabsProps {
  activeTab: ChatTab;
  onTabChange: (tab: ChatTab) => void;
  counts?: {
    recent: number;
    main: number;
    unread: number;
    groups: number;
  };
}

const tabs: { id: ChatTab; label: string }[] = [
  { id: 'recent', label: 'Récents' },
  { id: 'main', label: 'Principaux' },
  { id: 'unread', label: 'Non lus' },
  { id: 'groups', label: 'Groupes' },
];

export function ChatTabs({ activeTab, onTabChange, counts }: ChatTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4 py-3 border-b border-[#27272A]"
      contentContainerClassName="gap-2"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts?.[tab.id] ?? 0;

        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-full ${
              isActive ? 'bg-[#EF4444]' : 'bg-[#27272A]'
            }`}
            activeOpacity={0.7}
          >
            <Text className={`text-sm font-medium ${
              isActive ? 'text-white' : 'text-[#A1A1AA]'
            }`}>
              {tab.label}
              {count > 0 && ` (${count})`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
