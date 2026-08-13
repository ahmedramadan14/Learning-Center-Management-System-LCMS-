import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { normalizeUserRole, UserRole } from './auth.types';

export type DashboardResource =
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'courses'
  | 'classes'
  | 'grades'
  | 'schedule'
  | 'parents'
  | 'secretaries'
  | 'attendance'
  | 'exams'
  | 'payments'
  | 'results'
  | 'notifications'
  | 'profile'
  | 'settings';

export type ResourceAction = 'view' | 'create' | 'update' | 'delete';

export interface ResourceAccess {
  view: readonly UserRole[];
  create?: readonly UserRole[];
  update?: readonly UserRole[];
  delete?: readonly UserRole[];
}

const ALL_AUTHENTICATED_ROLES: readonly UserRole[] = [
  'admin',
  'teacher',
  'secretary',
  'student',
  'parent'
];

const ADMIN_ROLES: readonly UserRole[] = ['admin'];
const STAFF_ROLES: readonly UserRole[] = ['admin', 'teacher', 'secretary'];
const ADMIN_AND_TEACHER: readonly UserRole[] = ['admin', 'teacher'];
const ADMIN_AND_SECRETARY: readonly UserRole[] = ['admin', 'secretary'];
const ADMIN_SECRETARY_AND_PARENT: readonly UserRole[] = ['admin', 'secretary', 'parent'];

/**
 * Frontend visibility and action policy.
 *
 * - Admin can access every dashboard resource.
 * - Teacher and secretary can access only their respective staff resources.
 * - Student and parent have read-only access to the learner-facing resources.
 *
 * The API remains the source of truth for authorization and for filtering each
 * user's records to their own class, student, or child relationship.
 */
export const RESOURCE_ACCESS: Record<DashboardResource, ResourceAccess> = {
  dashboard: { view: ALL_AUTHENTICATED_ROLES },
  students: { view: STAFF_ROLES, create: STAFF_ROLES, update: STAFF_ROLES, delete: STAFF_ROLES },
  teachers: { view: ADMIN_ROLES, create: ADMIN_ROLES, update: ADMIN_AND_TEACHER, delete: ADMIN_ROLES },
  courses: { view: ALL_AUTHENTICATED_ROLES, create: STAFF_ROLES, update: STAFF_ROLES, delete: ADMIN_ROLES },
  classes: {
    view: ALL_AUTHENTICATED_ROLES,
    create: STAFF_ROLES,
    update: STAFF_ROLES,
    delete: STAFF_ROLES
  },
  grades: {
    view: ALL_AUTHENTICATED_ROLES,
    create: ADMIN_AND_TEACHER,
    update: ADMIN_AND_TEACHER,
    delete: ADMIN_AND_TEACHER
  },
  schedule: { view: ALL_AUTHENTICATED_ROLES, create: STAFF_ROLES, update: STAFF_ROLES, delete: STAFF_ROLES },
  parents: {
    view: ADMIN_AND_SECRETARY,
    create: ADMIN_AND_SECRETARY,
    update: ADMIN_SECRETARY_AND_PARENT,
    delete: ADMIN_AND_SECRETARY
  },
  secretaries: {
    view: ADMIN_AND_TEACHER,
    create: ADMIN_AND_TEACHER,
    update: ADMIN_AND_TEACHER,
    delete: ADMIN_AND_TEACHER
  },
  attendance: { view: ALL_AUTHENTICATED_ROLES, create: STAFF_ROLES, update: STAFF_ROLES, delete: STAFF_ROLES },
  exams: { view: ALL_AUTHENTICATED_ROLES, create: STAFF_ROLES, update: STAFF_ROLES, delete: STAFF_ROLES },
  payments: { view: ALL_AUTHENTICATED_ROLES, create: STAFF_ROLES, update: STAFF_ROLES },
  results: { view: ALL_AUTHENTICATED_ROLES, create: STAFF_ROLES, update: STAFF_ROLES, delete: STAFF_ROLES },
  notifications: {
    view: ALL_AUTHENTICATED_ROLES,
    create: STAFF_ROLES,
    update: ADMIN_ROLES,
    delete: ADMIN_ROLES
  },
  profile: { view: ALL_AUTHENTICATED_ROLES },
  settings: { view: ALL_AUTHENTICATED_ROLES }
};

const RESOURCE_LABELS: Record<DashboardResource, string> = {
  dashboard: 'Dashboard',
  students: 'Students',
  teachers: 'Teachers',
  courses: 'Courses',
  classes: 'Classes',
  grades: 'Grades',
  schedule: 'Schedule',
  parents: 'Parents',
  secretaries: 'Secretaries',
  attendance: 'Attendance',
  exams: 'Exams',
  payments: 'Payments',
  results: 'Results',
  notifications: 'Notifications',
  profile: 'My profile',
  settings: 'Settings'
};

export function isDashboardResource(value: unknown): value is DashboardResource {
  return typeof value === 'string' && value in RESOURCE_ACCESS;
}

@Injectable({ providedIn: 'root' })
export class AccessControlService {
  constructor(private readonly auth: AuthService) {}

  get currentRole(): UserRole | null {
    return normalizeUserRole(this.auth.getCurrentUser()?.role);
  }

  can(resource: DashboardResource, action: ResourceAction = 'view'): boolean {
    const role = this.currentRole;
    const roles = RESOURCE_ACCESS[resource][action];

    return Boolean(role && roles?.includes(role));
  }

  canView(resource: DashboardResource): boolean {
    return this.can(resource, 'view');
  }

  accessibleResources(): DashboardResource[] {
    return (Object.keys(RESOURCE_ACCESS) as DashboardResource[])
      .filter((resource) => this.canView(resource));
  }

  permissionLabels(): string[] {
    return this.accessibleResources()
      .filter((resource) => resource !== 'dashboard' && resource !== 'settings')
      .map((resource) => `View ${RESOURCE_LABELS[resource]}`);
  }
}
