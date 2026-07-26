import { apiDelete, apiGet, apiPatch, apiPost } from '@/services/api/client';
import type { StaffMember, StaffRole, StaffUserSearchResult } from './types';

export const partnerStaffApi = {
  list: (eventId: string) => apiGet<StaffMember[]>(`/partners/me/events/${eventId}/staff`),
  searchUsers: (query: string) => apiGet<StaffUserSearchResult[]>('/users/search', { params: { query } }),
  invite: (eventId: string, input: { userId: string; role: StaffRole }) => apiPost<StaffMember>(`/partners/me/events/${eventId}/staff/invitations`, input),
  updateRole: (eventId: string, memberId: string, role: StaffRole) => apiPatch<StaffMember>(`/partners/me/events/${eventId}/staff/${memberId}`, { role }),
  revoke: (eventId: string, memberId: string) => apiDelete<void>(`/partners/me/events/${eventId}/staff/${memberId}`),
  resend: (eventId: string, memberId: string) => apiPost<void>(`/partners/me/events/${eventId}/staff/${memberId}/resend`),
};
