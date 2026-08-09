import { z } from 'zod';
export const cultureContributionSchema = z.object({
  type: z.string().min(1), slug: z.string().min(3).max(220), primaryLanguageCode: z.string().min(2), countryCode: z.string().length(2),
  sourceType: z.string().min(1), sensitivityLevel: z.string().min(1), title: z.string().min(3), summary: z.string().optional(), body: z.string().optional(),
});
