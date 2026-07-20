import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/features/theme/theme.store';
import { useAuth } from '@/features/auth/useAuth';

export default function CreateScreen() {
  const router = useRouter();
  const backgroundColor = useThemeStore((state) => state.colors.background);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    router.replace(user.user_type === 'partner' ? '/(partner)/choice' : '/(create)/choice');
  }, [router, user]);

  return <View className="flex-1" style={{ backgroundColor }} />;
}
