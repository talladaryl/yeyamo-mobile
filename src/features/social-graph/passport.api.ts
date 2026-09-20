import { useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/services/api/client';
import { useAuthStore } from '@/features/auth/auth.store';

export interface PassportSummary {
  totalXp: number;
  level: number;
  currentLevelThreshold: number;
  nextLevelThreshold: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  earnedBadgesCount: number;
  passportStampsCount: number;
  availableRewardsCount: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  updatedAt: string;
}

export interface PassportBadge { id: string; code: string; name: string; description: string; earnedAt: string }
export interface PassportStamp { id: string; destinationId: string; stampedAt: string }
export interface PassportReward { id: string; code: string; title: string; status: string; grantedAt: string; claimedAt: string | null; source: string }
export interface PassportMissionObjective { id: string; label: string; target: number; current: number; completed: boolean }
export interface PassportMission { id: string; code: string; title: string; description: string; status: string; startsAt: string | null; endsAt: string | null; rewardCode: string; rewardTitle: string; rewardAmount: number; objectives: PassportMissionObjective[]; userStatus: string; completedAt: string | null }
export interface PassportHistoryItem { id: string; points: number; reason: string; sourceId: string; occurredAt: string }
export interface PassportLeaderboardEntry { rank: number; userId: string; totalXp: number; level: number }
interface Page<T> { content: T[] }

export const passportKeys = {
  all: ['passport'] as const,
  summary: () => [...passportKeys.all, 'summary'] as const,
  badges: () => [...passportKeys.all, 'badges'] as const,
  stamps: () => [...passportKeys.all, 'stamps'] as const,
  rewards: () => [...passportKeys.all, 'rewards'] as const,
  missions: () => [...passportKeys.all, 'missions'] as const,
  history: () => [...passportKeys.all, 'history'] as const,
  leaderboard: () => [...passportKeys.all, 'leaderboard'] as const,
};

export const passportApi = {
  summary: () => apiGet<PassportSummary>('/me/passport/summary'),
  badges: () => apiGet<PassportBadge[]>('/me/badges'),
  stamps: () => apiGet<PassportStamp[]>('/me/passport'),
  rewards: () => apiGet<PassportReward[]>('/me/rewards'),
  missions: () => apiGet<PassportMission[]>('/me/missions'),
  history: () => apiGet<Page<PassportHistoryItem>>('/me/xp/history?size=20'),
  leaderboard: () => apiGet<PassportLeaderboardEntry[]>('/me/leaderboard?limit=50'),
  claimReward: (rewardId: string) => apiPost<PassportReward>(`/me/rewards/${rewardId}/claim`),
};

const usePassportQuery = <T>(key: readonly unknown[], queryFn: () => Promise<T>) => {
  const backendSession = useAuthStore((state) => state.sessionMode === 'backend');
  return useQuery<T>({ queryKey: key, queryFn, staleTime: 30_000, enabled: backendSession, retry: 1 });
};

export const usePassportSummary = () => usePassportQuery(passportKeys.summary(), passportApi.summary);
export const usePassportBadges = () => usePassportQuery(passportKeys.badges(), passportApi.badges);
export const usePassportStamps = () => usePassportQuery(passportKeys.stamps(), passportApi.stamps);
export const usePassportRewards = () => usePassportQuery(passportKeys.rewards(), passportApi.rewards);
export const usePassportMissions = () => usePassportQuery(passportKeys.missions(), passportApi.missions);
export const usePassportHistory = () => usePassportQuery(passportKeys.history(), passportApi.history);
export const usePassportLeaderboard = () => usePassportQuery(passportKeys.leaderboard(), passportApi.leaderboard);
