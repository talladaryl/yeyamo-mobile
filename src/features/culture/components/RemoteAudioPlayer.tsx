import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useVideoPlayer } from 'expo-video';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

/** Accessible audio control. Audio is never preloaded until the user presses play. */
export function RemoteAudioPlayer({ source, transcript }: { source?: string | null; transcript?: string | null }) {
  const colors = useThemeStore((state) => state.colors);
  const player = useVideoPlayer(source ?? null, (instance) => { instance.audioMixingMode = 'auto'; });
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  if (!source) return transcript ? <Text className="text-sm" style={{ color: colors.textSecondary }}>{transcript}</Text> : null;
  const toggle = () => { if (isPlaying) player.pause(); else player.play(); setIsPlaying((value) => !value); };
  const cycleSpeed = () => { const next = speed === 0.75 ? 1 : speed === 1 ? 1.25 : 0.75; player.playbackRate = next; setSpeed(next); };
  return <View className="rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.elevated }}><View className="flex-row items-center"><TouchableOpacity accessibilityRole="button" accessibilityLabel={isPlaying ? 'Mettre l’audio en pause' : 'Lire l’audio'} onPress={toggle} className="h-10 w-10 items-center justify-center rounded-full bg-[#EF4444]"><Icon name={isPlaying ? 'pause' : 'play'} size={19} color="#FFFFFF" /></TouchableOpacity><View className="ml-3 flex-1"><Text className="text-sm font-semibold" style={{ color: colors.text }}>Écouter la prononciation</Text>{transcript ? <Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }} numberOfLines={2}>{transcript}</Text> : null}</View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Changer la vitesse de lecture" onPress={cycleSpeed} className="rounded-lg px-2 py-1"><Text className="text-xs font-bold" style={{ color: colors.primary }}>{String(speed).replace('.', ',')}×</Text></TouchableOpacity></View></View>;
}
