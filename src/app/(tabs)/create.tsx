import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

// TODO: Import user role from auth store
// import { useAuthStore } from '@/features/auth/auth.store';

export default function CreateScreen() {
  const router = useRouter();
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

  return <View className="flex-1 bg-[#0A0A0A]" />;
}
