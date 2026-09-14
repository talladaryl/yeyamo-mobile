import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/ViewStates';
import { useAuthStore } from '@/features/auth/auth.store';
import { useAuthSessions, useRevokeAuthSession } from '@/features/auth/useSecurity';
import { useThemeStore } from '@/features/theme/theme.store';

export default function SecurityScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const user = useAuthStore((state) => state.user);
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const sessions = useAuthSessions();
  const revoke = useRevokeAuthSession();
  const revokeSession = (id: string) => Alert.alert('Déconnecter cette session', 'Cette session sera révoquée sur le serveur.', [{ text: 'Annuler', style: 'cancel' }, { text: 'Déconnecter', style: 'destructive', onPress: () => revoke.mutate(id) }]);

  return <SafeScreen><Header onBack={() => router.back()} /><ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
    <Section title="Identité de connexion"><Card><Identity icon="mail-outline" label="E-mail" value={user?.email || 'Non renseigné'} status={user?.email_verified ? 'Adresse vérifiée' : 'Adresse non vérifiée'} /><Identity icon="call-outline" label="Téléphone" value={user?.phone || 'Non renseigné'} status={user?.phone ? 'État de vérification indisponible' : 'Aucun téléphone associé'} /></Card></Section>
    <Section title="Mot de passe"><Card><TouchableOpacity onPress={() => router.push('/(profile)/change-password')} className="flex-row items-center p-4" accessibilityRole="button"><Ionicons name="key-outline" size={21} color={colors.primary} /><View className="ml-3 flex-1"><Text className="font-semibold" style={{ color: colors.text }}>Modifier le mot de passe</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>Une confirmation du mot de passe actuel est requise.</Text></View><Ionicons name="chevron-forward" size={20} color={colors.textMuted} /></TouchableOpacity></Card></Section>
    <Section title="Authentification à deux facteurs"><Card><View className="p-4"><Text className="font-semibold" style={{ color: colors.text }}>Indisponible pour le moment</Text><Text className="mt-1 text-sm leading-5" style={{ color: colors.textSecondary }}>Le backend ne fournit pas encore de configuration 2FA. Aucun réglage local n’est simulé.</Text></View></Card></Section>
    <Section title="Sessions"><Card>{isDemo ? <View className="p-4"><Text style={{ color: colors.textSecondary }}>Les sessions serveur ne sont pas disponibles en mode démo.</Text></View> : sessions.isLoading ? <View className="p-5"><LoadingState label="Chargement des sessions…" /></View> : sessions.isError ? <View className="p-4"><Text style={{ color: colors.textSecondary }}>Impossible de charger les sessions.</Text><Button label="Réessayer" variant="outline" size="sm" className="mt-3" onPress={() => void sessions.refetch()} /></View> : (sessions.data ?? []).length === 0 ? <View className="p-4"><Text style={{ color: colors.textSecondary }}>Aucune session active retournée par le serveur.</Text></View> : (sessions.data ?? []).map((session) => <View key={session.id} className="border-t p-4" style={{ borderColor: colors.border }}><View className="flex-row items-center"><Ionicons name="desktop-outline" size={20} color={colors.primary} /><View className="ml-3 flex-1"><Text className="font-semibold" style={{ color: colors.text }}>Session {session.id.slice(0, 8)}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{session.active ? 'Active' : 'Inactive'}{session.expiresAt ? ` · Expire le ${new Date(session.expiresAt).toLocaleDateString('fr-FR')}` : ''}</Text></View>{session.active ? <TouchableOpacity disabled={revoke.isPending} onPress={() => revokeSession(session.id)} accessibilityRole="button"><Text style={{ color: colors.primary }}>Déconnecter</Text></TouchableOpacity> : null}</View></View>)}</Card></Section>
  </ScrollView></SafeScreen>;
}

function Header({ onBack }: { onBack: () => void }) { const colors = useThemeStore((state) => state.colors); return <View className="flex-row items-center border-b px-4 py-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={onBack} className="-ml-2 p-2" accessibilityRole="button" accessibilityLabel="Retour"><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="ml-2 text-xl font-bold" style={{ color: colors.text }}>Sécurité</Text></View>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { const colors = useThemeStore((state) => state.colors); return <View className="mt-6 px-4"><Text className="mb-3 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>{title}</Text>{children}</View>; }
function Card({ children }: { children: React.ReactNode }) { const colors = useThemeStore((state) => state.colors); return <View className="overflow-hidden rounded-xl" style={{ backgroundColor: colors.surface }}>{children}</View>; }
function Identity({ icon, label, value, status }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; status: string }) { const colors = useThemeStore((state) => state.colors); return <View className="flex-row items-center border-t p-4 first:border-t-0" style={{ borderColor: colors.border }}><Ionicons name={icon} size={20} color={colors.primary} /><View className="ml-3 flex-1"><Text className="font-semibold" style={{ color: colors.text }}>{label}</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{value}</Text><Text className="mt-1 text-xs" style={{ color: colors.textMuted }}>{status}</Text></View></View>; }
