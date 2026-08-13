import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../services/api/api.service';
import {
  AccessControlService,
  DashboardResource,
  isDashboardResource
} from '../../../services/auth/access-control.service';

interface Field {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: readonly string[];
  /** Value used when a new record form is opened. */
  defaultValue?: string | number | boolean;
  /** Path in a list response used to prefill an update form. */
  source?: string;
}

interface UpdateConfig {
  method: 'patch' | 'put';
  /** Defaults to the list path. Use this for APIs such as /attendance/update/:id. */
  path?: string;
  fields: readonly Field[];
}

interface Config {
  title: string;
  icon: string;
  description: string;
  path: string;
  create?: string;
  update?: UpdateConfig;
  /** Base API path for publishing a draft record. */
  publishPath?: string;
  deletePath?: string;
  idKey?: string;
  fields: readonly Field[];
  columns: readonly string[];
  remove?: boolean;
}

const studentUpdateFields: readonly Field[] = [
  { key: 'name', source: 'userId.name', label: 'Full name', required: true },
  { key: 'phone', source: 'userId.phone', label: 'Phone', required: true },
  { key: 'parentPhone', label: 'Parent phone', required: true },
  { key: 'gender', label: 'Gender', type: 'select', required: true, options: ['male', 'female'] },
  { key: 'grade', label: 'Grade', required: true }
];

const teacherUpdateFields: readonly Field[] = [
  { key: 'subject', label: 'Subject' },
  { key: 'description', label: 'Description', type: 'textarea' }
];

const courseFields: readonly Field[] = [
  { key: 'name', label: 'Course name', required: true },
  { key: 'code', label: 'Course code' },
  { key: 'duration', label: 'Duration (hours)', type: 'number' },
  { key: 'description', label: 'Description', type: 'textarea' }
];

const classUpdateFields: readonly Field[] = [
  { key: 'groupName', label: 'Class name', required: true },
  { key: 'gradeLevelId', label: 'Grade', type: 'grade-select', required: true },
  { key: 'maxCapacity', label: 'Capacity', type: 'number' },
  { key: 'sessionPrice', label: 'Session price', type: 'number', required: true },
  { key: 'sessionsPerCycle', label: 'Sessions per cycle', type: 'number' }
];

const gradeFields: readonly Field[] = [
  { key: 'name', label: 'Grade name', required: true },
  { key: 'isActive', label: 'Status', type: 'select', options: ['true', 'false'] }
];

const scheduleFields: readonly Field[] = [
  { key: 'groupId', label: 'Class', type: 'group-select', required: true },
  { key: 'type', label: 'Type', type: 'select', required: true, options: ['weekly', 'extra'] },
  { key: 'dayOfWeek', label: 'Day of week (0–6)', type: 'number' },
  { key: 'specificDate', label: 'Specific date', type: 'date' },
  { key: 'startTime', label: 'Start time', type: 'time', required: true },
  { key: 'endTime', label: 'End time', type: 'time', required: true }
];

const examFields: readonly Field[] = [
  { key: 'title', label: 'Exam title', required: true },
  { key: 'description', label: 'Description or instructions', type: 'textarea' },
  { key: 'group', label: 'Class', type: 'group-select', required: true },
  { key: 'examDate', label: 'Exam date', type: 'date', required: true },
  { key: 'totalMarks', label: 'Total marks', type: 'number', required: true, defaultValue: 100 },
  { key: 'passingMarks', label: 'Passing marks', type: 'number', required: true, defaultValue: 50 },
  { key: 'duration', label: 'Duration (minutes)', type: 'number', required: true, defaultValue: 60 }
];

const secretaryUpdateFields: readonly Field[] = [
  { key: 'name', source: 'userId.name', label: 'Full name' },
  { key: 'email', source: 'userId.email', label: 'Email', type: 'email' },
  { key: 'phone', source: 'userId.phone', label: 'Phone' },
  { key: 'department', label: 'Department' }
];

const pages: Record<string, Config> = {
  students: {
    title: 'Students',
    icon: 'bi-people',
    description: 'Manage student records, levels and contact details.',
    path: '/students',
    create: '/students',
    update: { method: 'patch', fields: studentUpdateFields },
    deletePath: '/students',
    idKey: 'studentCode',
    remove: true,
    columns: ['userId.name', 'studentCode', 'grade', 'groups', 'userId.phone', 'isActive', 'createdAt'],
    fields: [
      { key: 'name', label: 'Full name', required: true },
      { key: 'phone', label: 'Phone', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
      { key: 'parentPhone', label: 'Parent phone', required: true },
      { key: 'gender', label: 'Gender', type: 'select', required: true, options: ['male', 'female'] },
      { key: 'grade', label: 'Grade', required: true },
      { key: 'groupId', label: 'Class', type: 'group-select' }
    ]
  },
  teachers: {
    title: 'Teachers',
    icon: 'bi-person-workspace',
    description: 'Manage Teachers and their teaching subjects.',
    path: '/teachers',
    create: '/teachers',
    update: { method: 'patch', fields: teacherUpdateFields },
    // DELETE /teachers/:id deactivates the teacher account instead of removing it.
    remove: true,
    columns: ['userId.name', 'subject', 'userId.phone', 'userId.approvalStatus', 'isActive', 'createdAt'],
    fields: [
      { key: 'name', label: 'Full name', required: true },
      { key: 'phone', label: 'Phone', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
      { key: 'subject', label: 'Subject' },
      { key: 'description', label: 'Description', type: 'textarea' }
    ]
  },
  courses: {
    title: 'Courses',
    icon: 'bi-journal-bookmark',
    description: 'Create and organize courses for your center.',
    path: '/courses',
    create: '/courses',
    update: { method: 'patch', fields: courseFields },
    remove: true,
    columns: ['name', 'code', 'duration', 'isActive', 'createdAt'],
    fields: courseFields
  },
  classes: {
    title: 'Classes',
    icon: 'bi-easel2',
    description: 'Manage groups, capacity and instructor assignments.',
    path: '/groups',
    create: '/groups',
    update: { method: 'put', fields: classUpdateFields },
    remove: true,
    columns: ['groupName', 'gradeLevelId.name', 'teacherId.userId.name', 'maxCapacity', 'sessionPrice', 'isActive'],
    fields: [
      { key: 'groupName', label: 'Class name', required: true },
      { key: 'gradeLevelId', label: 'Grade', type: 'grade-select', required: true },
      { key: 'teacherId', label: 'Teacher', type: 'teacher-select', required: true },
      { key: 'maxCapacity', label: 'Capacity', type: 'number' },
      { key: 'sessionPrice', label: 'Session price', type: 'number', required: true },
      { key: 'sessionsPerCycle', label: 'Sessions per cycle', type: 'number' }
    ]
  },
  grades: {
    title: 'Grades',
    icon: 'bi-mortarboard',
    description: 'Manage the grade levels available in your learning center.',
    path: '/grades',
    create: '/grades',
    update: { method: 'put', fields: gradeFields },
    deletePath: '/grades',
    remove: true,
    columns: ['name', 'isActive', 'createdAt', 'updatedAt'],
    fields: gradeFields
  },
  schedule: {
    title: 'Schedule',
    icon: 'bi-calendar-week',
    description: 'Manage weekly and extra class schedules.',
    path: '/schedules',
    create: '/schedules',
    update: { method: 'put', fields: scheduleFields },
    remove: true,
    columns: ['groupId.groupName', 'type', 'dayOfWeek', 'specificDate', 'startTime', 'endTime'],
    fields: scheduleFields
  },
  exams: {
    title: 'Exams',
    icon: 'bi-clipboard2-check',
    description: 'Create exam drafts, publish them when ready, then record student results.',
    path: '/exams',
    create: '/exams',
    update: {
      method: 'put',
      fields: examFields
    },
    publishPath: '/exams',
    remove: true,
    columns: ['title', 'group.groupName', 'examDate', 'totalMarks', 'passingMarks', 'duration', 'status'],
    fields: examFields
  },
  attendance: {
    title: 'Attendance',
    icon: 'bi-calendar2-check',
    description: 'Record and review class attendance.',
    path: '/attendance/allattendance',
    create: '/attendance/create',
    update: {
      method: 'put',
      path: '/attendance/update',
      fields: [
        { key: 'status', label: 'Status', type: 'select', required: true, options: ['Present', 'Absent', 'Late', 'Excused'] },
        { key: 'method', label: 'Method', type: 'select', options: ['Manual', 'QR', 'NFC', 'Barcode'] }
      ]
    },
    deletePath: '/attendance',
    remove: true,
    columns: ['studentId.userId.name', 'groupId.groupName', 'date', 'status', 'method'],
    fields: [
      { key: 'studentCode', label: 'Student code', required: true },
      { key: 'groupId', label: 'Class', type: 'group-select', required: true },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', required: true, options: ['Present', 'Absent', 'Late', 'Excused'] },
      { key: 'method', label: 'Method', type: 'select', options: ['Manual', 'QR', 'NFC', 'Barcode'] }
    ]
  },
  payments: {
    title: 'Payments',
    icon: 'bi-credit-card',
    description: 'Track fees due, payments received and balances.',
    path: '/payments',
    create: '/payments',
    update: {
      method: 'patch',
      fields: [
        { key: 'sessionDate', label: 'Session date', type: 'date', required: true },
        { key: 'sessionNumber', label: 'Session number', type: 'number' },
        { key: 'amountDue', label: 'Amount due', type: 'number', required: true }
      ]
    },
    columns: ['studentId.userId.name', 'groupId.groupName', 'amountDue', 'amountPaid', 'remaining', 'status'],
    fields: [
      { key: 'studentId', label: 'Student ID', required: true },
      { key: 'groupId', label: 'Class', type: 'group-select', required: true },
      { key: 'sessionDate', label: 'Session date', type: 'date', required: true },
      { key: 'amountDue', label: 'Amount due', type: 'number', required: true },
      { key: 'amountPaid', label: 'Amount paid', type: 'number' }
    ]
  },
  results: {
    title: 'Results',
    icon: 'bi-bar-chart-line',
    description: 'Record and review student exam results.',
    path: '/results',
    create: '/results',
    update: {
      method: 'put',
      fields: [
        { key: 'marks', label: 'Marks', type: 'number', required: true }
      ]
    },
    remove: true,
    columns: ['student.userId.name', 'student.studentCode', 'exam.title', 'marks', 'isPassed'],
    fields: [
      { key: 'exam', label: 'Exam', type: 'exam-select', required: true },
      { key: 'studentCode', label: 'Student', type: 'student-select', required: true },
      { key: 'marks', label: 'Marks', type: 'number', required: true }
    ]
  },
  parents: {
    title: 'Parents',
    icon: 'bi-people',
    description: 'View parent accounts created through registration.',
    path: '/parents',
    update: {
      method: 'put',
      fields: [{ key: 'gender', label: 'Gender', type: 'select', options: ['male', 'female'] }]
    },
    columns: ['user.name', 'user.email', 'user.phone', 'user.isActive', 'createdAt'],
    fields: []
  },
  secretaries: {
    title: 'Secretaries',
    icon: 'bi-person-vcard',
    description: 'Create and manage secretary accounts.',
    path: '/secretaries',
    create: '/secretaries',
    update: { method: 'put', fields: secretaryUpdateFields },
    remove: true,
    columns: ['userId.name', 'userId.email', 'userId.phone', 'department', 'teacher.userId.name'],
    fields: [
      { key: 'name', label: 'Full name', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'phone', label: 'Phone' },
      { key: 'password', label: 'Password', type: 'password', required: true },
      { key: 'teacherId', label: 'Teacher profile ID' },
      { key: 'department', label: 'Department' }
    ]
  },
  messages: {
    title: 'Messages',
    icon: 'bi-chat-left-text',
    description: 'Send announcements to your learning community.',
    path: '/notifications',
    create: '/notifications',
    remove: true,
    columns: ['title', 'body', 'type', 'targetRole', 'createdAt'],
    fields: [
      { key: 'title', label: 'Title', required: true },
      { key: 'body', label: 'Message', type: 'textarea', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['announcement', 'payment', 'exam', 'attendance'] },
      { key: 'targetRole', label: 'Audience', type: 'select', options: ['all', 'students', 'parents', 'teachers'] }
    ]
  }
};

@Component({
  selector: 'app-management-page',
  templateUrl: './management-page.component.html',
  styleUrls: ['./management-page.component.css']
})
export class ManagementPageComponent implements OnInit, OnDestroy {
  config: Config = pages['students'];
  resource: DashboardResource = 'students';
  rows: Record<string, unknown>[] = [];
  form: Record<string, unknown> = {};
  loading = true;
  saving = false;
  deleting = false;
  open = false;
  editing: Record<string, unknown> | null = null;
  pendingDelete: Record<string, unknown> | null = null;
  pendingTeacherRejection: Record<string, unknown> | null = null;
  enrollmentStudent: Record<string, unknown> | null = null;
  enrollmentGroupId = '';
  enrollmentGroups: Record<string, unknown>[] = [];
  loadingEnrollmentGroups = false;
  enrollmentSchedules: Record<string, unknown>[] = [];
  loadingEnrollmentSchedules = false;
  enrollmentScheduleError = '';
  enrolling = false;
  formGroups: Record<string, unknown>[] = [];
  loadingFormGroups = false;
  formGroupsError = '';
  formGrades: Record<string, unknown>[] = [];
  loadingFormGrades = false;
  formGradesError = '';
  formTeachers: Record<string, unknown>[] = [];
  loadingFormTeachers = false;
  formTeachersError = '';
  formExams: Record<string, unknown>[] = [];
  loadingFormExams = false;
  formExamsError = '';
  formStudents: Record<string, unknown>[] = [];
  loadingFormStudents = false;
  formStudentsError = '';
  activatingStudentCode = '';
  publishingExamId = '';
  teacherDecisionId = '';
  enrollmentError = '';
  search = '';
  error = '';
  message = '';

  private subscription?: Subscription;
  private querySubscription?: Subscription;
  private openCreateFromQuery = false;
  private enrollmentScheduleRequest = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: ApiService,
    private readonly access: AccessControlService
  ) {}

  ngOnInit(): void {
    this.subscription = this.route.data.subscribe((data) => {
      const resource = data['resource'];
      if (!isDashboardResource(resource)) {
        this.loading = false;
        this.error = 'This page is not available.';
        return;
      }

      this.resource = resource;
      this.config = pages[resource];
      this.search = '';
      this.message = '';
      this.pendingTeacherRejection = null;
      this.teacherDecisionId = '';
      this.closeForm();
      this.closeEnrollment();
      this.resetFormReferences();
      this.resetForm();
      this.load();
      this.consumeCreateQuery();
    });

    this.querySubscription = this.route.queryParamMap.subscribe((params) => {
      this.openCreateFromQuery = params.get('create') === '1';
      this.consumeCreateQuery();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.querySubscription?.unsubscribe();
  }

  get canView(): boolean {
    return this.access.canView(this.resource);
  }

  get canCreate(): boolean {
    return Boolean(this.config.create && this.access.can(this.resource, 'create'));
  }

  get canUpdate(): boolean {
    return Boolean(this.config.update && this.access.can(this.resource, 'update'));
  }

  get canDelete(): boolean {
    return Boolean(this.config.remove && this.access.can(this.resource, 'delete'));
  }

  get deletingTeacher(): boolean {
    return this.resource === 'teachers';
  }

  canPublishExam(row: Record<string, unknown>): boolean {
    return this.resource === 'exams'
      && this.canUpdate
      && Boolean(this.config.publishPath)
      && this.value(row, 'status').toLowerCase() === 'draft'
      && Boolean(this.recordId(row));
  }

  isPublishingExam(row: Record<string, unknown>): boolean {
    return this.publishingExamId === this.recordId(row);
  }

  get hasActions(): boolean {
    return this.canUpdate || this.canDelete || this.canManageEnrollment || this.canReviewTeacherRequests;
  }

  /** The server re-checks ownership; this only exposes the flow to staff who manage both records and classes. */
  get canManageEnrollment(): boolean {
    return this.resource === 'students'
      && this.access.can('students', 'update')
      && this.access.can('classes', 'update');
  }

  get canReviewTeacherRequests(): boolean {
    return this.resource === 'teachers' && this.access.currentRole === 'admin';
  }

  get isEditing(): boolean {
    return this.editing !== null;
  }

  get formDialogTitle(): string {
    if (this.resource === 'exams') {
      return this.isEditing ? 'Edit exam' : 'Create exam';
    }

    return `${this.isEditing ? 'Edit' : 'Add'} ${this.config.title.slice(0, -1)}`;
  }

  get formDialogDescription(): string {
    if (this.resource === 'exams') {
      return this.isEditing
        ? 'Update the exam details before recording results.'
        : 'Choose the class and exam details. It will be saved as a draft until you publish it.';
    }

    return this.isEditing
      ? 'Update the fields that this account is allowed to change.'
      : 'Enter the required details below.';
  }

  get dialogFields(): readonly Field[] {
    return this.isEditing ? this.config.update?.fields ?? [] : this.config.fields;
  }

  get requiresLoadedReferences(): boolean {
    const requiresGroups = this.dialogFields.some(
      (field) => field.type === 'group-select' && this.isDialogFieldRequired(field)
    );
    const requiresGrades = this.dialogFields.some(
      (field) => field.type === 'grade-select' && this.isDialogFieldRequired(field)
    );
    const requiresTeachers = this.dialogFields.some(
      (field) => field.type === 'teacher-select' && this.isDialogFieldRequired(field)
    );
    const requiresExams = this.dialogFields.some(
      (field) => field.type === 'exam-select' && this.isDialogFieldRequired(field)
    );
    const requiresStudents = this.dialogFields.some(
      (field) => field.type === 'student-select' && this.isDialogFieldRequired(field)
    );

    return (requiresGroups && (this.loadingFormGroups || this.formGroups.length === 0))
      || (requiresGrades && (this.loadingFormGrades || this.formGrades.length === 0))
      || (requiresTeachers && (this.loadingFormTeachers || this.formTeachers.length === 0))
      || (requiresExams && (this.loadingFormExams || this.formExams.length === 0))
      || (requiresStudents && Boolean(this.form['exam'])
        && (this.loadingFormStudents || this.eligibleFormStudents.length === 0));
  }

  get formReferencesError(): string {
    return this.formGroupsError
      || this.formGradesError
      || this.formTeachersError
      || this.formExamsError
      || this.formStudentsError;
  }

  get eligibleFormStudents(): Record<string, unknown>[] {
    if (this.resource !== 'results') return this.formStudents;

    const selectedExamId = this.entityId(this.form['exam']);
    if (!selectedExamId) return [];

    const selectedExam = this.formExams.find(
      (exam) => this.entityId(exam) === selectedExamId
    );
    const examGroupId = this.entityId(selectedExam?.['group']);
    if (!examGroupId) return [];

    return this.formStudents.filter((student) => {
      const groups = student['groups'];
      return Array.isArray(groups) && groups.some(
        (group) => this.entityId(group) === examGroupId
      );
    });
  }

  get emptyStateMessage(): string {
    const learner = this.access.currentRole === 'student' || this.access.currentRole === 'parent';

    if (learner && this.resource === 'exams') {
      return 'No published exams are available for your enrolled classes.';
    }
    if (learner && this.resource === 'results') {
      return 'No published results are available for this account yet.';
    }

    return 'No records found.';
  }

  isDialogFieldVisible(field: Field): boolean {
    if (this.resource === 'classes' && field.type === 'teacher-select') {
      // The API assigns staff-created classes to their linked teacher profile.
      return this.access.currentRole === 'admin';
    }

    if (this.resource !== 'schedule') return true;

    if (field.key === 'dayOfWeek') return this.form['type'] === 'weekly';
    if (field.key === 'specificDate') return this.form['type'] === 'extra';

    return true;
  }

  isDialogFieldRequired(field: Field): boolean {
    if (field.type === 'teacher-select') return this.access.currentRole === 'admin';

    if (field.required) return true;

    return this.resource === 'schedule'
      && ((field.key === 'dayOfWeek' && this.form['type'] === 'weekly')
        || (field.key === 'specificDate' && this.form['type'] === 'extra'));
  }

  onDialogFieldChange(field: Field, value: unknown): void {
    if (this.resource === 'results' && field.key === 'exam') {
      this.form['studentCode'] = '';
      return;
    }

    if (this.resource !== 'schedule' || field.key !== 'type') return;

    if (value === 'weekly') this.form['specificDate'] = '';
    if (value === 'extra') this.form['dayOfWeek'] = '';
  }

  load(): void {
    if (!this.canView) {
      this.rows = [];
      this.loading = false;
      this.error = 'You do not have permission to view this page.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.api.list(this.config.path).subscribe({
      next: (rows) => {
        this.rows = rows;
        this.loading = false;
      },
      error: (error: { error?: { message?: string } }) => {
        this.error = error.error?.message || 'Could not load data. Please check the API server and permissions.';
        this.loading = false;
      }
    });
  }

  get filtered(): Record<string, unknown>[] {
    const term = this.search.trim().toLowerCase();
    return term
      ? this.rows.filter((row) => this.config.columns.some((key) => this.value(row, key).toLowerCase().includes(term)))
      : this.rows;
  }

  openCreate(): void {
    if (!this.canCreate) return;

    this.editing = null;
    this.resetForm();
    this.error = '';
    this.message = '';
    this.resetFormReferences();
    this.open = true;
    this.loadFormReferences();
  }

  edit(row: Record<string, unknown>): void {
    if (!this.canUpdate || !this.config.update || !this.recordId(row)) return;

    this.editing = row;
    this.form = Object.fromEntries(
      this.config.update.fields.map((field) => [
        field.key,
        this.toFormValue(this.readValue(row, field.source || field.key), field)
      ])
    );
    this.error = '';
    this.message = '';
    this.resetFormReferences();
    this.open = true;
    this.loadFormReferences();
  }

  canEditRow(row: Record<string, unknown>): boolean {
    return this.canUpdate && Boolean(this.recordId(row));
  }

  canActivateStudent(row: Record<string, unknown>): boolean {
    return this.resource === 'students'
      && this.access.currentRole === 'admin'
      && row['isActive'] === false
      && Boolean(this.recordId(row));
  }

  teacherApprovalStatus(row: Record<string, unknown>): 'pending' | 'approved' | 'rejected' {
    const status = this.readValue(row, 'userId.approvalStatus');
    if (status === 'pending' || status === 'approved' || status === 'rejected') {
      return status;
    }

    // Teacher accounts created before approvalStatus existed remain readable.
    return this.readValue(row, 'userId.isApproved') === true ? 'approved' : 'pending';
  }

  teacherApprovalLabel(row: Record<string, unknown>): string {
    const labels = {
      pending: 'Pending approval',
      approved: 'Approved',
      rejected: 'Rejected'
    } as const;

    return labels[this.teacherApprovalStatus(row)];
  }

  canApproveTeacher(row: Record<string, unknown>): boolean {
    return this.canReviewTeacherRequests
      && this.teacherApprovalStatus(row) === 'pending'
      && Boolean(this.recordId(row));
  }

  canRejectTeacher(row: Record<string, unknown>): boolean {
    return this.canApproveTeacher(row);
  }

  isTeacherDecisionInProgress(row: Record<string, unknown>): boolean {
    return this.teacherDecisionId === this.recordId(row);
  }

  approveTeacher(row: Record<string, unknown>): void {
    const id = this.recordId(row);
    if (!this.canApproveTeacher(row) || !id || this.teacherDecisionId) return;

    this.teacherDecisionId = id;
    this.error = '';
    this.message = '';
    this.api.patch(`/teachers/${encodeURIComponent(id)}/approve`, {}).subscribe({
      next: () => {
        this.teacherDecisionId = '';
        this.message = 'Teacher approved successfully. They can now sign in.';
        this.load();
      },
      error: (error: { error?: { message?: string } }) => {
        this.teacherDecisionId = '';
        this.error = error.error?.message || 'Could not approve this teacher.';
      }
    });
  }

  requestTeacherRejection(row: Record<string, unknown>): void {
    if (!this.canRejectTeacher(row) || this.teacherDecisionId) return;

    this.pendingTeacherRejection = row;
    this.error = '';
    this.message = '';
  }

  cancelTeacherRejection(): void {
    if (!this.teacherDecisionId) this.pendingTeacherRejection = null;
  }

  confirmTeacherRejection(): void {
    const row = this.pendingTeacherRejection;
    const id = row ? this.recordId(row) : null;
    if (!row || !id || !this.canRejectTeacher(row) || this.teacherDecisionId) return;

    this.teacherDecisionId = id;
    this.error = '';
    this.api.patch(`/teachers/${encodeURIComponent(id)}/reject`, {}).subscribe({
      next: () => {
        this.teacherDecisionId = '';
        this.pendingTeacherRejection = null;
        this.message = 'Teacher request rejected.';
        this.load();
      },
      error: (error: { error?: { message?: string } }) => {
        this.teacherDecisionId = '';
        this.error = error.error?.message || 'Could not reject this teacher request.';
      }
    });
  }

  isActivatingStudent(row: Record<string, unknown>): boolean {
    return this.activatingStudentCode === this.recordId(row);
  }

  activateStudent(row: Record<string, unknown>): void {
    const studentCode = this.recordId(row);
    if (!this.canActivateStudent(row) || !studentCode || this.activatingStudentCode) return;

    this.activatingStudentCode = studentCode;
    this.error = '';
    this.message = '';

    this.api.patch(`/students/${encodeURIComponent(studentCode)}/activate`, {}).subscribe({
      next: () => {
        this.activatingStudentCode = '';
        this.message = 'Student activated successfully.';
        this.load();
      },
      error: (error: { error?: { message?: string } }) => {
        this.activatingStudentCode = '';
        this.error = error.error?.message || 'Could not activate this student.';
      }
    });
  }

  canEnrollStudent(row: Record<string, unknown>): boolean {
    return this.canManageEnrollment && Boolean(this.studentCode(row));
  }

  openEnrollment(row: Record<string, unknown>): void {
    if (!this.canEnrollStudent(row)) return;

    this.enrollmentStudent = row;
    this.enrollmentGroupId = '';
    this.enrollmentError = '';
    this.enrollmentSchedules = [];
    this.enrollmentScheduleError = '';
    this.message = '';
    this.loadEnrollmentGroups();
  }

  closeEnrollment(): void {
    if (this.enrolling) return;

    this.enrollmentScheduleRequest += 1;
    this.enrollmentStudent = null;
    this.enrollmentGroupId = '';
    this.enrollmentGroups = [];
    this.loadingEnrollmentGroups = false;
    this.enrollmentSchedules = [];
    this.loadingEnrollmentSchedules = false;
    this.enrollmentScheduleError = '';
    this.enrollmentError = '';
  }

  onEnrollmentGroupChange(): void {
    const groupId = this.enrollmentGroupId.trim();
    const request = ++this.enrollmentScheduleRequest;
    this.enrollmentSchedules = [];
    this.enrollmentScheduleError = '';

    if (!groupId) {
      this.loadingEnrollmentSchedules = false;
      return;
    }

    this.loadingEnrollmentSchedules = true;
    this.api.list('/schedules').subscribe({
      next: (schedules) => {
        if (request !== this.enrollmentScheduleRequest) return;
        this.enrollmentSchedules = schedules.filter((schedule) =>
          schedule['isActive'] !== false && this.entityId(schedule['groupId']) === groupId
        );
        this.loadingEnrollmentSchedules = false;
      },
      error: () => {
        if (request !== this.enrollmentScheduleRequest) return;
        this.loadingEnrollmentSchedules = false;
        this.enrollmentScheduleError = 'The class was selected, but its schedule could not be loaded.';
      }
    });
  }

  enrollStudent(): void {
    const studentCode = this.enrollmentStudent ? this.studentCode(this.enrollmentStudent) : null;
    const groupId = this.enrollmentGroupId.trim();
    if (!this.canManageEnrollment || !studentCode || !groupId || this.enrolling) return;

    this.enrolling = true;
    this.enrollmentError = '';
    this.api.post(`/groups/${encodeURIComponent(groupId)}/students/${encodeURIComponent(studentCode)}`, {}).subscribe({
      next: () => {
        this.enrolling = false;
        this.closeEnrollment();
        this.message = 'Student enrolled successfully. The selected class schedule is now available to them.';
        this.load();
      },
      error: (error: { error?: { message?: string } }) => {
        this.enrolling = false;
        this.enrollmentError = error.error?.message || 'Could not enroll this student. Please check the class ID and permissions.';
      }
    });
  }

  get enrollmentStudentName(): string {
    if (!this.enrollmentStudent) return 'this student';

    const name = this.value(this.enrollmentStudent, 'userId.name');
    return name === '-' ? 'this student' : name;
  }

  get enrollmentStudentCode(): string {
    return this.enrollmentStudent ? this.studentCode(this.enrollmentStudent) || '' : '';
  }

  get hasEnrollmentGroups(): boolean {
    return this.enrollmentGroups.length > 0;
  }

  get hasEnrollmentSchedules(): boolean {
    return this.enrollmentSchedules.length > 0;
  }

  enrollmentScheduleDescription(schedule: Record<string, unknown>): string {
    const type = schedule['type'];
    const dayOfWeek = schedule['dayOfWeek'];
    const specificDate = schedule['specificDate'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dateOrDay = type === 'weekly' && typeof dayOfWeek === 'number'
      ? days[dayOfWeek] || 'Weekly'
      : typeof specificDate === 'string' && !Number.isNaN(Date.parse(specificDate))
        ? new Date(specificDate).toLocaleDateString()
        : 'Extra class';
    const startTime = typeof schedule['startTime'] === 'string' ? schedule['startTime'] : '';
    const endTime = typeof schedule['endTime'] === 'string' ? schedule['endTime'] : '';

    return `${dateOrDay}${startTime && endTime ? ` · ${startTime}–${endTime}` : ''}`;
  }

  save(): void {
    if (!this.validateExamForm()) return;

    if (this.editing) {
      this.update(this.editing);
      return;
    }

    this.create();
  }

  publishExam(row: Record<string, unknown>): void {
    const id = this.recordId(row);
    const publishPath = this.config.publishPath;
    if (!this.canPublishExam(row) || !id || !publishPath || this.publishingExamId) return;

    this.publishingExamId = id;
    this.error = '';
    this.message = '';
    this.api.patch(`${publishPath}/${id}/publish`, {}).subscribe({
      next: () => {
        this.publishingExamId = '';
        this.message = 'Exam published. Students can now see the exam and its results.';
        this.load();
      },
      error: (error: { error?: { message?: string } }) => {
        this.publishingExamId = '';
        this.error = error.error?.message || 'Could not publish this exam.';
      }
    });
  }

  requestDelete(row: Record<string, unknown>): void {
    if (this.canDelete && this.recordId(row)) this.pendingDelete = row;
  }

  cancelDelete(): void {
    if (!this.deleting) this.pendingDelete = null;
  }

  confirmDelete(): void {
    const row = this.pendingDelete;
    const id = row ? this.recordId(row) : null;
    if (!this.canDelete || !row || !id) return;

    this.deleting = true;
    this.api.delete(`${this.config.deletePath || this.config.path}/${id}`).subscribe({
      next: () => {
        this.deleting = false;
        this.pendingDelete = null;
        this.message = this.deletingTeacher
          ? 'Teacher deactivated successfully.'
          : 'Record deleted successfully.';
        this.load();
      },
      error: (error: { error?: { message?: string } }) => {
        this.deleting = false;
        this.error = error.error?.message || (this.deletingTeacher
          ? 'Could not deactivate this teacher.'
          : 'Could not delete this record.');
      }
    });
  }

  closeForm(): void {
    if (this.saving) return;

    this.open = false;
    this.editing = null;
    this.resetFormReferences();
    this.resetForm();
    this.error = '';
  }

  value(row: Record<string, unknown>, key: string): string {
    if (this.resource === 'teachers' && key === 'userId.approvalStatus') {
      return this.teacherApprovalLabel(row);
    }

    if (this.resource === 'exams' && key === 'status') {
      const status = this.readValue(row, key);
      if (status === 'draft') return 'Draft';
      if (status === 'published') return 'Published';
      if (status === 'closed') return 'Closed';
    }

    const value = this.readValue(row, key);
    if (value === true) return 'Active';
    if (value === false) return 'Inactive';
    if (value === undefined || value === null || value === '') return '-';
    if (Array.isArray(value)) {
      const labels = value
        .map((item) => this.entityLabel(item))
        .filter((label): label is string => Boolean(label));
      return labels.length ? labels.join(', ') : '-';
    }
    if (typeof value === 'object') return this.entityLabel(value) || '-';
    if (typeof value === 'string' && /date|created/i.test(key) && !Number.isNaN(Date.parse(value))) {
      return new Date(value).toLocaleDateString();
    }
    return String(value);
  }

  label(key: string): string {
    return key.split('.').pop()?.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase()) || key;
  }

  examOptionLabel(exam: Record<string, unknown>): string {
    const title = this.value(exam, 'title');
    const group = this.value(exam, 'group.groupName');
    const date = this.value(exam, 'examDate');

    return [title, group !== '-' ? group : '', date !== '-' ? date : '']
      .filter(Boolean)
      .join(' · ');
  }

  studentOptionLabel(student: Record<string, unknown>): string {
    const name = this.value(student, 'userId.name');
    const code = this.studentCode(student) || '';

    return [name !== '-' ? name : '', code]
      .filter(Boolean)
      .join(' · ');
  }

  teacherOptionLabel(teacher: Record<string, unknown>): string {
    const name = this.value(teacher, 'userId.name');
    const subject = this.value(teacher, 'subject');

    return [name !== '-' ? name : '', subject !== '-' ? subject : '']
      .filter(Boolean)
      .join(' - ') || this.entityId(teacher) || 'Unnamed teacher';
  }

  private create(): void {
    if (!this.canCreate || !this.config.create) return;

    this.saving = true;
    this.error = '';
    this.api.post(this.config.create, this.cleanForm()).subscribe({
      next: () => {
        this.saving = false;
        this.closeForm();
        this.message = this.resource === 'exams'
          ? 'Exam saved as a draft. Publish it when you are ready.'
          : 'Record created successfully.';
        this.load();
      },
      error: (error: { error?: { message?: string } }) => {
        this.saving = false;
        this.error = error.error?.message || 'Could not save this record.';
      }
    });
  }

  private loadEnrollmentGroups(): void {
    if (!this.enrollmentStudent || this.loadingEnrollmentGroups) return;

    this.loadingEnrollmentGroups = true;
    this.enrollmentError = '';
    this.api.list('/groups').subscribe({
      next: (groups) => {
        this.enrollmentGroups = groups.filter((group) => Boolean(this.entityId(group)));
        this.loadingEnrollmentGroups = false;
        if (this.enrollmentGroups.length === 0) {
          this.enrollmentError = 'No classes are available for your account.';
        }
      },
      error: (error: { error?: { message?: string } }) => {
        this.enrollmentGroups = [];
        this.loadingEnrollmentGroups = false;
        this.enrollmentError = error.error?.message || 'Could not load your available classes.';
      }
    });
  }

  private loadFormGroups(): void {
    const needsGroups = this.dialogFields.some((field) => field.type === 'group-select');
    if (!needsGroups || this.loadingFormGroups) return;

    this.loadingFormGroups = true;
    this.formGroupsError = '';
    this.api.list('/groups').subscribe({
      next: (groups) => {
        this.formGroups = groups.filter((group) =>
          Boolean(this.entityId(group))
          && (this.resource !== 'exams' || group['isActive'] !== false)
        );
        this.loadingFormGroups = false;
        if (this.formGroups.length === 0) {
          this.formGroupsError = this.resource === 'exams'
            ? 'Create or activate a class before scheduling an exam.'
            : 'No classes are available for your account.';
        }
      },
      error: (error: { error?: { message?: string } }) => {
        this.formGroups = [];
        this.loadingFormGroups = false;
        this.formGroupsError = error.error?.message || 'Could not load available classes.';
      }
    });
  }

  private loadFormGrades(): void {
    const needsGrades = this.dialogFields.some((field) => field.type === 'grade-select');
    if (!needsGrades || this.loadingFormGrades) return;

    this.loadingFormGrades = true;
    this.formGradesError = '';
    this.api.list('/grades').subscribe({
      next: (grades) => {
        const selectedGradeId = this.entityId(this.form['gradeLevelId']);
        this.formGrades = grades.filter((grade) =>
          Boolean(this.entityId(grade))
          && (grade['isActive'] !== false || this.entityId(grade) === selectedGradeId)
        );
        this.loadingFormGrades = false;
        if (this.formGrades.length === 0) {
          this.formGradesError = 'Create or activate a grade before creating a class.';
        }
      },
      error: (error: { error?: { message?: string } }) => {
        this.formGrades = [];
        this.loadingFormGrades = false;
        this.formGradesError = error.error?.message || 'Could not load available grades.';
      }
    });
  }

  private loadFormTeachers(): void {
    const needsTeachers = this.dialogFields.some(
      (field) => field.type === 'teacher-select' && this.isDialogFieldVisible(field)
    );
    if (!needsTeachers || this.loadingFormTeachers) return;

    this.loadingFormTeachers = true;
    this.formTeachersError = '';
    this.api.list('/teachers').subscribe({
      next: (teachers) => {
        this.formTeachers = teachers.filter((teacher) =>
          Boolean(this.entityId(teacher))
          && teacher['isActive'] !== false
          && this.readValue(teacher, 'userId.isActive') !== false
          && this.teacherApprovalStatus(teacher) === 'approved'
        );
        this.loadingFormTeachers = false;
        if (this.formTeachers.length === 0) {
          this.formTeachersError = 'Create, approve, or activate a teacher before creating a class.';
        }
      },
      error: (error: { error?: { message?: string } }) => {
        this.formTeachers = [];
        this.loadingFormTeachers = false;
        this.formTeachersError = error.error?.message || 'Could not load available teachers.';
      }
    });
  }

  private loadFormExams(): void {
    const needsExams = this.dialogFields.some((field) => field.type === 'exam-select');
    if (!needsExams || this.loadingFormExams) return;

    this.loadingFormExams = true;
    this.formExamsError = '';
    this.api.list('/exams').subscribe({
      next: (exams) => {
        this.formExams = exams.filter((exam) => Boolean(this.entityId(exam)));
        this.loadingFormExams = false;
        if (this.formExams.length === 0) {
          this.formExamsError = 'Create an exam before recording a result.';
        }
      },
      error: (error: { error?: { message?: string } }) => {
        this.formExams = [];
        this.loadingFormExams = false;
        this.formExamsError = error.error?.message || 'Could not load available exams.';
      }
    });
  }

  private loadFormStudents(): void {
    const needsStudents = this.dialogFields.some((field) => field.type === 'student-select');
    if (!needsStudents || this.loadingFormStudents) return;

    this.loadingFormStudents = true;
    this.formStudentsError = '';
    this.api.list('/students').subscribe({
      next: (students) => {
        this.formStudents = students.filter(
          (student) => student['isActive'] !== false && Boolean(this.studentCode(student))
        );
        this.loadingFormStudents = false;
        if (this.formStudents.length === 0) {
          this.formStudentsError = 'No active students are available for your account.';
        }
      },
      error: (error: { error?: { message?: string } }) => {
        this.formStudents = [];
        this.loadingFormStudents = false;
        this.formStudentsError = error.error?.message || 'Could not load available students.';
      }
    });
  }

  private loadFormReferences(): void {
    this.loadFormGroups();
    this.loadFormGrades();
    this.loadFormTeachers();
    this.loadFormExams();
    this.loadFormStudents();
  }

  private resetFormReferences(): void {
    this.formGroups = [];
    this.loadingFormGroups = false;
    this.formGroupsError = '';
    this.formGrades = [];
    this.loadingFormGrades = false;
    this.formGradesError = '';
    this.formTeachers = [];
    this.loadingFormTeachers = false;
    this.formTeachersError = '';
    this.formExams = [];
    this.loadingFormExams = false;
    this.formExamsError = '';
    this.formStudents = [];
    this.loadingFormStudents = false;
    this.formStudentsError = '';
  }

  private update(row: Record<string, unknown>): void {
    const update = this.config.update;
    const id = this.recordId(row);
    if (!this.canUpdate || !update || !id) return;

    this.saving = true;
    this.error = '';
    const path = `${update.path || this.config.path}/${id}`;
    const request = update.method === 'put'
      ? this.api.put(path, this.cleanForm())
      : this.api.patch(path, this.cleanForm());

    request.subscribe({
      next: () => {
        this.saving = false;
        this.closeForm();
        this.message = 'Record updated successfully.';
        this.load();
      },
      error: (error: { error?: { message?: string } }) => {
        this.saving = false;
        this.error = error.error?.message || 'Could not update this record.';
      }
    });
  }

  private cleanForm(): Record<string, unknown> {
    const form = Object.fromEntries(Object.entries(this.form).filter(([, value]) => value !== ''));

    if (this.resource === 'schedule') {
      if (form['type'] === 'weekly') delete form['specificDate'];
      if (form['type'] === 'extra') delete form['dayOfWeek'];
    }

    return form;
  }

  private validateExamForm(): boolean {
    if (this.resource !== 'exams') return true;

    const totalMarks = Number(this.form['totalMarks']);
    const passingMarks = Number(this.form['passingMarks']);
    const duration = Number(this.form['duration']);

    if (!Number.isFinite(totalMarks) || totalMarks < 1) {
      this.error = 'Total marks must be at least 1.';
      return false;
    }

    if (!Number.isFinite(passingMarks) || passingMarks < 0) {
      this.error = 'Passing marks cannot be negative.';
      return false;
    }

    if (passingMarks > totalMarks) {
      this.error = 'Passing marks cannot be greater than total marks.';
      return false;
    }

    if (!Number.isInteger(duration) || duration < 1) {
      this.error = 'Duration must be at least 1 minute.';
      return false;
    }

    return true;
  }

  private recordId(row: Record<string, unknown>): string | null {
    const id = row[this.config.idKey || '_id'];
    return typeof id === 'string' && id ? id : null;
  }

  private studentCode(row: Record<string, unknown>): string | null {
    const studentCode = row['studentCode'];
    return typeof studentCode === 'string' && studentCode.trim() ? studentCode.trim() : null;
  }

  private entityId(value: unknown): string | null {
    if (typeof value === 'string' && value.trim()) return value.trim();

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const id = record['_id'] ?? record['id'];
      return typeof id === 'string' && id.trim() ? id.trim() : null;
    }

    return null;
  }

  private entityLabel(value: unknown): string | null {
    if (typeof value === 'string' && value.trim()) return value;
    if (!value || typeof value !== 'object') return null;

    const record = value as Record<string, unknown>;
    const label = record['groupName'] ?? record['name'] ?? record['title'] ?? record['_id'];
    return typeof label === 'string' && label.trim() ? label : null;
  }

  private resetForm(): void {
    this.form = Object.fromEntries(
      this.config.fields.map((field) => [field.key, field.defaultValue ?? ''])
    );
  }

  private readValue(row: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((current, part) => {
      if (!current || typeof current !== 'object') return undefined;
      return (current as Record<string, unknown>)[part];
    }, row);
  }

  private toFormValue(value: unknown, field: Field): string | number | boolean {
    if (value === undefined || value === null) return '';

    const scalar = typeof value === 'object'
      ? (value as Record<string, unknown>)['_id'] ?? (value as Record<string, unknown>)['id'] ?? ''
      : value;

    if (field.type === 'select' && typeof scalar === 'boolean') {
      return String(scalar);
    }

    if (field.type === 'date' && typeof scalar === 'string') {
      const date = new Date(scalar);
      return Number.isNaN(date.getTime()) ? scalar : date.toISOString().slice(0, 10);
    }

    return typeof scalar === 'string' || typeof scalar === 'number' || typeof scalar === 'boolean'
      ? scalar
      : String(scalar);
  }

  private consumeCreateQuery(): void {
    if (!this.openCreateFromQuery || !this.canCreate) return;

    this.openCreate();
    this.openCreateFromQuery = false;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { create: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
