import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useChangePassword } from '@/features/auth/useSecurity';
import { useThemeStore } from '@/features/theme/theme.store';

export default function ChangePasswordScreen() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors); const change = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [confirmation, setConfirmation] = useState(''); const [error, setError] = useState<string | null>(null);
  const submit = async () => { if (!currentPassword || !newPassword) { setError('Renseignez le mot de passe actuel et le nouveau mot de passe.'); return; } if (newPassword !== confirmation) { setError('La confirmation ne correspond pas au nouveau mot de passe.'); return; } setError(null); try { await change.mutateAsync({ currentPassword, newPassword }); router.back(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Le mot de passe n’a pas pu être modifié.'); } };
  return <View className="flex-1" style={{ backgroundColor: colors.background }}><View className="flex-row items-center border-b px-4 py-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2"><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="ml-2 text-xl font-bold" style={{ color: colors.text }}>Modifier le mot de passe</Text></View><YeyamoFormScreen footer={<View className="p-4"><Button label="Enregistrer le mot de passe" onPress={() => void submit()} isLoading={change.isPending} /></View>}><View className="gap-4 p-4">{error ? <Text className="rounded-xl border p-3 text-sm" style={{ color: colors.textSecondary, borderColor: colors.primary }}>{error}</Text> : null}<Input label="Mot de passe actuel" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry autoCapitalize="none" /><Input label="Nouveau mot de passe" value={newPassword} onChangeText={setNewPassword} secureTextEntry autoCapitalize="none" /><Input label="Confirmer le nouveau mot de passe" value={confirmation} onChangeText={setConfirmation} secureTextEntry autoCapitalize="none" /></View></YeyamoFormScreen></View>;
}
