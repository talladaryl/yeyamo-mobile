import type { CultureFilters } from './culture.types';
export const cultureKeys = {
  all: ['culture'] as const,
  contents: (filters: CultureFilters) => [...cultureKeys.all, 'contents', filters] as const,
  content: (id: string) => [...cultureKeys.all, 'content', id] as const,
  languages: () => [...cultureKeys.all, 'languages'] as const,
  language: (code: string) => [...cultureKeys.all, 'language', code] as const,
  lessons: (code: string) => [...cultureKeys.all, 'lessons', code] as const,
  lesson: (id: string) => [...cultureKeys.all, 'lesson', id] as const,
  progress: (code?: string) => [...cultureKeys.all, 'progress', code ?? 'all'] as const,
  challenges: () => [...cultureKeys.all, 'challenges'] as const,
  challenge: (id: string) => [...cultureKeys.all, 'challenge', id] as const,
};
