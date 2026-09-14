import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { VisibilityPicker } from '@/components/collections/VisibilityPicker';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useCreateCollection } from '@/features/collections/useCollections';
import type { Collection } from '@/features/collections/types';
import { useThemeStore } from '@/features/theme/theme.store';

export default function CreateCollectionScreen() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors); const create = useCreateCollection();
  const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [visibility, setVisibility] = useState<Collection['visibility']>('private'); const [error, setError] = useState<string | null>(null);
  const submit = async () => { if (!name.trim()) { setError('Donnez un nom à votre collection.'); return; } setError(null); try { await create.mutateAsync({ name: name.trim(), description: description.trim() || undefined, visibility }); router.back(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Impossible de créer la collection.'); } };
  return <SafeScreen><YeyamoFormScreen footer={<View className="flex-row gap-3 px-4 py-4"><View className="flex-1"><Button label="Annuler" variant="secondary" onPress={() => router.back()} disabled={create.isPending} /></View><View className="flex-1"><Button label="Créer" onPress={() => void submit()} isLoading={create.isPending} disabled={!name.trim()} /></View></View>}><View className="px-4 py-6"><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Nouvelle collection</Text><View className="mt-6 gap-5">{error ? <Text className="rounded-xl border p-3 text-sm" style={{ color: colors.textSecondary, borderColor: colors.primary }}>{error}</Text> : null}<View className="rounded-xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}><Text className="font-semibold" style={{ color: colors.text }}>Couverture personnalisée</Text><Text className="mt-1 text-sm leading-5" style={{ color: colors.textSecondary }}>Indisponible : le backend accepte uniquement un asset catalogue comme couverture et ne permet pas encore d’associer une image de galerie à une collection.</Text></View><Input label="Nom de la collection" value={name} onChangeText={setName} placeholder="Ex. Restaurants à tester" maxLength={120} helperText={`${name.length}/120`} /><Input label="Description (optionnelle)" value={description} onChangeText={setDescription} placeholder="Décrivez votre collection…" maxLength={2000} multiline helperText={`${description.length}/2000`} /><VisibilityPicker value={visibility} onChange={setVisibility} /></View></View></YeyamoFormScreen></SafeScreen>;
}
