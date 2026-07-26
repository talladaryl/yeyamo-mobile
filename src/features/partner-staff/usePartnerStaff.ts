import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { mockStaff, mockStaffUsers } from './mockData';
import { partnerStaffApi } from './partner-staff.api';
import type { StaffMember, StaffRole } from './types';

export const staffKeys = {
  all: ['partner', 'staff'] as const,
  event: (eventId: string) => [...staffKeys.all, 'event', eventId] as const,
  search: (query: string) => [...staffKeys.all, 'search', query] as const,
};
function useDemo() { return useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false); }

export function useEventStaff(eventId: string) {
  const isDemo = useDemo();
  return useQuery({ queryKey: staffKeys.event(eventId), queryFn: () => !isDemo ? partnerStaffApi.list(eventId) : Promise.resolve(mockStaff), enabled: Boolean(eventId) });
}
export function useStaffUserSearch(query: string) {
  const isDemo = useDemo();
  return useQuery({ queryKey: staffKeys.search(query), queryFn: () => !isDemo ? partnerStaffApi.searchUsers(query) : Promise.resolve(mockStaffUsers.filter((user) => `${user.displayName} ${user.username} ${user.contactHint}`.toLowerCase().includes(query.toLowerCase()))), enabled: query.trim().length >= 2 });
}
function useStaffMutation<TInput>(eventId: string, mutationFn: (input: TInput, isDemo: boolean) => Promise<unknown>) {
  const client = useQueryClient(); const isDemo = useDemo();
  return useMutation({ mutationFn: (input: TInput) => mutationFn(input, isDemo), onSuccess: () => client.invalidateQueries({ queryKey: staffKeys.event(eventId) }) });
}
export function useInviteEventStaff(eventId: string) {
  return useStaffMutation(eventId, async ({ userId, role }: { userId: string; role: StaffRole }, isDemo) => {
    if (!isDemo) return partnerStaffApi.invite(eventId, { userId, role });
    const user = mockStaffUsers.find((item) => item.userId === userId); if (!user) throw new Error('Utilisateur introuvable');
    const member: StaffMember = { id: `staff-${Date.now()}`, userId, displayName: user.displayName, username: user.username, avatarUrl: user.avatarUrl, role, status: 'INVITED', permissions: permissionsFor(role) }; mockStaff.push(member); return member;
  });
}
export const useInviteStaff = useInviteEventStaff;
export function useUpdateEventStaffRole(eventId: string) {
  return useStaffMutation(eventId, async ({ memberId, role }: { memberId: string; role: StaffRole }, isDemo) => { if (!isDemo) return partnerStaffApi.updateRole(eventId, memberId, role); const member = mockStaff.find((item) => item.id === memberId); if (!member) throw new Error('Membre introuvable'); member.role = role; member.permissions = permissionsFor(role); return member; });
}
export const useUpdateStaffRole = useUpdateEventStaffRole;
export function useRevokeEventStaff(eventId: string) {
  return useStaffMutation(eventId, async (memberId: string, isDemo) => { if (!isDemo) return partnerStaffApi.revoke(eventId, memberId); const member = mockStaff.find((item) => item.id === memberId); if (member) member.status = 'REVOKED'; });
}
export const useRevokeStaff = useRevokeEventStaff;
export function useResendStaffInvitation(eventId: string) {
  return useStaffMutation(eventId, (memberId: string, isDemo) => !isDemo ? partnerStaffApi.resend(eventId, memberId) : Promise.resolve());
}
function permissionsFor(role: StaffRole) { if (role === 'EVENT_MANAGER') return ['Billetterie', 'Équipe', 'Rapports']; if (role === 'ACCESS_CONTROLLER') return ['Scanner', 'Historique']; if (role === 'CASHIER') return ['Ventes', 'Commandes']; return ['Scanner', 'Équipe terrain']; }
