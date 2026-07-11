import type { PaginatedResponse } from '@/types/api.types';
import type { AuthUser } from '@/features/auth/types';
import type { FeedPost } from '@/features/feed/types';
import type { Story } from '@/features/story/types';
import type { ChatMessage, Conversation } from '@/features/chat/types';

export const MOCK_USER: AuthUser = {
  id: 1,
  username: 'daryl_demo',
  display_name: 'Daryl Demo',
  email: 'demo@yeyamo.com',
  avatar_url: 'https://i.pravatar.cc/150?img=11',
  city: 'Douala',
  is_verified: true,
  user_type: 'user',
  created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
};

export const MOCK_TOKEN = 'mock-yeyamo-token';

export const MOCK_FEED_POSTS: FeedPost[] = [
  {
    id: 101,
    type: 'image',
    caption: 'Week-end a Kribi. Plage, poisson braise et coucher de soleil.',
    media: [
      {
        id: 1001,
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080',
        thumbnail_url: null,
        type: 'image',
        width: 1080,
        height: 1920,
        duration_seconds: null,
      },
    ],
    author: {
      id: 2,
      username: 'marie_voyage',
      display_name: 'Marie Voyage',
      avatar_url: 'https://i.pravatar.cc/150?img=5',
      is_verified: true,
      user_type: 'user',
    },
    likes_count: 12400,
    comments_count: 238,
    shares_count: 91,
    is_liked: false,
    is_saved: false,
    place_tag: { id: 101, name: 'Kribi Beach' },
    created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
  {
    id: 102,
    type: 'image',
    caption: 'Un cafe calme a Bonapriso pour travailler et respirer un peu.',
    media: [
      {
        id: 1002,
        url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1080',
        thumbnail_url: null,
        type: 'image',
        width: 1080,
        height: 1920,
        duration_seconds: null,
      },
    ],
    author: {
      id: 3,
      username: 'douala_spots',
      display_name: 'Douala Spots',
      avatar_url: 'https://i.pravatar.cc/150?img=12',
      is_verified: false,
      user_type: 'user',
    },
    likes_count: 8300,
    comments_count: 94,
    shares_count: 33,
    is_liked: true,
    is_saved: true,
    place_tag: { id: 102, name: 'Bonapriso' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 103,
    type: 'image',
    caption: 'Sortie entre amis au marche artisanal. Les couleurs sont folles.',
    media: [
      {
        id: 1003,
        url: 'https://images.unsplash.com/photo-1536323760109-ca8c07450053?w=1080',
        thumbnail_url: null,
        type: 'image',
        width: 1080,
        height: 1920,
        duration_seconds: null,
      },
    ],
    author: {
      id: 4,
      username: 'arthur_local',
      display_name: 'Arthur Local',
      avatar_url: 'https://i.pravatar.cc/150?img=20',
      is_verified: false,
      user_type: 'user',
    },
    likes_count: 21400,
    comments_count: 410,
    shares_count: 146,
    is_liked: false,
    is_saved: false,
    place_tag: { id: 103, name: 'Marche artisanal' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
  },
];

export const MOCK_FEED_PAGE: PaginatedResponse<FeedPost> = {
  data: MOCK_FEED_POSTS,
  meta: {
    current_page: 1,
    last_page: 1,
    per_page: MOCK_FEED_POSTS.length,
    total: MOCK_FEED_POSTS.length,
  },
  links: {
    first: null,
    last: null,
    prev: null,
    next: null,
  },
};

export const MOCK_STORIES: Story[] = [
  {
    id: 1,
    author: MOCK_USER,
    media: {
      id: 2001,
      url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1080',
      thumbnail_url: null,
      type: 'image',
      width: 1080,
      height: 1920,
      duration_seconds: null,
    },
    views_count: 128,
    viewed: false,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
];

const now = Date.now();

export const MOCK_MESSAGES: Record<number, ChatMessage[]> = {
  1: [
    {
      id: 1,
      conversation_id: 1,
      sender: {
        id: 2,
        username: 'marie_voyage',
        display_name: 'Marie Voyage',
        avatar_url: 'https://i.pravatar.cc/150?img=5',
        is_verified: true,
      },
      body: 'Tu as vu le spot a Kribi ? On peut y aller samedi.',
      message_type: 'text',
      type: 'text',
      media_url: null,
      attachments: [],
      read_at: new Date(now - 1000 * 60 * 20).toISOString(),
      created_at: new Date(now - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 2,
      conversation_id: 1,
      sender: MOCK_USER,
      body: 'Oui, parfait. Je regarde les places dans l’app.',
      message_type: 'text',
      type: 'text',
      media_url: null,
      attachments: [],
      read_at: new Date(now - 1000 * 60 * 10).toISOString(),
      created_at: new Date(now - 1000 * 60 * 30).toISOString(),
    },
  ],
  2: [
    {
      id: 3,
      conversation_id: 2,
      sender: {
        id: 3,
        username: 'douala_spots',
        display_name: 'Douala Spots',
        avatar_url: 'https://i.pravatar.cc/150?img=12',
        is_verified: false,
      },
      body: 'Nouveau cafe ajoute dans Explorer. Tu me dis ce que tu en penses.',
      message_type: 'text',
      type: 'text',
      media_url: null,
      attachments: [],
      read_at: null,
      created_at: new Date(now - 1000 * 60 * 75).toISOString(),
    },
  ],
};

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    type: 'user',
    is_pinned: true,
    participant: {
      id: 2,
      username: 'marie_voyage',
      display_name: 'Marie Voyage',
      avatar_url: 'https://i.pravatar.cc/150?img=5',
      is_verified: true,
    },
    participants: [],
    last_message: MOCK_MESSAGES[1][1],
    unread_count: 0,
    updated_at: MOCK_MESSAGES[1][1].created_at,
  },
  {
    id: 2,
    type: 'partner',
    is_pinned: false,
    participant: {
      id: 3,
      username: 'douala_spots',
      display_name: 'Douala Spots',
      avatar_url: 'https://i.pravatar.cc/150?img=12',
      is_verified: false,
    },
    participants: [],
    last_message: MOCK_MESSAGES[2][0],
    unread_count: 1,
    updated_at: MOCK_MESSAGES[2][0].created_at,
  },
];

export function paginatedMessages(conversationId: number): PaginatedResponse<ChatMessage> {
  const data = MOCK_MESSAGES[conversationId] ?? [];
  return {
    data,
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: data.length,
      total: data.length,
    },
    links: {
      first: null,
      last: null,
      prev: null,
      next: null,
    },
  };
}
