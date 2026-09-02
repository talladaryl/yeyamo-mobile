import { useMutation } from '@tanstack/react-query';
import { partnerApi, type CreatePartnerInput, type Partner } from './partner.api';

function isNotFound(error: unknown) {
  return typeof error === 'object' && error !== null && 'status' in error && (error as { status?: number }).status === 404;
}

/** Obtains the authenticated user's partner before creating its artisan profile. */
export function useEnsurePartner() {
  return useMutation({
    mutationFn: async (input: CreatePartnerInput): Promise<Partner> => {
      try {
        return await partnerApi.me();
      } catch (error) {
        if (!isNotFound(error)) throw error;
        return partnerApi.create(input);
      }
    },
  });
}
