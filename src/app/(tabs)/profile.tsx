import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/features/auth/useAuth';
import { useThemeStore } from '@/features/theme/theme.store';

const QUICK_LINKS = [
  ['images', 'Mes publications', '/(profile)/publications'],
  ['heart', 'Mes favoris', '/(profile)/favorites'],
  ['calendar', 'Mes sorties', '/(profile)/events'],
  ['ticket', 'Mes réservations', '/(profile)/reservations'],
  ['star', 'Mes avis', '/(profile)/reviews'],
  ['notifications', 'Notifications', '/(profile)/notifications', '2'],
  ['settings', 'Paramètres', '/(profile)/settings'],
] as const;

const SOCIAL_LINKS = [
  ['search', 'Rechercher des utilisateurs', '/(profile)/search'],
  ['people', 'Suggestions à suivre', '/(profile)/suggestions'],
  ['person-add', 'Trouver des amis', '/(profile)/find-friends'],
  ['notifications', 'Activité du réseau', '/(profile)/activity'],
  ['settings', 'Paramètres du réseau social', '/(profile)/social-settings'],
  ['trophy', 'Mes badges', '/(social-graph)/badges', '3'],
  ['albums', 'Mes collections', '/(collections)', '6'],
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const colors = useThemeStore((state) => state.colors);

  if (!user) return null;

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="items-center px-6 pb-6 pt-8">
          <Avatar uri={user.avatar_url} displayName={user.display_name} size={90} />
          <Text className="mt-4 text-2xl font-bold" style={{ color: colors.text }}>{user.display_name}</Text>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>@{user.username}</Text>
          {user.city ? (
            <View className="mt-1 flex-row items-center gap-1">
              <Icon name="location-outline" size={12} color={colors.textSecondary} />
              <Text className="text-xs" style={{ color: colors.textSecondary }}>{user.city}</Text>
            </View>
          ) : null}
          {user.is_verified ? (
            <View className="mt-1 flex-row items-center gap-1">
              <Icon name="checkmark-circle" size={13} color={colors.primary} />
              <Text className="text-xs font-semibold" style={{ color: colors.primary }}>Profil vérifié</Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row justify-around border-y px-6 py-4" style={{ borderColor: colors.border }}>
          <Stat value="128" label="Publications" onPress={() => router.push('/(profile)/publications')} />
          <Stat value="2.3K" label="Abonnements" onPress={() => router.push('/(profile)/followers')} />
          <Stat value="340" label="Abonnés" onPress={() => router.push('/(profile)/following')} />
        </View>

        <View className="px-6 pt-4">
          <Button label="Modifier le profil" onPress={() => router.push('/(profile)/edit-profile')} variant="outline" />
        </View>

        <ProfileSection title="Accès rapide">
          {QUICK_LINKS.map(([icon, label, route, badge], index) => (
            <ProfileLink key={route} icon={icon} label={label} badge={badge} isLast={index === QUICK_LINKS.length - 1} onPress={() => router.push(route as Href)} />
          ))}
        </ProfileSection>

        <ProfileSection title="Réseau social">
          {SOCIAL_LINKS.map(([icon, label, route, badge], index) => (
            <ProfileLink key={route} icon={icon} label={label} badge={badge} isLast={index === SOCIAL_LINKS.length - 1} onPress={() => router.push(route as Href)} />
          ))}
        </ProfileSection>

        <View className="gap-3 px-6 pt-3">
          {user.user_type === 'partner' ? (
            <TouchableOpacity onPress={() => router.push('/(partner-dashboard)/dashboard')} activeOpacity={0.8} className="flex-row items-center justify-between rounded-xl bg-[#EF4444] p-4">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Icon name="stats-chart" size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text className="text-base font-bold text-white">Tableau de bord</Text>
                  <Text className="text-xs text-white/80">Gérez votre activité</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}
          <Button label="Se déconnecter" onPress={logout} variant="ghost" />
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

function Stat({ value, label, onPress }: { value: string; label: string; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity onPress={onPress} className="items-center" activeOpacity={0.7}>
      <Text className="text-xl font-bold" style={{ color: colors.text }}>{value}</Text>
      <Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{label}</Text>
    </TouchableOpacity>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View className="px-6 pt-6">
      <Text className="mb-3 text-base font-bold" style={{ color: colors.text }}>{title}</Text>
      <View className="mb-3 overflow-hidden rounded-xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>{children}</View>
    </View>
  );
}

function ProfileLink({ icon, label, badge, isLast, onPress }: { icon: string; label: string; badge?: string; isLast: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="flex-row items-center p-4" style={{ borderBottomWidth: isLast ? 0 : 1, borderColor: colors.border }}>
      <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
        <Icon name={icon} size={20} color={colors.primary} />
      </View>
      <Text className="ml-3 flex-1 text-sm font-semibold" style={{ color: colors.text }}>{label}</Text>
      {badge ? <View className="mr-2 rounded-full bg-[#EF4444] px-2 py-0.5"><Text className="text-xs font-bold text-white">{badge}</Text></View> : null}
      <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}
