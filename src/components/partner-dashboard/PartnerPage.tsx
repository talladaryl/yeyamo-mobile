import type { ReactNode } from 'react';
import { LayoutAnimation, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';
import { BlurView } from 'expo-blur';
import { usePathname, useRouter, type Href } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { useAuth } from '@/features/auth/useAuth';
import { useConversations } from '@/features/chat/useChat';
import { useUnreadCount } from '@/features/notifications/useNotifications';
import { useFloatingNavigationScroll, useFloatingNavigationStore } from '@/hooks/useFloatingNavigation';
import { ActiveTabBubble } from '@/components/ui/FloatingTabBar';

type PartnerPageProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  actionIcon?: string;
  onAction?: () => void;
};

export function PartnerPage({ title, subtitle, children, actionIcon, onAction }: PartnerPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useThemeStore();
  const isScrolling = useFloatingNavigationStore((state) => state.isScrolling);
  const setScrolling = useFloatingNavigationStore((state) => state.setScrolling);
  const floatingScroll = useFloatingNavigationScroll();

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isScrolling]);

  useEffect(() => {
    setScrolling(false);
  }, [pathname, setScrolling]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile');
  };

  return (
    <SafeScreen>
      <View className="flex-row items-center px-4 pb-3 pt-2">
        <TouchableOpacity onPress={goBack} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }} accessibilityLabel="Retour">
          <Icon name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View className="min-w-0 flex-1">
          <Text className="text-xl font-extrabold" style={{ color: colors.text }}>{title}</Text>
          <Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{subtitle}</Text>
        </View>
        {actionIcon && onAction ? <TouchableOpacity onPress={onAction} className="ml-2 h-11 w-11 items-center justify-center rounded-full bg-[#EF4444]" accessibilityLabel="Ajouter"><Icon name={actionIcon} size={24} color="#FFFFFF" /></TouchableOpacity> : null}
      </View>
      <ScrollView {...floatingScroll} className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>{children}</ScrollView>
      <PartnerBottomNav />
    </SafeScreen>
  );
}

export function FilterChips({ values, selected, onSelect }: { values: readonly string[]; selected: string; onSelect: (value: string) => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>{values.map((value) => {
    const active = selected === value;
    return <TouchableOpacity key={value} onPress={() => onSelect(value)} className="rounded-full border px-4 py-2" style={{ backgroundColor: active ? '#EF4444' : colors.card, borderColor: active ? '#EF4444' : colors.border }}><Text className="text-xs font-semibold" style={{ color: active ? '#FFFFFF' : colors.textSecondary }}>{value}</Text></TouchableOpacity>;
  })}</ScrollView>;
}

function PartnerBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const colors = useThemeStore((state) => state.colors);
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const isScrolling = useFloatingNavigationStore((state) => state.isScrolling);
  const { user } = useAuth();
  const { data: conversations = [] } = useConversations();
  const { data: unreadNotifications = 0 } = useUnreadCount();
  const unreadMessages = conversations.reduce((total, conversation) => total + conversation.unread_count, 0);
  const [width, setWidth] = useState(0);
  const items: { label: string; icon: string; route: Href; key: 'feed' | 'explore' | 'create' | 'chats' | 'profile' }[] = [
    { label: 'Feed', icon: 'home-outline', route: '/(tabs)', key: 'feed' },
    { label: 'Explorer', icon: 'earth-outline', route: '/(tabs)/explore', key: 'explore' },
    { label: 'Créer', icon: 'add', route: '/(tabs)/create', key: 'create' },
    { label: 'Messages', icon: 'chatbubble-outline', route: '/(tabs)/chats', key: 'chats' },
    { label: 'Profil', icon: 'person-outline', route: '/(tabs)/profile', key: 'profile' },
  ];
  const activeKey = pathname.includes('/explore') ? 'explore' : pathname.includes('/chats') || pathname.includes('/chat') ? 'chats' : pathname.includes('/profile') || pathname.includes('/partner-dashboard') ? 'profile' : pathname.includes('/create') || pathname.includes('/partner') ? 'create' : 'feed';
  const activeIndex = items.findIndex((item) => item.key === activeKey);

  return <View
    onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    className="overflow-hidden rounded-[25px]"
    style={{
      backgroundColor: 'transparent',
      borderColor: colors.border,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderRadius: isScrolling ? 25 : 20,
      marginHorizontal: isScrolling ? 28 : 12,
      marginBottom: isScrolling ? 10 : 4,
      height: isScrolling ? 52 : 68,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: isScrolling ? 0.16 : 0.1,
      shadowRadius: isScrolling ? 13 : 8,
      elevation: isScrolling ? 7 : 4,
    }}
  >
    <BlurView intensity={22} tint={resolvedTheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
    <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.card, opacity: 0.38 }]} />
    <ActiveTabBubble itemCount={items.length} width={width} activeIndex={Math.max(activeIndex, 0)} />
    <View className="flex-1 flex-row items-center px-1 pb-2 pt-1">{items.map((item) => {
    const active = item.key === activeKey;
    if (item.key === 'create') return <TouchableOpacity key={item.key} onPress={() => router.push(user?.user_type === 'partner' ? '/(partner)/choice' : '/(create)/choice')} className="flex-1 items-center justify-center" activeOpacity={0.82} accessibilityLabel="Créer"><View className="h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#FEE2E2] bg-[#EF4444]" style={{ shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.32, shadowRadius: 8, elevation: 7 }}><Icon name="add" size={30} color="#FFFFFF" /></View></TouchableOpacity>;
    const activeIcon = item.key === 'feed' ? 'home' : item.key === 'chats' ? 'chatbubble' : 'person';
    return <TouchableOpacity key={item.key} onPress={() => router.replace(item.route)} className="relative flex-1 items-center justify-center" activeOpacity={0.8} accessibilityLabel={item.label}>
      {item.key === 'explore' ? <View className="h-10 w-10 items-center justify-center rounded-full border" style={{ backgroundColor: active ? '#EF4444' : 'transparent', borderColor: active ? '#EF4444' : colors.textMuted }}><Icon name="earth-outline" size={24} color={active ? '#FFFFFF' : colors.textMuted} /><View className="absolute -bottom-0.5 -right-0.5 h-4 w-4 items-center justify-center rounded-full border-2 bg-[#EF4444]" style={{ borderColor: colors.tabBar }}><Icon name="search" size={9} color="#FFFFFF" /></View></View> : <View className={`h-10 w-10 items-center justify-center rounded-2xl ${active ? 'bg-[#EF4444]/10' : ''}`}><Icon name={active ? activeIcon : item.icon} size={25} color={active ? '#EF4444' : colors.textMuted} /></View>}
      {item.key === 'chats' && unreadMessages > 0 ? <Badge value={unreadMessages} /> : null}
      {item.key === 'profile' && unreadNotifications > 0 ? <Badge value={unreadNotifications} /> : null}
    </TouchableOpacity>;
  })}</View></View>;
}

function Badge({ value }: { value: number }) {
  return <View className="absolute right-[18%] top-1 h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1"><Text className="text-[9px] font-bold text-white">{value > 99 ? '99+' : value}</Text></View>;
}
