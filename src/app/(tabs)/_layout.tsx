import { Tabs, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { useAuth } from '@/features/auth/useAuth';
import { useConversations } from '@/features/chat/useChat';
import { useUnreadCount } from '@/features/notifications/useNotifications';

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
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: focused ? 0.4 : 0.28,
          shadowRadius: 7,
          elevation: 6,
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
  const { data: conversations = [] } = useConversations();
  const { data: unreadNotifications = 0 } = useUnreadCount();
  const unreadMessages = conversations.reduce((total, conversation) => total + conversation.unread_count, 0);
  const unreadInbox = unreadMessages + unreadNotifications;
  const badgeStyle = { backgroundColor: '#EF4444', color: '#FFFFFF', fontSize: 10 };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 58 + insets.bottom,
          paddingTop: 4,
          paddingBottom: Math.max(insets.bottom, 4),
          backgroundColor: colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          borderBottomWidth: 0,
          borderLeftWidth: 0,
          borderRightWidth: 0,
          shadowOpacity: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingTop: 1,
        },
        tabBarActiveTintColor: '#EF4444',
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused }) => <TabIcon kind="feed" focused={focused} inactiveColor={colors.textMuted} surfaceColor={colors.tabBar} />,
          tabBarAccessibilityLabel: 'Home feed',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorer',
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
          title: 'Créer',
          tabBarIcon: ({ focused }) => <TabIcon kind="create" focused={focused} inactiveColor={colors.textMuted} surfaceColor={colors.tabBar} />,
          tabBarAccessibilityLabel: 'Create post',
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Messages',
          tabBarIcon: ({ focused }) => <TabIcon kind="chats" focused={focused} inactiveColor={colors.textMuted} surfaceColor={colors.tabBar} />,
          tabBarAccessibilityLabel: 'Chats',
          tabBarBadge: unreadInbox > 0 ? (unreadInbox > 99 ? '99+' : unreadInbox) : undefined,
          tabBarBadgeStyle: badgeStyle,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => <TabIcon kind="profile" focused={focused} inactiveColor={colors.textMuted} surfaceColor={colors.tabBar} />,
          tabBarAccessibilityLabel: 'My profile',
          tabBarBadge: unreadNotifications > 0 ? (unreadNotifications > 99 ? '99+' : unreadNotifications) : undefined,
          tabBarBadgeStyle: badgeStyle,
        }}
      />
    </Tabs>
  );
}
