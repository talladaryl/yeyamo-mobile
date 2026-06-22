import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/useAuth';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <SafeScreen>
      <ScrollView contentContainerClassName="pb-10">
        {/* Header */}
        <View className="items-center pt-10 pb-6 px-6">
          <Avatar
            uri={user.avatar_url}
            displayName={user.display_name}
            size={90}
          />
          <Text className="text-white text-2xl font-bold mt-4">{user.display_name}</Text>
          <Text className="text-[#A1A1AA] text-sm">@{user.username}</Text>
          {user.city ? (
            <Text className="text-[#A1A1AA] text-xs mt-1">📍 {user.city}</Text>
          ) : null}
          {user.is_verified ? (
            <Text className="text-[#7C3AED] text-xs mt-1 font-semibold">✓ Verified</Text>
          ) : null}
        </View>

        {/* Stats */}
        <View className="flex-row justify-around px-6 py-4 border-y border-[#27272A]">
          {[
            { label: 'Posts', value: '0' },
            { label: 'Followers', value: '0' },
            { label: 'Following', value: '0' },
          ].map(({ label, value }) => (
            <View key={label} className="items-center">
              <Text className="text-white text-xl font-bold">{value}</Text>
              <Text className="text-[#A1A1AA] text-xs mt-0.5">{label}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View className="px-6 pt-6 gap-3">
          <Button label="Edit Profile" onPress={() => {}} variant="outline" />
          <Button label="Sign Out" onPress={logout} variant="ghost" />
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
