import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/features/auth/useAuth';

export default function ProfileScreen() {
  const router = useRouter();
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
            <Text className="text-[#EF4444] text-xs mt-1 font-semibold">✓ Verified</Text>
          ) : null}
        </View>

        {/* Stats - Cliquables pour accéder aux listes */}
        <View className="flex-row justify-around px-6 py-4 border-y border-[#27272A]">
          <TouchableOpacity
            onPress={() => {}}
            className="items-center"
            activeOpacity={0.7}
          >
            <Text className="text-white text-xl font-bold">0</Text>
            <Text className="text-[#A1A1AA] text-xs mt-0.5">Posts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(profile)/followers')}
            className="items-center"
            activeOpacity={0.7}
          >
            <Text className="text-white text-xl font-bold">0</Text>
            <Text className="text-[#A1A1AA] text-xs mt-0.5">Followers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(profile)/following')}
            className="items-center"
            activeOpacity={0.7}
          >
            <Text className="text-white text-xl font-bold">0</Text>
            <Text className="text-[#A1A1AA] text-xs mt-0.5">Following</Text>
          </TouchableOpacity>
        </View>

        {/* Social Graph Section */}
        <View className="px-6 pt-6">
          <Text className="text-white font-bold text-base mb-3">Réseau social</Text>
          
          <View className="bg-[#161616] rounded-xl overflow-hidden mb-3">
            {/* Recherche utilisateurs */}
            <TouchableOpacity
              onPress={() => router.push('/(profile)/search')}
              className="flex-row items-center p-4 border-b border-[#27272A]"
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 bg-[#27272A] rounded-full items-center justify-center">
                <Icon library="ionicons" name="search" size={20} color="#EF4444" />
              </View>
              <Text className="flex-1 text-white font-semibold text-sm ml-3">
                Rechercher utilisateurs
              </Text>
              <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
            </TouchableOpacity>

            {/* Suggestions */}
            <TouchableOpacity
              onPress={() => router.push('/(profile)/suggestions')}
              className="flex-row items-center p-4 border-b border-[#27272A]"
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 bg-[#27272A] rounded-full items-center justify-center">
                <Icon library="ionicons" name="people" size={20} color="#EF4444" />
              </View>
              <Text className="flex-1 text-white font-semibold text-sm ml-3">
                Suggestions à suivre
              </Text>
              <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
            </TouchableOpacity>

            {/* Trouver des amis */}
            <TouchableOpacity
              onPress={() => router.push('/(profile)/find-friends')}
              className="flex-row items-center p-4 border-b border-[#27272A]"
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 bg-[#27272A] rounded-full items-center justify-center">
                <Icon library="ionicons" name="person-add" size={20} color="#EF4444" />
              </View>
              <Text className="flex-1 text-white font-semibold text-sm ml-3">
                Trouver des amis
              </Text>
              <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
            </TouchableOpacity>

            {/* Activité */}
            <TouchableOpacity
              onPress={() => router.push('/(profile)/activity')}
              className="flex-row items-center p-4 border-b border-[#27272A]"
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 bg-[#27272A] rounded-full items-center justify-center">
                <Icon library="ionicons" name="notifications" size={20} color="#EF4444" />
              </View>
              <Text className="flex-1 text-white font-semibold text-sm ml-3">
                Activité du réseau
              </Text>
              <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
            </TouchableOpacity>

            {/* Paramètres Social */}
            <TouchableOpacity
              onPress={() => router.push('/(profile)/social-settings')}
              className="flex-row items-center p-4 border-b border-[#27272A]"
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 bg-[#27272A] rounded-full items-center justify-center">
                <Icon library="ionicons" name="settings" size={20} color="#EF4444" />
              </View>
              <Text className="flex-1 text-white font-semibold text-sm ml-3">
                Paramètres réseau social
              </Text>
              <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
            </TouchableOpacity>

            {/* Mes Badges */}
            <TouchableOpacity
              onPress={() => router.push('/(social-graph)/badges')}
              className="flex-row items-center p-4"
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 bg-[#27272A] rounded-full items-center justify-center">
                <Icon library="ionicons" name="trophy" size={20} color="#F59E0B" />
              </View>
              <Text className="flex-1 text-white font-semibold text-sm ml-3">
                Mes badges
              </Text>
              <View className="bg-[#EF4444] px-2 py-0.5 rounded-full mr-2">
                <Text className="text-white text-xs font-bold">3</Text>
              </View>
              <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View className="px-6 pt-3 gap-3">
          {user.user_type === 'partner' && (
            <TouchableOpacity
              onPress={() => router.push('/(partner-dashboard)/dashboard')}
              className="bg-[#EF4444] rounded-xl p-4 flex-row items-center justify-between"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                  <Icon library="ionicons" name="stats-chart" size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Tableau de bord</Text>
                  <Text className="text-white/80 text-xs">Gérez votre activité</Text>
                </View>
              </View>
              <Icon library="ionicons" name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <Button label="Edit Profile" onPress={() => {}} variant="outline" />
          <Button label="Sign Out" onPress={logout} variant="ghost" />
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
