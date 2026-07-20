import type { ReactNode } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

type PartnerPageProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  actionIcon?: string;
  onAction?: () => void;
};

export function PartnerPage({ title, subtitle, children, actionIcon, onAction }: PartnerPageProps) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile');
  };

  return (
    <SafeScreen>
      <View className="flex-row items-center px-4 pb-3 pt-2">
        <TouchableOpacity
          onPress={goBack}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.elevated }}
          accessibilityLabel="Retour"
        >
          <Icon name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View className="min-w-0 flex-1">
          <Text className="text-xl font-extrabold" style={{ color: colors.text }}>{title}</Text>
          <Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{subtitle}</Text>
        </View>
        {actionIcon && onAction ? (
          <TouchableOpacity
            onPress={onAction}
            className="ml-2 h-11 w-11 items-center justify-center rounded-full bg-[#EF4444]"
            accessibilityLabel="Ajouter"
          >
            <Icon name={actionIcon} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      <PartnerBottomNav />
    </SafeScreen>
  );
}

export function FilterChips({
  values,
  selected,
  onSelect,
}: {
  values: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
      {values.map((value) => {
        const active = selected === value;
        return (
          <TouchableOpacity
            key={value}
            onPress={() => onSelect(value)}
            className="rounded-full border px-4 py-2"
            style={{ backgroundColor: active ? '#EF4444' : colors.card, borderColor: active ? '#EF4444' : colors.border }}
          >
            <Text className="text-xs font-semibold" style={{ color: active ? '#FFFFFF' : colors.textSecondary }}>{value}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function PartnerBottomNav() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const items: Array<{ label: string; icon: string; route: Href }> = [
    { label: 'Découvrir', icon: 'home-outline', route: '/(tabs)' },
    { label: 'Explorer', icon: 'earth-outline', route: '/(tabs)/explore' },
    { label: 'Créer', icon: 'add-circle-outline', route: '/(tabs)/create' },
    { label: 'Messages', icon: 'chatbubble-outline', route: '/(tabs)/chats' },
    { label: 'Profil', icon: 'person', route: '/(tabs)/profile' },
  ];

  return (
    <View className="flex-row border-t px-2 pb-2 pt-2" style={{ backgroundColor: colors.tabBar, borderColor: colors.border }}>
      {items.map((item) => {
        const active = item.label === 'Profil';
        return (
          <TouchableOpacity key={item.label} onPress={() => router.replace(item.route)} className="flex-1 items-center py-1">
            <Icon name={item.icon} size={22} color={active ? '#EF4444' : colors.textMuted} />
            <Text className="mt-1 text-[10px] font-semibold" style={{ color: active ? '#EF4444' : colors.textMuted }}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
