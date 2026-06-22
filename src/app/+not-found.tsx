import { View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';

export default function NotFoundScreen() {
  return (
    <SafeScreen>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center px-6 gap-4">
        <Text style={{ fontSize: 56 }}>🔍</Text>
        <Text className="text-white text-2xl font-bold text-center">Page not found</Text>
        <Text className="text-[#A1A1AA] text-sm text-center">
          The screen you're looking for doesn't exist.
        </Text>
        <Link href="/(tabs)" className="mt-4">
          <Text className="text-[#7C3AED] font-semibold text-base">Go to Home</Text>
        </Link>
      </View>
    </SafeScreen>
  );
}
