import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/features/theme/theme.store';

// TODO: Import user role from auth store
// import { useAuthStore } from '@/features/auth/auth.store';

export default function CreateScreen() {
  const router = useRouter();
  const backgroundColor = useThemeStore((state) => state.colors.background);
  // const { user } = useAuthStore();

  useEffect(() => {
    // TODO: Detect user role and redirect accordingly
    // For now, defaulting to user creation flow
    // if (user?.role === 'partner') {
    //   router.push('/(partner)/choice');
    // } else {
    //   router.push('/(create)/choice');
    // }
    
    // Temporary: redirect to user flow
    router.push('/(create)/choice');
  }, []);

  return <View className="flex-1" style={{ backgroundColor }} />;
}
