import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useThemeStore } from '@/features/theme/theme.store';
import { useCompleteLesson, useLesson, useSubmitLessonAttempt } from '@/features/culture/culture.hooks';

export default function LessonQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const lesson = useLesson(id);
  const attempt = useSubmitLessonAttempt();
  const complete = useCompleteLesson();
  const exercise = lesson.data?.exercises[0];
  const options = exercise?.optionsJson ? parseOptions(exercise.optionsJson) : [];

  const answer = async (answerText?: string) => {
    if (!id || !exercise || attempt.isPending || complete.isPending) return;
    try {
      const result = await attempt.mutateAsync({ id, exerciseId: exercise.id, answerText });
      const score = result.correct === true ? 100 : result.correct === false ? 0 : 0;
      await complete.mutateAsync({ id, score });
      router.replace({ pathname: '/(explore)/language-lessons/[id]/result' as never, params: { id, score: String(score), reviewed: String(result.manualReviewRequired) } } as never);
    } catch { /* explicit error state below */ }
  };

  if (lesson.isLoading) return <SafeScreen><View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View></SafeScreen>;
  if (lesson.isError || !lesson.data) return <SafeScreen><View className="flex-1 items-center justify-center"><Text style={{ color: colors.text }}>Quiz indisponible.</Text></View></SafeScreen>;
  return <SafeScreen><View className="flex-1 px-5 pt-8">
    <Text className="text-xs font-bold text-[#B91C1C]">MINI-QUIZ · RÉPONSE ENREGISTRÉE PAR LE SERVEUR</Text>
    <Text className="mt-3 text-2xl font-extrabold" style={{ color: colors.text }}>{exercise?.prompt ?? 'Aucun exercice publié pour cette leçon.'}</Text>
    <View className="mt-8 gap-3">{options.length ? options.map((option) => <TouchableOpacity key={option} disabled={attempt.isPending || complete.isPending} onPress={() => answer(option)} className="rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text style={{ color: colors.text }}>{option}</Text></TouchableOpacity>) : <TouchableOpacity disabled={attempt.isPending || complete.isPending} onPress={() => answer()} className="rounded-xl bg-[#EF4444] p-4"><Text className="text-center font-bold text-white">Terminer la leçon</Text></TouchableOpacity>}</View>
    {attempt.isError || complete.isError ? <Text className="mt-4 text-sm text-[#B91C1C]">La réponse n’a pas été enregistrée. Réessayez.</Text> : null}
  </View></SafeScreen>;
}

function parseOptions(value: string): string[] { try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []; } catch { return []; } }
