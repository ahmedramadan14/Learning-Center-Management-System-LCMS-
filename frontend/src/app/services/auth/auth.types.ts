export const USER_ROLES = ['admin', 'teacher', 'secretary', 'student', 'parent'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface CurrentUser {
  _id?: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  profileImage?: string;
  isActive?: boolean;
  isApproved?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function normalizeUserRole(role: unknown): UserRole | null {
  if (typeof role !== 'string') return null;

  const normalized = role.trim().toLowerCase();
  return USER_ROLES.includes(normalized as UserRole) ? normalized as UserRole : null;
}
