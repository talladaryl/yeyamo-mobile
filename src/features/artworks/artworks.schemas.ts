import { z } from 'zod';
export const artworkDraftSchema = z.object({ title: z.string().min(3), countryCode: z.string().length(2), artisanPartnerId: z.string().uuid(), editionType: z.string().min(1), availabilityStatus: z.string().min(1) });
