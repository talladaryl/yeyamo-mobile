import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { RemoteAudioPlayer } from '@/features/culture/components/RemoteAudioPlayer';
import { useLesson, useStartLesson } from '@/features/culture/culture.hooks';
import { mediaContentUrl } from '@/services/api/contracts';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const lesson = useLesson(id);
  const start = useStartLesson();

  useEffect(() => {
    if (id && lesson.data && !start.isSuccess && !start.isPending) start.mutate(id);
  }, [id, lesson.data, start]);

  if (lesson.isLoading) return <SafeScreen><View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View></SafeScreen>;
  if (lesson.isError || !lesson.data) return <SafeScreen><View className="flex-1 items-center justify-center px-8"><Text className="text-center" style={{ color: colors.text }}>Cette leçon est indisponible.</Text><TouchableOpacity onPress={() => lesson.refetch()} className="mt-4"><Text className="font-bold text-[#EF4444]">Réessayer</Text></TouchableOpacity></View></SafeScreen>;
  const data = lesson.data;
  return <SafeScreen><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
    <TouchableOpacity onPress={() => router.back()} className="mb-6 self-start p-1"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
    <Text className="text-xs font-bold text-[#B91C1C]">{data.lesson.estimatedMinutes} MIN · NIVEAU {data.lesson.difficulty}</Text>
    <Text className="mt-2 text-3xl font-extrabold" style={{ color: colors.text }}>{data.lesson.title}</Text>
    <Text className="mt-3 text-base" style={{ color: colors.textSecondary }}>{data.lesson.description}</Text>
    {data.items.map((item, index) => <View key={item.id} className="mt-6 rounded-2xl border p-5" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      <Text className="text-xs font-bold text-[#B91C1C]">ÉTAPE {index + 1}</Text><Text className="mt-3 text-2xl font-bold" style={{ color: colors.text }}>{item.phrase}</Text><Text className="mt-2 text-base" style={{ color: colors.textSecondary }}>{item.translation}</Text>
      {item.transcription ? <Text className="mt-1 text-sm italic" style={{ color: colors.textMuted }}>{item.transcription}</Text> : null}
      <View className="mt-4"><RemoteAudioPlayer source={item.audioMediaId ? mediaContentUrl(item.audioMediaId) : null} transcript={item.phonetic} /></View>
      {item.culturalContext ? <Text className="mt-4 text-sm leading-6" style={{ color: colors.textSecondary }}>{item.culturalContext}</Text> : null}
    </View>)}
    <TouchableOpacity onPress={() => router.push(`/(explore)/language-lessons/${id}/quiz`)} className="mt-7 items-center rounded-xl bg-[#EF4444] px-4 py-4"><Text className="font-bold text-white">Passer au mini-quiz</Text></TouchableOpacity>
  </ScrollView></SafeScreen>;
}
