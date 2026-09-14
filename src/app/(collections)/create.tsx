import { useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { VisibilityPicker } from '@/components/collections/VisibilityPicker';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { useYeyamoMediaPicker } from '@/components/media/useYeyamoMediaPicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useCreateCollection } from '@/features/collections/useCollections';
import type { Collection } from '@/features/collections/types';
import { useThemeStore } from '@/features/theme/theme.store';

export default function CreateCollectionScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const createCollection = useCreateCollection();
  const { pickFromLibrary } = useYeyamoMediaPicker();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<string | undefined>();
  const [visibility, setVisibility] = useState<Collection['visibility']>('private');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => { try { const result = await pickFromLibrary({ mediaTypes: ['images'], quality: 0.85, allowsEditing: true }); if (!result.cancelled && result.assets[0]) setCoverImage(result.assets[0].uri); } catch (error) { Alert.alert('Image indisponible', error instanceof Error ? error.message : 'Réessayez dans quelques instants.'); } };
  const handleCreate = async () => { if (!name.trim()) { Alert.alert('Erreur', 'Veuillez entrer un nom pour la collection'); return; } setIsSubmitting(true); try { await createCollection.mutateAsync({ name: name.trim(), description: description.trim() || undefined, cover_image_url: coverImage, visibility }); router.back(); } catch { Alert.alert('Erreur', 'Impossible de créer la collection'); } finally { setIsSubmitting(false); } };

  return <SafeScreen><YeyamoFormScreen footer={<View className="flex-row gap-3 px-4 py-4"><View className="flex-1"><Button label="Annuler" variant="secondary" onPress={() => router.back()} disabled={isSubmitting} /></View><View className="flex-1"><Button label="Créer" onPress={handleCreate} isLoading={isSubmitting} disabled={isSubmitting || !name.trim()} /></View></View>}><View className="px-4 py-6"><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Nouvelle collection</Text><View className="mt-6 gap-5"><View><Text className="mb-3 text-base font-semibold" style={{ color: colors.text }}>Photo (optionnel)</Text><TouchableOpacity onPress={handlePickImage} className="h-40 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed" style={{ backgroundColor: colors.surface, borderColor: colors.border }} accessibilityRole="button" accessibilityLabel="Ajouter une photo">{coverImage ? <Image source={{ uri: coverImage }} className="h-full w-full" /> : <><Ionicons name="camera" size={40} color={colors.textMuted} /><Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>Ajoutez une photo</Text></>}</TouchableOpacity></View><Input label="Nom de la collection" value={name} onChangeText={setName} placeholder="Ex. Restaurants à tester" maxLength={50} helperText={`${name.length}/50`} /><Input label="Description (optionnelle)" value={description} onChangeText={setDescription} placeholder="Décrivez votre collection…" maxLength={120} multiline helperText={`${description.length}/120`} /><VisibilityPicker value={visibility} onChange={setVisibility} /></View></View></YeyamoFormScreen></SafeScreen>;
}
