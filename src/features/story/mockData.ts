import type { Story } from './types';

export const mockStories: Story[] = [
  {
    id: 1,
    author: {
      id: 3,
      username: 'marie_kasan',
      display_name: 'Marie Kasan',
      avatar_url: 'https://i.pravatar.cc/150?img=5',
      is_verified: true,
      user_type: 'user',
    },
    media: {
      id: 1001,
      type: 'image',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080',
      thumbnail_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      width: 1080,
      height: 1920,
      duration_seconds: null,
    },
    text: 'Matin paradisiaque à Kribi #3\nBien né vaut sa célébration',
    location_tag: {
      id: 1,
      name: 'Kribi',
      city: 'Cameroun',
    },
    views_count: 234,
    viewed: false,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];
