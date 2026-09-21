import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { moderationApi, type CreateReportRequest } from './moderation.api';

/** Reporter and target owner identities are derived on the backend from JWT and
 * target resolution; the mobile body contains only the canonical fields. */
export function useCreateModerationReport() {
  const demo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({
    mutationFn: (request: CreateReportRequest) => demo ? Promise.resolve(undefined) : moderationApi.createReport(request),
  });
}
