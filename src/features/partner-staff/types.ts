export type StaffRole = 'EVENT_MANAGER' | 'ACCESS_CONTROLLER' | 'CASHIER' | 'SUPERVISOR';
export type StaffStatus = 'ACTIVE' | 'INVITED' | 'REVOKED';
export type PartnerPermission =
  | 'partner:profile-manage' | 'partner:place-manage' | 'partner:event-manage'
  | 'partner:campaign-manage' | 'partner:campaign-view' | 'partner:ticket-manage'
  | 'partner:ticket-view' | 'partner:ticket-scan' | 'partner:staff-manage'
  | 'partner:analytics-view' | 'partner:finance-view';

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

export interface PartnerMembership {
  id: string; partnerId: string; userId: string; roleId: string; status: string;
  invitedBy: string; invitedAt: string; acceptedAt: string | null;
  revokedAt: string | null; version: number;
}
export interface PartnerRole {
  id: string; partnerId: string; code: string; name: string; systemRole: boolean;
  /** Backend serializes this entity field as a comma-separated string. */
  permissions: string; createdAt: string; updatedAt: string;
}
export interface PartnerInvitation {
  id: string; partnerId: string; contact: string; roleId: string;
  /** Present on the raw entity response; must never be displayed or persisted client-side. */
  tokenHash: string; expiresAt: string; status: string; invitedBy: string;
  createdAt: string; acceptedAt: string | null;
}
export interface CreatePartnerRoleRequest { code: string; name: string; permissions: PartnerPermission[] }
export interface InvitePartnerStaffRequest { contact: string; roleId: string }
export interface AcceptPartnerInvitationRequest { token: string }

export interface EventStaffAssignment {
  id: string;
  eventId: string;
  partnerId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: StaffRole;
  status: StaffAssignmentStatus;
  validFrom: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}
export type StaffAssignmentStatus = 'PENDING' | 'ACTIVE' | 'REVOKED' | 'EXPIRED' | string;

export interface InviteEventStaffRequest { contact: string; roleId: string }
export interface PartnerInvitationResult { id: string; token: string; expiresAt: string }
export interface UpdateEventStaffRoleRequest { role: StaffRole }
export interface AssignEventStaffRequest {
  eventId: string;
  userId: string;
  role: StaffRole;
  validFrom: string;
  validUntil: string;
}
