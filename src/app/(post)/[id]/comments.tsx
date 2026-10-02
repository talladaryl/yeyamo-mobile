import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CommentsThread } from '@/components/comments/CommentsThread';
import { useThemeStore } from '@/features/theme/theme.store';

/** Retained for deep links and legacy navigation. Feed itself now opens the
 * same thread in an overlay so the active Feed card remains mounted. */
export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const close = () => router.canGoBack() ? router.back() : router.replace('/(tabs)');

  return <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
    <Stack.Screen options={{ headerShown: false }} />
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="flex-1"><CommentsThread postId={id} onClose={close} /></View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
