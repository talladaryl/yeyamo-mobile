import { apiGet, apiPost, apiPut } from '@/services/api/client';
import type { SpringPage } from '@/services/api/contracts';
import type { CultureChallenge, CultureContent, CultureContentDetail, CultureContributionInput, CultureFilters, CultureLanguage, CulturePage, CultureRelation, CultureTranslation, LanguageLesson, LanguageProgress, LessonDetail } from './culture.types';

function query<T extends object>(filters: T) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}

export const cultureApi = {
  listContents: (filters: CultureFilters): Promise<CulturePage<CultureContent>> => apiGet<SpringPage<CultureContent>>('/culture/contents', { params: query(filters) }),
  getContent: async (id: string): Promise<CultureContentDetail> => {
    const [content, translations] = await Promise.all([apiGet<CultureContent>(`/culture/contents/${id}`), apiGet<CultureTranslation[]>(`/culture/contents/${id}/translations`)]);
    return { content, translations };
  },
  dailyWord: (countryCode: string, languageCode?: string | null) => apiGet<CultureContent>('/culture/daily-word', { params: query({ countryCode, languageCode }) }),
  daily: (page = 0, size = 10) => apiGet<SpringPage<CultureContent>>('/culture/daily', { params: { page, size } }),
  trending: (page = 0, size = 20) => apiGet<SpringPage<CultureContent>>('/culture/trending', { params: { page, size } }),
  categories: () => apiGet<string[]>('/culture/categories'),
  languages: () => apiGet<CultureLanguage[]>('/culture/languages'),
  language: (code: string) => apiGet<CultureLanguage>(`/culture/languages/${encodeURIComponent(code)}`),
  languageContent: (code: string, page = 0, size = 20) => apiGet<SpringPage<CultureContent>>(`/culture/languages/${encodeURIComponent(code)}/content`, { params: { page, size } }),
  lessons: (code: string) => apiGet<LanguageLesson[]>(`/culture/languages/${encodeURIComponent(code)}/lessons`),
  lesson: (id: string) => apiGet<LessonDetail>(`/culture/language-lessons/${id}`),
  startLesson: (id: string) => apiPost<LanguageProgress>(`/culture/language-lessons/${id}/start`),
  submitAttempt: (id: string, input: { exerciseId: string; answerText?: string; mediaId?: string }) => apiPost<{ attemptId: string; correct: boolean | null; manualReviewRequired: boolean }>(`/culture/language-lessons/${id}/attempts`, input),
  completeLesson: (id: string, score: number, idempotencyKey: string) => apiPost<LanguageProgress>(`/culture/language-lessons/${id}/complete`, { score, idempotencyKey }),
  progress: (languageCode?: string) => apiGet<LanguageProgress[]>(languageCode ? `/culture/language-progress/me/${encodeURIComponent(languageCode)}` : '/culture/language-progress/me'),
  challenges: (page = 0, size = 20) => apiGet<SpringPage<CultureChallenge>>('/culture/challenges', { params: { page, size } }),
  challenge: (id: string) => apiGet<CultureChallenge>(`/culture/challenges/${id}`),
  joinChallenge: (id: string) => apiPost(`/culture/challenges/${id}/join`),
  submitChallenge: (id: string, input: Record<string, unknown>) => apiPost(`/culture/challenges/${id}/submissions`, input),
  createContribution: (input: CultureContributionInput) => apiPost<CultureContent>('/culture/contributions', {
    type: input.type, slug: input.slug, primaryLanguageCode: input.primaryLanguageCode, countryCode: input.countryCode,
    adminLevel1Id: input.adminLevel1Id, cityId: input.cityId, communityName: input.communityName,
    contributorType: 'USER', sourceType: input.sourceType, sensitivityLevel: input.sensitivityLevel, visibility: 'PUBLIC',
    translation: { languageCode: input.primaryLanguageCode, title: input.title, summary: input.summary, body: input.body },
    recipeDetails: input.recipeDetails,
    proverbDetails: input.proverbDetails,
  }),
  updateContribution: (id: string, input: CultureContributionInput) => apiPut<CultureContent>(`/culture/contributions/${id}`, {
    type: input.type, slug: input.slug, primaryLanguageCode: input.primaryLanguageCode, countryCode: input.countryCode,
    adminLevel1Id: input.adminLevel1Id, cityId: input.cityId, communityName: input.communityName,
    contributorType: 'USER', sourceType: input.sourceType, sensitivityLevel: input.sensitivityLevel, visibility: 'PUBLIC',
    translation: { languageCode: input.primaryLanguageCode, title: input.title, summary: input.summary, body: input.body },
    recipeDetails: input.recipeDetails,
    proverbDetails: input.proverbDetails,
  }),
  submitContribution: (id: string) => apiPost<CultureContent>(`/culture/contributions/${id}/submit`),
  myContributions: (page = 0, size = 20) => apiGet<SpringPage<CultureContent>>('/culture/contributions/me', { params: { page, size } }),
  myChallenges: () => apiGet<Array<{ challengeId: string; joinedAt: string; completedAt: string | null }>>('/culture/challenges/me'),
  relatedCulture: (id: string) => apiGet<CultureRelation[]>(`/culture-graph/cultures/${id}/explore`),
  relatedLanguage: (code: string) => apiGet<CultureRelation[]>(`/culture-graph/languages/${encodeURIComponent(code)}/related`),
  discover: (countryCode?: string | null, languageCode?: string | null) => apiGet<CultureRelation[]>('/culture-graph/discover', { params: query({ countryCode, languageCode }) }),
};
