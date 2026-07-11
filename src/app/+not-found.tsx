import { View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';

export default function NotFoundScreen() {
  return (
    <SafeScreen>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center px-6 gap-4">
        <Icon name="search-outline" size={56} color="#71717A" />
        <Text className="text-white text-2xl font-bold text-center">Page not found</Text>
        <Text className="text-[#A1A1AA] text-sm text-center">
          The screen you're looking for doesn't exist.
        </Text>
        <Link href="/(tabs)" className="mt-4">
          <Text className="text-[#EF4444] font-semibold text-base">Go to Home</Text>
        </Link>
      </View>
    </SafeScreen>
  );
}
