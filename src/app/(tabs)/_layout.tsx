import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View className={`items-center justify-center w-8 h-8 rounded-xl ${focused ? 'bg-[#7C3AED]/20' : ''}`}>
      <Icon name={name} size={22} color={focused ? '#7C3AED' : '#52525B'} />
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
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#52525B',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />,
          tabBarAccessibilityLabel: 'Home feed',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'search' : 'search-outline'} focused={focused} />,
          tabBarAccessibilityLabel: 'Explore places',
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'add-circle' : 'add-circle-outline'} focused={focused} />,
          tabBarAccessibilityLabel: 'Create post',
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'chatbubble' : 'chatbubble-outline'} focused={focused} />,
          tabBarAccessibilityLabel: 'Chats',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />,
          tabBarAccessibilityLabel: 'My profile',
        }}
      />
    </Tabs>
  );
}
