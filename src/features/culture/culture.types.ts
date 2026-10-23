import type { SpringPage } from '@/services/api/contracts';

export type CultureContentType = 'WORD' | 'EXPRESSION' | 'PROVERB' | 'STORY' | 'ORAL_HISTORY' | 'TRADITION' | 'HISTORICAL_FIGURE' | 'HISTORICAL_EVENT' | 'RECIPE' | 'DANCE' | 'SONG' | 'SYMBOL';
export type CultureSensitivity = 'PUBLIC' | 'SENSITIVE' | 'SACRED' | string;

export type RecipeDifficultyCode = 'SIMPLE' | 'INTERMEDIAIRE' | 'AVANCE';
export type RecipeQuantityUnitCode = 'G' | 'KG' | 'ML' | 'L' | 'UNIT' | 'TSP' | 'TBSP';
export type RecipeTemperatureUnit = 'C' | 'F';
export interface CultureRecipeIngredient { id?: string; name: string; quantity: string | null; unit: string | null; groupName?: string | null; optional?: boolean; substitutionNotes?: string | null; quantityValue?: number | null; quantityMaxValue?: number | null; quantityUnitCode?: RecipeQuantityUnitCode | null; }
export interface CultureRecipeStep { id?: string; title?: string | null; instruction: string; durationMinutes?: number | null; temperatureValue?: number | null; temperatureUnit?: RecipeTemperatureUnit | null; expectedResult?: string | null; tip?: string | null; safetyNote?: string | null; mediaId?: string | null; ingredientIds?: string[]; }
export interface CultureRecipeEquipment { id?: string; name: string; optional?: boolean; }
export interface CultureRecipeMedia { id?: string; mediaId: string; role: 'GALLERY' | 'RESULT' | 'PROCESS'; caption?: string | null; altText?: string | null; }
export interface CultureRecipeDetails {
  ingredients: CultureRecipeIngredient[];
  steps: CultureRecipeStep[];
  prepTimeMinutes: number | null;
  servings: number | null;
  // Additive frontend compatibility for the proposed backend contract. These
  // fields remain optional and are never fabricated for real accounts.
  cookTimeMinutes?: number | null; restTimeMinutes?: number | null; difficulty?: RecipeDifficultyCode | null; yieldText?: string | null;
  heroMediaId?: string | null; videoMediaId?: string | null; youtubeVideoUrl?: string | null; equipment?: CultureRecipeEquipment[]; gallery?: CultureRecipeMedia[]; preparationAhead?: string | null;
  tips?: string | null; variants?: string | null; accompaniments?: string | null; plating?: string | null; storage?: string | null; reheating?: string | null; safetyNotes?: string | null;
}
export interface CultureProverbDetails {
  literalTranslation: string | null;
  meaning: string | null;
  originLanguageCode: string | null;
  audioUrl: string | null;
}

export interface CultureContent {
  id: string; type: CultureContentType; slug: string; status: string; visibility: string;
  primaryLanguageCode: string; countryCode: string; adminLevel1Id: string | null; cityId: string | null;
  communityName: string | null; sourceType: string; verificationStatus: string; sensitivityLevel: CultureSensitivity;
  createdAt: string; updatedAt: string; publishedAt: string | null; version?: number;
  recipeRevision?: { id: string; status: string; baseVersion: number; createdAt: string; submittedAt: string | null; decidedAt: string | null; rejectionReason: string | null } | null;
  recipeDetails?: CultureRecipeDetails | null;
  proverbDetails?: CultureProverbDetails | null;
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
  recipeDetails?: CultureRecipeDetails;
  proverbDetails?: CultureProverbDetails;
}
