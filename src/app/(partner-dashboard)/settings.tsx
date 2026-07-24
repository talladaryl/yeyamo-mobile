import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { PartnerPage } from '@/components/partner-dashboard/PartnerPage';
import { SettingsItem } from '@/components/partner-dashboard/SettingsItem';
import { settingsSections } from '@/features/partner-dashboard/mockData';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/features/auth/useAuth';
import { useThemeStore } from '@/features/theme/theme.store';
import { useAuthStore } from '@/features/auth/auth.store';
import { usePartnerProfile } from '@/features/partner-dashboard/usePartnerDashboard';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const colors = useThemeStore((state) => state.colors);
  const isDemo = useAuthStore((state) => state.sessionMode === 'demo-partner');
  const { data: profile } = usePartnerProfile();
  const openItem = () => router.push('/(profile)/settings');
  return (
    <PartnerPage title="Paramètres" subtitle="Gérez votre compte et vos préférences professionnelles">
      <View className="my-3 flex-row items-center rounded-2xl border p-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        {isDemo ? <Image source={{ uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300' }} style={{ width: 62, height: 62, borderRadius: 14 }} contentFit="cover" /> : <View className="h-[62px] w-[62px] items-center justify-center rounded-[14px]" style={{ backgroundColor: colors.elevated }}><Icon name="business" size={28} color={colors.textSecondary} /></View>}
        <View className="ml-3 flex-1"><Text className="font-bold" style={{ color: colors.text }}>{profile?.tradeName || profile?.legalName || 'Profil partenaire'}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{profile?.status ?? 'Chargement'}</Text><Text className="mt-1 text-xs font-semibold text-[#E60012]">Voir mon profil public</Text></View>
        {profile?.status === 'VERIFIED' ? <Icon name="checkmark-circle" size={20} color="#16A34A" /> : null}
      </View>
      {settingsSections.map((section) => (
        <View key={section.title} className="mb-5">
          <Text className="mb-2 text-sm font-extrabold" style={{ color: colors.text }}>{section.title}</Text>
          {section.items.map((item) => <SettingsItem key={item.id} item={isDemo ? item : { ...item, value: undefined }} onPress={openItem} />)}
        </View>
      ))}
      <TouchableOpacity onPress={logout} className="mb-4 flex-row items-center justify-center gap-2 rounded-xl border border-[#EF4444] p-4"><Icon name="log-out-outline" size={20} color="#E60012" /><Text className="font-bold text-[#E60012]">Se déconnecter</Text></TouchableOpacity>
    </PartnerPage>
  );
}
