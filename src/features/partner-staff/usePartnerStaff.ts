import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePartnerProfile } from '@/features/partner-dashboard/usePartnerDashboard';
import { partnerStaffApi } from './partner-staff.api';
import type {
  AssignEventStaffRequest,
  InviteEventStaffRequest,
  StaffRole,
} from './types';
import { FEATURE_FLAGS } from '@/config/featureFlags';

export const staffKeys = {
  all: ['partner', 'staff'] as const,
  event: (eventId: string) => [...staffKeys.all, 'event', eventId] as const,
};

function useEventStaffContext(eventId: string) {
  const profile = usePartnerProfile();
  return { partnerId: profile.data?.id, enabled: Boolean(eventId && profile.data?.id) };
}

export function useEventStaff(eventId: string) {
  const context = useEventStaffContext(eventId);
  return useQuery({
    queryKey: staffKeys.event(eventId),
    queryFn: () => partnerStaffApi.getEventStaff(context.partnerId!, eventId),
    enabled: FEATURE_FLAGS.event_staff_enabled && context.enabled,
  });
}

function useEventStaffMutation<TInput, TResult>(
  eventId: string,
  mutation: (partnerId: string, input: TInput) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  const context = useEventStaffContext(eventId);
  return useMutation({
    mutationFn: (input: TInput) => {
      if (!FEATURE_FLAGS.event_staff_enabled) throw { code: 'FEATURE_DISABLED', message: 'La gestion du personnel est désactivée.' };
      if (!context.partnerId) throw { code: 'PARTNER_PROFILE_UNAVAILABLE', message: 'Profil partenaire indisponible' };
      return mutation(context.partnerId, input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.event(eventId), exact: true }),
  });
}

export function useInviteEventStaff(eventId: string) {
  return useEventStaffMutation(eventId, (partnerId, payload: InviteEventStaffRequest) =>
    partnerStaffApi.inviteEventStaff(partnerId, eventId, payload));
}

export function useAssignEventStaff(eventId: string) {
  return useEventStaffMutation(eventId, (partnerId, payload: Omit<AssignEventStaffRequest, 'eventId'>) =>
    partnerStaffApi.assignEventStaff(partnerId, eventId, payload));
}

export function useUpdateEventStaffRole(eventId: string) {
  return useEventStaffMutation(
    eventId,
    (partnerId, input: { assignmentId: string; role: StaffRole }) =>
      partnerStaffApi.updateEventStaffRole(partnerId, eventId, input.assignmentId, { role: input.role }),
  );
}

export function useRevokeEventStaff(eventId: string) {
  return useEventStaffMutation(eventId, (partnerId, assignmentId: string) =>
    partnerStaffApi.revokeEventStaff(partnerId, eventId, assignmentId));
}

export function useResendStaffInvitation(eventId: string) {
  return useEventStaffMutation(eventId, (partnerId, invitationId: string) =>
    partnerStaffApi.resendStaffInvitation(partnerId, invitationId));
}

export const useInviteStaff = useInviteEventStaff;
export const useUpdateStaffRole = useUpdateEventStaffRole;
export const useRevokeStaff = useRevokeEventStaff;
