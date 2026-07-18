import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

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
          backgroundColor: focused ? '#EF4444' : 'transparent',
          borderColor: focused ? '#EF4444' : inactiveColor,
        }}
      >
        <Icon name="earth-outline" size={24} color={focused ? '#FFFFFF' : inactiveColor} />
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
    <View className={`h-10 w-10 items-center justify-center rounded-2xl ${focused ? 'bg-[#EF4444]/10' : ''}`}>
      <Icon name={focused ? activeName : inactiveName} size={25} color={focused ? '#EF4444' : inactiveColor} />
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useThemeStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 68,
          paddingTop: 5,
          paddingBottom: 8,
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
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon kind="profile" focused={focused} inactiveColor={colors.textMuted} surfaceColor={colors.tabBar} />,
          tabBarAccessibilityLabel: 'My profile',
        }}
      />
    </Tabs>
  );
}
