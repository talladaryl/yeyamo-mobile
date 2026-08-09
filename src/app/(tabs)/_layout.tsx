import { Tabs, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { FloatingTabBarBackground } from '@/components/ui/FloatingTabBar';
import { useThemeStore } from '@/features/theme/theme.store';
import { useAuth } from '@/features/auth/useAuth';
import { useConversations } from '@/features/chat/useChat';
import { useUnreadCount } from '@/features/notifications/useNotifications';
import { useFloatingNavigationStore } from '@/hooks/useFloatingNavigation';

type TabIconKind = 'feed' | 'explore' | 'create' | 'chats' | 'profile';

function TabIcon({
  kind,
  focused,
  inactiveColor,
  surfaceColor,
}: {
  kind: TabIconKind;
  focused: boolean;
  inactiveColor: string;
  surfaceColor: string;
}) {
  if (kind === 'create') {
    return (
      <View
        className="h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#FEE2E2] bg-[#EF4444]"
        style={{
          shadowColor: '#EF4444',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: focused ? 0.42 : 0.25,
          shadowRadius: 8,
          elevation: 7,
        }}
      >
        <Icon name="add" size={30} color="#FFFFFF" />
      </View>
    );
  }

  if (kind === 'explore') {
    return (
      <View
        className="h-10 w-10 items-center justify-center rounded-full border"
        style={{
          backgroundColor: 'transparent',
          borderColor: focused ? '#EF4444' : inactiveColor,
        }}
      >
        <Icon name="earth-outline" size={24} color={focused ? '#EF4444' : inactiveColor} />
        <View
          className="absolute -bottom-0.5 -right-0.5 h-4 w-4 items-center justify-center rounded-full border-2 bg-[#EF4444]"
          style={{ borderColor: surfaceColor }}
        >
          <Icon name="search" size={9} color="#FFFFFF" />
        </View>
      </View>
    );
  }

  const names: Record<Exclude<TabIconKind, 'explore' | 'create'>, [string, string]> = {
    feed: ['home-outline', 'home'],
    chats: ['chatbubble-outline', 'chatbubble'],
    profile: ['person-outline', 'person'],
  };
  const [inactiveName, activeName] = names[kind];

  return (
    <View className="h-10 w-10 items-center justify-center rounded-2xl">
      <Icon name={focused ? activeName : inactiveName} size={25} color={focused ? '#EF4444' : inactiveColor} />
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useThemeStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const pathname = usePathname();
  const isScrolling = useFloatingNavigationStore((state) => state.isScrolling);
  const setScrolling = useFloatingNavigationStore((state) => state.setScrolling);
  const { data: conversations = [] } = useConversations();
  const { data: unreadNotifications = 0 } = useUnreadCount();
  const unreadMessages = conversations.reduce((total, conversation) => total + conversation.unread_count, 0);
  const badgeStyle = { backgroundColor: '#EF4444', color: '#FFFFFF', fontSize: 10 };

  useEffect(() => {
    setScrolling(false);
  }, [pathname, setScrolling]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarBackground: () => <FloatingTabBarBackground />,
        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: insets.bottom + (isScrolling ? 14 : 12),
          height: isScrolling ? 52 : 68,
          paddingTop: isScrolling ? 2 : 5,
          paddingBottom: isScrolling ? 4 : 8,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          borderBottomWidth: 0,
          borderLeftWidth: 0,
          borderRightWidth: 0,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: isScrolling ? 0.16 : 0.1,
          shadowRadius: isScrolling ? 13 : 8,
          elevation: isScrolling ? 7 : 4,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarActiveTintColor: '#EF4444',
        tabBarInactiveTintColor: '#52525B',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused }) => <TabIcon kind="feed" focused={focused} inactiveColor={colors.textMuted} surfaceColor={colors.tabBar} />,
          tabBarAccessibilityLabel: 'Home feed',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => <TabIcon kind="explore" focused={focused} inactiveColor={colors.textMuted} surfaceColor={colors.tabBar} />,
          tabBarAccessibilityLabel: 'Explore places',
        }}
      />
      <Tabs.Screen
        name="create"
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            router.push(user?.user_type === 'partner' ? '/(partner)/choice' : '/(create)/choice');
          },
        }}
        options={{
          title: 'Create',
          tabBarIcon: ({ focused }) => <TabIcon kind="create" focused={focused} inactiveColor={colors.textMuted} surfaceColor={colors.tabBar} />,
          tabBarAccessibilityLabel: 'Create post',
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ focused }) => <TabIcon kind="chats" focused={focused} inactiveColor={colors.textMuted} surfaceColor={colors.tabBar} />,
          tabBarAccessibilityLabel: 'Chats',
          tabBarBadge: unreadMessages > 0 ? (unreadMessages > 99 ? '99+' : unreadMessages) : undefined,
          tabBarBadgeStyle: badgeStyle,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon kind="profile" focused={focused} inactiveColor={colors.textMuted} surfaceColor={colors.tabBar} />,
          tabBarAccessibilityLabel: 'My profile',
          tabBarBadge: unreadNotifications > 0 ? (unreadNotifications > 99 ? '99+' : unreadNotifications) : undefined,
          tabBarBadgeStyle: badgeStyle,
        }}
      />
    </Tabs>
  );
}
