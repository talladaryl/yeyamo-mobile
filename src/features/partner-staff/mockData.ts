import type { StaffMember, StaffUserSearchResult } from './types';

export const mockStaff: StaffMember[] = [
  { id: 'staff-1', userId: 'user-21', displayName: 'Aline M.', username: 'aline.events', avatarUrl: 'https://i.pravatar.cc/150?img=32', role: 'EVENT_MANAGER', status: 'ACTIVE', permissions: ['Billetterie', 'Équipe', 'Rapports'] },
  { id: 'staff-2', userId: 'user-22', displayName: 'Brice T.', username: 'brice237', avatarUrl: 'https://i.pravatar.cc/150?img=12', role: 'ACCESS_CONTROLLER', status: 'ACTIVE', permissions: ['Scanner', 'Historique'] },
  { id: 'staff-3', userId: 'user-23', displayName: 'Nadia F.', username: 'nadia.f', avatarUrl: null, role: 'SUPERVISOR', status: 'INVITED', permissions: ['Scanner', 'Équipe terrain'] },
];

export const mockStaffUsers: StaffUserSearchResult[] = [
  { userId: 'user-31', displayName: 'Carole N.', username: 'carole.n', avatarUrl: 'https://i.pravatar.cc/150?img=47', contactHint: 'ca•••@email.com' },
  { userId: 'user-32', displayName: 'David E.', username: 'david.event', avatarUrl: null, contactHint: '+237 ••• •• 41' },
];
