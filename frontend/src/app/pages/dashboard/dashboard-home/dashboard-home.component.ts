import { Component, OnInit } from '@angular/core';
import {
  AccessControlService,
  DashboardResource,
  ResourceAction
} from '../../../services/auth/access-control.service';
import { AuthService } from '../../../services/auth/auth.service';
import { CurrentUser, UserRole } from '../../../services/auth/auth.types';
import { ApiService } from '../../../services/api/api.service';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string;
  resource: DashboardResource;
  requiredAction?: ResourceAction;
  queryParams?: { create: string };
  tone: 'blue' | 'violet' | 'green' | 'orange';
}

interface DashboardStats {
  totalStudents: number;
  totalRevenue: string;
  activeCourses: number;
  todaysClasses: number;
  pendingAttendance: number;
}

interface LinkedChild {
  name: string;
  code: string;
}

interface ParentChildrenResponse {
  data?: Record<string, unknown>[];
}

const CREATE = { create: '1' };

const QUICK_ACTIONS_BY_ROLE: Record<UserRole, readonly QuickAction[]> = {
  admin: [
    {
      title: 'Add student',
      description: 'Create a student account and assign it to a teacher.',
      icon: 'bi-person-plus',
      route: '/dashboard/students',
      resource: 'students',
      requiredAction: 'create',
      queryParams: CREATE,
      tone: 'blue'
    },
    {
      title: 'Add teacher',
      description: 'Create a teacher profile for the learning center.',
      icon: 'bi-easel2',
      route: '/dashboard/teachers',
      resource: 'teachers',
      requiredAction: 'create',
      queryParams: CREATE,
      tone: 'violet'
    },
    {
      title: 'Create class',
      description: 'Set up a new class, capacity, and session fee.',
      icon: 'bi-people',
      route: '/dashboard/classes',
      resource: 'classes',
      requiredAction: 'create',
      queryParams: CREATE,
      tone: 'green'
    },
    {
      title: 'Record attendance',
      description: 'Mark attendance for a student in a class.',
      icon: 'bi-clipboard2-check',
      route: '/dashboard/attendance',
      resource: 'attendance',
      requiredAction: 'create',
      queryParams: CREATE,
      tone: 'orange'
    }
  ],
  teacher: [
    {
      title: 'Add student',
      description: 'Enroll a student in one of your classes.',
      icon: 'bi-person-plus',
      route: '/dashboard/students',
      resource: 'students',
      requiredAction: 'create',
      queryParams: CREATE,
      tone: 'blue'
    },
    {
      title: 'Record attendance',
      description: 'Update attendance for your students.',
      icon: 'bi-clipboard2-check',
      route: '/dashboard/attendance',
      resource: 'attendance',
      requiredAction: 'create',
      queryParams: CREATE,
      tone: 'green'
    },
    {
      title: 'Create exam',
      description: 'Plan an exam for one of your classes.',
      icon: 'bi-file-earmark-plus',
      route: '/dashboard/exams',
      resource: 'exams',
      requiredAction: 'create',
      queryParams: CREATE,
      tone: 'violet'
    },
    {
      title: 'Add result',
      description: 'Record a student result for an exam.',
      icon: 'bi-bar-chart-line',
      route: '/dashboard/results',
      resource: 'results',
      requiredAction: 'create',
      queryParams: CREATE,
      tone: 'orange'
    }
  ],
  secretary: [
    {
      title: 'Add student',
      description: 'Register a student for your assigned teacher.',
      icon: 'bi-person-plus',
      route: '/dashboard/students',
      resource: 'students',
      requiredAction: 'create',
      queryParams: CREATE,
      tone: 'blue'
    },
    {
      title: 'Record attendance',
      description: 'Keep class attendance up to date.',
      icon: 'bi-clipboard2-check',
      route: '/dashboard/attendance',
      resource: 'attendance',
      requiredAction: 'create',
      queryParams: CREATE,
      tone: 'green'
    },
    {
      title: 'Register payment',
      description: 'Record a lesson fee or payment received.',
      icon: 'bi-cash-coin',
      route: '/dashboard/payments',
      resource: 'payments',
      requiredAction: 'create',
      queryParams: CREATE,
      tone: 'orange'
    },
    {
      title: 'Manage parents',
      description: 'View parent accounts linked to your students.',
      icon: 'bi-people-fill',
      route: '/dashboard/parents',
      resource: 'parents',
      tone: 'violet'
    }
  ],
  student: [
    {
      title: 'My schedule',
      description: 'See your upcoming classes and times.',
      icon: 'bi-calendar-week',
      route: '/dashboard/schedule',
      resource: 'schedule',
      tone: 'blue'
    },
    {
      title: 'My attendance',
      description: 'Review your attendance history.',
      icon: 'bi-person-check',
      route: '/dashboard/attendance',
      resource: 'attendance',
      tone: 'green'
    },
    {
      title: 'My results',
      description: 'Check your latest exam results.',
      icon: 'bi-bar-chart-line',
      route: '/dashboard/results',
      resource: 'results',
      tone: 'violet'
    },
    {
      title: 'My payments',
      description: 'View your fees and payment status.',
      icon: 'bi-wallet2',
      route: '/dashboard/payments',
      resource: 'payments',
      tone: 'orange'
    }
  ],
  parent: [
    {
      title: "Children's schedule",
      description: "See your children's upcoming classes.",
      icon: 'bi-calendar-week',
      route: '/dashboard/schedule',
      resource: 'schedule',
      tone: 'blue'
    },
    {
      title: "Children's attendance",
      description: "Review attendance for your linked children.",
      icon: 'bi-person-check',
      route: '/dashboard/attendance',
      resource: 'attendance',
      tone: 'green'
    },
    {
      title: "Children's results",
      description: 'Follow recent exam results and progress.',
      icon: 'bi-bar-chart-line',
      route: '/dashboard/results',
      resource: 'results',
      tone: 'violet'
    },
    {
      title: "Children's payments",
      description: 'View fees, balances, and payment status.',
      icon: 'bi-wallet2',
      route: '/dashboard/payments',
      resource: 'payments',
      tone: 'orange'
    }
  ]
};

const ROLE_WELCOME_TEXT: Record<UserRole, string> = {
  admin: 'Here is your learning center at a glance. Manage people, classes, and daily operations from one place.',
  teacher: 'Ready for a productive day? Keep your classes, attendance, exams, and student progress up to date.',
  secretary: 'Keep registrations, attendance, and payments moving smoothly for your assigned learning center.',
  student: 'Stay on top of your classes, attendance, results, and payments.',
  parent: "Follow your children's schedule, attendance, progress, and payments in one place."
};

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  readonly stats: DashboardStats = {
    totalStudents: 0,
    totalRevenue: this.formatCurrency(0),
    activeCourses: 0,
    todaysClasses: 0,
    pendingAttendance: 0
  };

  children: LinkedChild[] = [];
  isAddChildModalOpen = false;
  studentCodeInput = '';
  childLinkError = '';
  childLinkMessage = '';
  isLinkingChild = false;

  private totalGroups = 0;
  private attendedGroupIdsToday = new Set<string>();

  constructor(
    private readonly auth: AuthService,
    private readonly access: AccessControlService,
    private readonly api: ApiService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();

    if (this.isParent) {
      this.loadChildren();
    }
  }

  get currentUser(): CurrentUser | null {
    return this.auth.getCurrentUser();
  }

  get isStaff(): boolean {
    const role = this.access.currentRole;
    return role === 'admin' || role === 'teacher' || role === 'secretary';
  }

  get isTeacherOrAdmin(): boolean {
    const role = this.access.currentRole;
    return role === 'admin' || role === 'teacher';
  }

  get isStudent(): boolean {
    return this.access.currentRole === 'student';
  }

  get isParent(): boolean {
    return this.access.currentRole === 'parent';
  }

  get canTakeAttendance(): boolean {
    return this.access.can('attendance', 'create');
  }

  get welcomeTitle(): string {
    return `${this.greeting}, ${this.displayName}!`;
  }

  get welcomeMessage(): string {
    const role = this.access.currentRole;
    return role ? ROLE_WELCOME_TEXT[role] : 'Welcome to your learning center dashboard.';
  }

  get roleLabel(): string {
    const role = this.access.currentRole;
    return role ? `${role.charAt(0).toUpperCase()}${role.slice(1)}` : 'User';
  }

  get todayLabel(): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }).format(new Date());
  }

  get quickActions(): readonly QuickAction[] {
    const role = this.access.currentRole;
    if (!role) {
      return [];
    }

    return QUICK_ACTIONS_BY_ROLE[role].filter((action) =>
      this.access.can(action.resource, action.requiredAction || 'view')
    );
  }

  openAddChildModal(): void {
    if (!this.isParent) return;

    this.studentCodeInput = '';
    this.childLinkError = '';
    this.childLinkMessage = '';
    this.isAddChildModalOpen = true;
  }

  closeAddChildModal(): void {
    if (this.isLinkingChild) return;

    this.isAddChildModalOpen = false;
    this.studentCodeInput = '';
    this.childLinkError = '';
  }

  addChildByCode(): void {
    if (!this.isParent || this.isLinkingChild) return;

    const studentCode = this.studentCodeInput.trim();
    if (!studentCode) {
      this.childLinkError = 'Enter your child\'s student code.';
      this.childLinkMessage = '';
      return;
    }

    this.isLinkingChild = true;
    this.childLinkError = '';
    this.childLinkMessage = '';

    this.api.post('/parentstudent/link-child', { studentCode }).subscribe({
      next: () => {
        this.isLinkingChild = false;
        this.studentCodeInput = '';
        this.isAddChildModalOpen = false;
        this.childLinkMessage = 'Your child has been linked to this account.';
        this.loadChildren();
      },
      error: (error: { error?: { message?: string } }) => {
        this.isLinkingChild = false;
        this.childLinkError = error.error?.message || 'Could not link this child. Please check the code and try again.';
      }
    });
  }

  private loadDashboardStats(): void {
    this.api.list('/groups').subscribe({
      next: (groups) => {
        this.totalGroups = groups.filter((group) => group['isActive'] !== false).length;
        this.stats.activeCourses = this.totalGroups;
        this.updatePendingAttendance();
      }
    });

    this.api.list('/schedules').subscribe({
      next: (schedules) => {
        this.stats.todaysClasses = schedules.filter((schedule) => this.isScheduledToday(schedule)).length;
      }
    });

    if (!this.isStaff) return;

    this.api.list('/students').subscribe({
      next: (students) => {
        this.stats.totalStudents = students.filter((student) => student['isActive'] !== false).length;
      }
    });

    this.api.list('/attendance/allattendance').subscribe({
      next: (attendance) => {
        this.attendedGroupIdsToday = new Set(
          attendance
            .filter((record) => this.isToday(record['date']))
            .map((record) => this.recordId(record['groupId']))
            .filter((id): id is string => Boolean(id))
        );
        this.updatePendingAttendance();
      }
    });

    if (!this.isTeacherOrAdmin) return;

    this.api.list('/payments').subscribe({
      next: (payments) => {
        const collected = payments.reduce((total, payment) => total + this.toNumber(payment['amountPaid']), 0);
        this.stats.totalRevenue = this.formatCurrency(collected);
      }
    });
  }

  private loadChildren(): void {
    this.api.get<ParentChildrenResponse>('/parentstudent/my-children').subscribe({
      next: (response) => {
        this.children = (response.data || [])
          .map((relation) => this.toLinkedChild(relation))
          .filter((child): child is LinkedChild => child !== null);
      },
      error: () => {
        this.children = [];
      }
    });
  }

  private toLinkedChild(relation: Record<string, unknown>): LinkedChild | null {
    const student = this.asRecord(relation['student']);
    if (!student) return null;

    const user = this.asRecord(student['userId']);
    const name = typeof user?.['name'] === 'string' ? user['name'].trim() : '';
    const code = typeof student['studentCode'] === 'string' ? student['studentCode'].trim() : '';

    return {
      name: name || 'Student',
      code: code || 'Not available'
    };
  }

  private isScheduledToday(schedule: Record<string, unknown>): boolean {
    if (schedule['isActive'] === false) return false;

    if (schedule['type'] === 'weekly') {
      return Number(schedule['dayOfWeek']) === new Date().getDay();
    }

    return schedule['type'] === 'extra' && this.isToday(schedule['specificDate']);
  }

  private isToday(value: unknown): boolean {
    if (typeof value !== 'string' && !(value instanceof Date)) return false;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;

    const today = new Date();
    return date.getFullYear() === today.getFullYear()
      && date.getMonth() === today.getMonth()
      && date.getDate() === today.getDate();
  }

  private updatePendingAttendance(): void {
    this.stats.pendingAttendance = Math.max(0, this.totalGroups - this.attendedGroupIdsToday.size);
  }

  private recordId(value: unknown): string | null {
    if (typeof value === 'string') return value;

    const record = this.asRecord(value);
    const id = record?.['_id'] ?? record?.['id'];
    return typeof id === 'string' ? id : null;
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  }

  private toNumber(value: unknown): number {
    const numberValue = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0
    }).format(value);
  }

  private get displayName(): string {
    const name = this.auth.getCurrentUser()?.name?.trim();
    return name ? name.split(/\s+/)[0] : 'there';
  }

  private get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

}
