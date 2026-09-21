import { apiPost } from '@/services/api/client';

export type ReportTargetType = 'POST' | 'COMMENT' | 'MEDIA' | 'MESSAGE' | 'STORY' | 'USER' | 'PARTNER' | 'CATALOG_ASSET' | 'EVENT' | 'PLACE' | 'PLACE_SUGGESTION' | 'ARTWORK' | 'ARTISAN' | 'CULTURE_CONTENT' | 'CULTURE_TRANSLATION' | 'LANGUAGE_AUDIO' | 'CULTURE_CHALLENGE_SUBMISSION' | 'AUTHENTICITY_CLAIM' | 'COPYRIGHT_CLAIM';
export type ReportReason = 'SPAM' | 'HARASSMENT' | 'HATE_SPEECH' | 'VIOLENCE' | 'NUDITY' | 'FRAUD' | 'MISINFORMATION' | 'COPYRIGHT' | 'COPYRIGHT_INFRINGEMENT' | 'PLAGIARISM' | 'CULTURAL_MISREPRESENTATION' | 'FALSE_AUTHENTICITY' | 'MISLEADING_HISTORY' | 'SACRED_CONTENT' | 'COMMUNITY_RESTRICTED_CONTENT' | 'PERSONAL_DATA' | 'NO_CONSENT' | 'COUNTERFEIT_ARTWORK' | 'OTHER';

export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
}

export const moderationApi = {
  createReport: (request: CreateReportRequest) => apiPost('/moderation/reports', request),
};
