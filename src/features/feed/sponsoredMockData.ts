import type { SponsoredFeedItem } from './types';
export const mockSponsoredFeedItems: SponsoredFeedItem[] = [{
  item_kind: 'sponsored', id: 'sponsored-demo-1', delivery_id: 'delivery-demo-1', campaign_id: 'campaign-summer-falaise',
  sponsor: { id: 'partner-falaise', username: 'lafalaiseresort', display_name: 'La Falaise Resort', avatar_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200', is_verified: true, user_type: 'partner' },
  media: [{ id: 'sponsored-media-1', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900', thumbnail_url: null, type: 'image', width: 1080, height: 1350, duration_seconds: null }],
  caption: 'Une escapade exceptionnelle vous attend au cœur de Douala.',
  cta: { label: 'Découvrir' }, promoted_entity: { type: 'place', id: '1' },
  impression_tracking_token: 'demo-impression-token', click_tracking_token: 'demo-click-token',
}];
