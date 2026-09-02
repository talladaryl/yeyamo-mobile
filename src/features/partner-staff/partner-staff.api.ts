import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/client';
import type {
  AssignEventStaffRequest,
  EventStaffAssignment,
  InviteEventStaffRequest,
  PartnerInvitationResult,
  UpdateEventStaffRoleRequest,
} from './types';

export class StaffInvitationResendUnavailableError extends Error {
  constructor() {
    super("Le backend n'expose pas encore de route de renvoi d'invitation.");
    this.name = 'StaffInvitationResendUnavailableError';
  }
}

export const partnerStaffApi = {
  getEventStaff: (partnerId: string, eventId: string) =>
    apiGet<EventStaffAssignment[]>(`/partners/${partnerId}/tickets/events/${eventId}/staff`),

  inviteEventStaff: (partnerId: string, _eventId: string, payload: InviteEventStaffRequest) =>
    apiPost<PartnerInvitationResult>(`/partners/${partnerId}/staff/invitations`, payload),

  assignEventStaff: (partnerId: string, eventId: string, payload: Omit<AssignEventStaffRequest, 'eventId'>) =>
    apiPost<EventStaffAssignment>(`/partners/${partnerId}/tickets/staff`, { ...payload, eventId }),

  updateEventStaffRole: (
    partnerId: string,
    eventId: string,
    assignmentId: string,
    payload: UpdateEventStaffRoleRequest,
  ) => apiPut<EventStaffAssignment>(
    `/partners/${partnerId}/tickets/events/${eventId}/staff/${assignmentId}/role`,
    payload,
  ),

  revokeEventStaff: (partnerId: string, eventId: string, assignmentId: string) =>
    apiDelete<void>(`/partners/${partnerId}/tickets/events/${eventId}/staff/${assignmentId}`),

  resendStaffInvitation: async (_partnerId: string, _invitationId: string): Promise<never> => {
    throw new StaffInvitationResendUnavailableError();
  },
};
