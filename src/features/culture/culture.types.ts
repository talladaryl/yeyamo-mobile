import type { SpringPage } from '@/services/api/contracts';

export type CultureContentType = 'WORD' | 'EXPRESSION' | 'PROVERB' | 'STORY' | 'ORAL_HISTORY' | 'TRADITION' | 'HISTORICAL_FIGURE' | 'HISTORICAL_EVENT' | 'RECIPE' | 'DANCE' | 'SONG' | 'SYMBOL';
export type CultureSensitivity = 'PUBLIC' | 'SENSITIVE' | 'SACRED' | string;

export interface CultureContent {
  id: string; type: CultureContentType; slug: string; status: string; visibility: string;
  primaryLanguageCode: string; countryCode: string; adminLevel1Id: string | null; cityId: string | null;
  communityName: string | null; sourceType: string; verificationStatus: string; sensitivityLevel: CultureSensitivity;
  createdAt: string; updatedAt: string; publishedAt: string | null;
}

export interface CultureTranslation { id: string; languageCode: string; title: string; summary: string | null; body: string | null; translatorId: string | null; status: string; createdAt: string; }
export interface CultureContentDetail { content: CultureContent; translations: CultureTranslation[]; }
export interface CultureLanguage { code: string; name: string; nativeName: string; countryCodes: string[]; writingSystem: string | null; status: string; description: string | null; speakerEstimate: number | null; verified: boolean; }
export interface LanguageLesson { id: string; languageCode: string; topicId: string | null; title: string; description: string | null; difficulty: number; estimatedMinutes: number; status: string; displayOrder: number; }
export interface LessonItem { id: string; phrase: string; translation: string; transcription: string | null; phonetic: string | null; audioMediaId: string | null; imageMediaId: string | null; culturalContext: string | null; difficulty: number; examples: string | null; displayOrder: number; }
export interface LessonExercise { id: string; type: string; prompt: string; optionsJson: string | null; displayOrder: number; }
export interface LessonDetail { lesson: LanguageLesson; items: LessonItem[]; exercises: LessonExercise[]; }
export interface LanguageProgress { id: string; userId: string; languageCode: string; lessonId: string; startedAt: string | null; completedAt: string | null; score: number | null; attemptCount: number; }
export interface CultureChallenge { id: string; title: string; description: string; type: string; countryCode: string; languageCode: string | null; startsAt: string; endsAt: string; status: string; rewardDefinitionId: string | null; moderationRequired: boolean; prompts: string[]; }
export interface CultureRelation { sourceId: string; sourceLabel: string; targetId: string; targetLabel: string; relationType: string; }
export interface CultureFilters { type?: CultureContentType; countryCode?: string; adminLevel1Id?: string; cityId?: string; languageCode?: string; community?: string; verified?: boolean; search?: string; page?: number; size?: number; }
export type CulturePage<T> = SpringPage<T>;

export interface CultureContributionInput {
  type: CultureContentType; slug: string; primaryLanguageCode: string; countryCode: string;
  adminLevel1Id?: string; cityId?: string; communityName?: string; sourceType: string; sensitivityLevel: string;
  title: string; summary?: string; body?: string;
}
