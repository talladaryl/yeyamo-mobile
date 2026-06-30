// Mock data pour le Social Graph
import type { UserSearchResult, FollowUser, SuggestionUser, ActivityItem, SocialSettings } from './types';

export const mockSearchResults: UserSearchResult[] = [
  {
    id: 1,
    username: 'marie.kausch',
    display_name: 'Marie Kausch',
    avatar_url: 'https://i.pravatar.cc/150?img=1',
    is_verified: true,
    user_type: 'user',
    bio: 'Exploratrice Cameroun 🇨🇲',
    city: 'Yaoundé',
    followers_count: 2340,
    is_following: false,
    mutual_friends_count: 5,
  },
  {
    id: 2,
    username: 'alex.mbango',
    display_name: 'Alex Mbango',
    avatar_url: 'https://i.pravatar.cc/150?img=2',
    is_verified: false,
    user_type: 'user',
    bio: 'Photographe professionnel',
    city: 'Douala',
    followers_count: 1205,
    is_following: false,
    mutual_friends_count: 2,
  },
  {
    id: 3,
    username: 'sarah.l',
    display_name: 'Sarah L.',
    avatar_url: 'https://i.pravatar.cc/150?img=3',
    is_verified: false,
    user_type: 'user',
    city: 'Yaoundé',
    followers_count: 512,
    is_following: true,
    mutual_friends_count: 8,
  },
];

export const mockFollowing: FollowUser[] = [
  {
    id: 4,
    username: 'leo.mbarga',
    display_name: 'Léo Mbarga',
    avatar_url: 'https://i.pravatar.cc/150?img=4',
    is_verified: false,
    user_type: 'user',
    bio: 'Food lover 🍕',
    city: 'Yaoundé',
    followers_count: 890,
    is_following: true,
    is_followed_by: true,
  },
  {
    id: 5,
    username: 'david.n',
    display_name: 'David N.',
    avatar_url: 'https://i.pravatar.cc/150?img=5',
    is_verified: true,
    user_type: 'partner',
    bio: 'Restaurant Le Palais Resort',
    city: 'Kribi',
    followers_count: 3421,
    is_following: true,
    is_followed_by: false,
  },
  {
    id: 6,
    username: 'kim.m',
    display_name: 'Kim M.',
    avatar_url: 'https://i.pravatar.cc/150?img=6',
    is_verified: false,
    user_type: 'user',
    city: 'Bafoussam',
    followers_count: 234,
    is_following: true,
    is_followed_by: true,
  },
];

export const mockFollowers: FollowUser[] = [
  {
    id: 7,
    username: 'nadia.k',
    display_name: 'Nadia K.',
    avatar_url: 'https://i.pravatar.cc/150?img=7',
    is_verified: false,
    user_type: 'user',
    bio: 'Travel enthusiast ✈️',
    city: 'Douala',
    followers_count: 1520,
    is_following: false,
    is_followed_by: true,
  },
  {
    id: 8,
    username: 'paul.t',
    display_name: 'Paul T.',
    avatar_url: 'https://i.pravatar.cc/150?img=8',
    is_verified: false,
    user_type: 'user',
    city: 'Yaoundé',
    followers_count: 678,
    is_following: true,
    is_followed_by: true,
  },
];

export const mockSuggestions: SuggestionUser[] = [
  {
    id: 9,
    username: 'travel.cam',
    display_name: 'Travel Cam',
    avatar_url: 'https://i.pravatar.cc/150?img=9',
    is_verified: true,
    user_type: 'partner',
    bio: 'Voyage et Découverte 🗺️',
    city: 'Yaoundé',
    followers_count: 12500,
    mutual_friends_count: 12,
    reason: 'Basé sur vos centres d\'intérêt',
  },
  {
    id: 10,
    username: 'mariam.v',
    display_name: 'Mariam V.',
    avatar_url: 'https://i.pravatar.cc/150?img=10',
    is_verified: false,
    user_type: 'user',
    city: 'Yaoundé',
    followers_count: 534,
    mutual_friends_count: 7,
    reason: '7 amis en commun',
  },
  {
    id: 11,
    username: 'olivianm',
    display_name: 'Olivia NM',
    avatar_url: 'https://i.pravatar.cc/150?img=11',
    is_verified: false,
    user_type: 'user',
    city: 'Douala',
    followers_count: 892,
    mutual_friends_count: 3,
    reason: 'Populaire à Douala',
  },
];

export const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'like',
    user: {
      id: 4,
      username: 'leo.mbarga',
      display_name: 'Léo Mbarga',
      avatar_url: 'https://i.pravatar.cc/150?img=4',
      is_verified: false,
      user_type: 'user',
    },
    post: {
      id: 123,
      thumbnail_url: 'https://via.placeholder.com/400',
    },
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
  },
  {
    id: '2',
    type: 'follow',
    user: {
      id: 8,
      username: 'paul.t',
      display_name: 'Paul T.',
      avatar_url: 'https://i.pravatar.cc/150?img=8',
      is_verified: false,
      user_type: 'user',
    },
    target_user: {
      id: 5,
      username: 'david.n',
      display_name: 'David N.',
      avatar_url: 'https://i.pravatar.cc/150?img=5',
      is_verified: true,
      user_type: 'partner',
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
  },
  {
    id: '3',
    type: 'comment',
    user: {
      id: 6,
      username: 'kim.m',
      display_name: 'Kim M.',
      avatar_url: 'https://i.pravatar.cc/150?img=6',
      is_verified: false,
      user_type: 'user',
    },
    post: {
      id: 456,
      thumbnail_url: 'https://via.placeholder.com/400',
    },
    content: 'Superbe photo ! 😍',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5h ago
  },
  {
    id: '4',
    type: 'post',
    user: {
      id: 5,
      username: 'david.n',
      display_name: 'David N.',
      avatar_url: 'https://i.pravatar.cc/150?img=5',
      is_verified: true,
      user_type: 'partner',
    },
    post: {
      id: 789,
      thumbnail_url: 'https://via.placeholder.com/400',
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8h ago
  },
];

export const mockSettings: SocialSettings = {
  privacy: {
    profile_visibility: 'public',
    show_activity: true,
    show_followers: true,
    show_following: true,
  },
  notifications: {
    new_followers: true,
    follow_requests: false,
    mentions: true,
    activity_updates: true,
  },
  preferences: {
    allow_suggestions: true,
    allow_messages_from_strangers: false,
  },
};
