import { useState, type ReactNode } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { NavigationItem } from '@/components/settings/NavigationItem';
import { ToggleItem } from '@/components/settings/ToggleItem';
import { MOCK_USER_SETTINGS } from '@/features/settings/mockData';
import { useAuthStore } from '@/features/auth/auth.store';
import { useThemeStore } from '@/features/theme/theme.store';

export default function SecurityScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const [settings, setSettings] = useState(() => isDemo ? MOCK_USER_SETTINGS.security : { password_last_changed: '', email: user?.email ?? '', email_verified: user?.is_verified ?? false, phone: null, phone_verified: false, two_factor_enabled: false, active_sessions: [] });
  const colors = useThemeStore((state) => state.colors);

  const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non disponible';
  const handleChangePassword = () => Alert.alert('Changement de mot de passe', 'En mode démo, utilisez le parcours Mot de passe oublié depuis la page de connexion.');
  const handleManageSessions = () => Alert.alert('Sessions actives', `${settings.active_sessions.length} appareils connectés`, [...settings.active_sessions.map((session) => ({ text: `${session.device_name} - ${session.location}`, onPress: () => { if (!session.is_current) Alert.alert('Déconnecter', 'Voulez-vous déconnecter cet appareil ?', [{ text: 'Annuler', style: 'cancel' }, { text: 'Déconnecter', style: 'destructive' }]); } })), { text: 'Fermer', style: 'cancel' }]);

  return <SafeScreen>
    <Header title="Sécurité" onBack={() => router.back()} />
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <Section title="Connexion"><Card><NavigationItem icon="lock-closed-outline" label="Mot de passe" description={`Modifié le ${formatDate(settings.password_last_changed)}`} onPress={handleChangePassword} showBorder={false} /><IdentityRow icon="mail-outline" label="Email" value={settings.email} verified={settings.email_verified} /><IdentityRow icon="call-outline" label="Téléphone" value={settings.phone || 'Non renseigné'} verified={settings.phone_verified} /></Card></Section>
      <Section title="Authentification à deux facteurs"><Card><ToggleItem icon="shield-checkmark-outline" label="Authentification à deux facteurs" description="Sécurisez votre compte avec un code de vérification" value={settings.two_factor_enabled} onValueChange={(value) => { if (value) Alert.alert('Activer 2FA', 'Vous recevrez un code par SMS à chaque connexion'); setSettings({ ...settings, two_factor_enabled: value }); }} showBorder={false} /></Card></Section>
      <Section title="Sessions actives"><Card><NavigationItem icon="phone-portrait-outline" label="Gérer les appareils" description={`${settings.active_sessions.length} appareils connectés`} onPress={handleManageSessions} showBorder={false} /></Card></Section>
      <View className="mx-4 mt-6 rounded-xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}><View className="flex-row items-start"><View className="mr-3 h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: colors.accentSoft }}><Ionicons name="shield-checkmark" size={24} color={colors.primary} /></View><View className="flex-1"><Text className="mb-1 text-base font-bold" style={{ color: colors.text }}>Compte sécurisé</Text><Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>Votre compte est protégé. Email et téléphone vérifiés.{settings.two_factor_enabled ? ' Authentification à deux facteurs activée.' : ' Activez la 2FA pour plus de sécurité.'}</Text></View></View></View>
    </ScrollView>
  </SafeScreen>;
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="flex-row items-center border-b px-4 py-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={onBack} className="-ml-2 p-2" accessibilityRole="button" accessibilityLabel="Retour"><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="ml-2 text-xl font-bold" style={{ color: colors.text }}>{title}</Text></View>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mt-6 px-4"><Text className="mb-3 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>{title}</Text>{children}</View>;
}

function Card({ children }: { children: ReactNode }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="overflow-hidden rounded-xl" style={{ backgroundColor: colors.surface }}>{children}</View>;
}

function IdentityRow({ icon, label, value, verified }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; verified: boolean }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="flex-row items-center border-t px-4 py-4" style={{ borderColor: colors.border }}><View className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Ionicons name={icon} size={20} color={colors.primary} /></View><View className="flex-1"><Text className="text-sm font-medium" style={{ color: colors.text }}>{label}</Text><Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{value}</Text></View>{verified ? <View className="h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: colors.primary }}><Ionicons name="checkmark" size={16} color="#FFFFFF" /></View> : null}</View>;
}
