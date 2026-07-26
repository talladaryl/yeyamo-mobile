import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { useTrackAdClick } from '@/features/ads/useAds';
import type { SponsoredFeedItem } from '@/features/feed/types';

export function SponsoredFeedCard({ item, height, isActive }: { item: SponsoredFeedItem; height: number; isActive: boolean }) {
  const router = useRouter();
  const trackClick = useTrackAdClick();
  const media = item.media[0];
  const player = useVideoPlayer(media?.type === 'video' && isActive ? media.url : null, (instance) => { instance.loop = true; if (isActive) instance.play(); });
  const open = () => {
    trackClick.mutate({ deliveryId: item.delivery_id, trackingToken: item.click_tracking_token });
    const target = item.promoted_entity;
    const route = target.type === 'place' ? `/(places)/${target.id}` : target.type === 'event' ? `/(events)/${target.id}` : target.type === 'post' ? `/(post)/${target.id}` : `/(profile)/${target.id}`;
    router.push(route as Href);
  };
  return <View style={{ height }} className="bg-[#0A0A0A]">{media?.type === 'video' ? <VideoView player={player} style={{ flex: 1 }} contentFit="cover" nativeControls={false} /> : <Image source={{ uri: media?.url }} style={{ flex: 1 }} contentFit="cover" />}<LinearGradient colors={['transparent', 'rgba(0,0,0,0.88)']} className="absolute inset-x-0 bottom-0 h-64" /><View className="absolute bottom-5 left-4 right-4"><View className="mb-3 flex-row items-center"><Avatar uri={item.sponsor.avatar_url} displayName={item.sponsor.display_name} size={40} /><View className="ml-2 flex-1"><Text className="font-bold text-white">{item.sponsor.display_name}</Text><Text className="text-xs font-semibold text-white/70">Sponsorisé</Text></View><Icon name="megaphone-outline" size={20} color="#FFFFFF" /></View>{item.caption ? <Text className="mb-4 text-sm leading-5 text-white" numberOfLines={3}>{item.caption}</Text> : null}<TouchableOpacity onPress={open} className="flex-row items-center justify-center rounded-xl bg-[#EF4444] py-3.5"><Text className="font-bold text-white">{item.cta.label}</Text><Icon name="arrow-forward" size={18} color="#FFFFFF" /></TouchableOpacity></View></View>;
}
