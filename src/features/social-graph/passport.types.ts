export type PassportSection = 'titles' | 'statistics' | 'timeline' | 'missions' | 'collections' | 'leaderboard' | 'rewards';
export type MissionType = 'daily' | 'weekly' | 'special';

export interface XPHistoryItem { id: string; label: string; date: string; xp: number; icon: string }
export interface TravelerTitle { id: string; name: string; description: string; xpRequired: number; progress: number; unlocked: boolean; icon: string }
export interface RegionDiscovery { id: string; name: string; visited: boolean; cities: number; places: number; color: string }
export interface CountryExploration { code: string; name: string; regionsVisited: number; regionsTotal: number; citiesVisited: number; placesDiscovered: number; regions: RegionDiscovery[] }
export interface TravelStatistic { id: string; label: string; value: number; icon: string; color: string }
export interface TimelineEvent { id: string; type: 'badge' | 'level' | 'title' | 'mission' | 'region' | 'city' | 'reservation' | 'checkin'; title: string; subtitle: string; date: string; icon: string; color: string }
export interface Mission { id: string; type: MissionType; title: string; description: string; progress: number; target: number; xpReward: number; timeLeft: string; icon: string }
export interface PassportCollection { id: string; name: string; current: number; target: number; icon: string; color: string }
export interface LeaderboardEntry { id: string; rank: number; name: string; city: string; xp: number; avatarUrl: string | null; isCurrentUser?: boolean }
export interface PassportReward { id: string; name: string; type: 'badge' | 'title' | 'frame' | 'theme' | 'xp' | 'partner'; description: string; unlocked: boolean; icon: string; color: string }

export interface PassportData {
  currentLevel: number;
  currentTitle: string;
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  nationalRank: number;
  regionalRank: number;
  activeDays: number;
  currentStreak: number;
  bestStreak: number;
  xpHistory: XPHistoryItem[];
  titles: TravelerTitle[];
  exploration: CountryExploration;
  statistics: TravelStatistic[];
  timeline: TimelineEvent[];
  missions: Mission[];
  collections: PassportCollection[];
  leaderboard: LeaderboardEntry[];
  rewards: PassportReward[];
}
