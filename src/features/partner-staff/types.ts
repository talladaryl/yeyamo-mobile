export type StaffRole = 'EVENT_MANAGER' | 'ACCESS_CONTROLLER' | 'CASHIER' | 'SUPERVISOR';
export type StaffStatus = 'ACTIVE' | 'INVITED' | 'REVOKED';

export interface StaffMember {
  id: string;
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  role: StaffRole;
  status: StaffStatus;
  permissions: string[];
}

export interface StaffUserSearchResult {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  contactHint: string;
}
