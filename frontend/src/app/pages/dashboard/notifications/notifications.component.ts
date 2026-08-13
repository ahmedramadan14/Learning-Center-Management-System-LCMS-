import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccessControlService } from '../../../services/auth/access-control.service';
import {
  CreateNotificationPayload,
  NotificationAudience,
  NotificationItem,
  NotificationPagination,
  NotificationService,
  NotificationType,
  UpdateNotificationPayload
} from '../../../services/notifications/notification.service';

interface NotificationTypeOption {
  value: NotificationType;
  label: string;
}

interface AudienceOption {
  value: CreateNotificationPayload['targetRole'];
  label: string;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  readonly typeOptions: readonly NotificationTypeOption[] = [
    { value: 'announcement', label: 'Announcement' },
    { value: 'payment', label: 'Payment' },
    { value: 'exam', label: 'Exam' },
    { value: 'attendance', label: 'Attendance' }
  ];

  private readonly adminAudienceOptions: readonly AudienceOption[] = [
    { value: 'all', label: 'Everyone' },
    { value: 'admin', label: 'Admins' },
    { value: 'teacher', label: 'Teachers' },
    { value: 'secretary', label: 'Secretaries' },
    { value: 'student', label: 'Students' },
    { value: 'parent', label: 'Parents' }
  ];

  private readonly staffAudienceOptions: readonly AudienceOption[] = [
    { value: 'student', label: 'My students' },
    { value: 'parent', label: 'Parents of my students' }
  ];

  notifications: NotificationItem[] = [];
  pagination: NotificationPagination = { total: 0, page: 1, limit: 20, pages: 1 };
  unreadCount = 0;
  loading = true;
  loadingMore = false;
  saving = false;
  deleting = false;
  markingAll = false;
  composerOpen = false;
  pendingDelete: NotificationItem | null = null;
  editingNotification: NotificationItem | null = null;
  search = '';
  selectedType: NotificationType | 'all' = 'all';
  error = '';
  successMessage = '';
  draft: CreateNotificationPayload = this.emptyDraft();
  private readonly subscriptions = new Subscription();
  private readonly markingReadIds = new Set<string>();

  constructor(
    private readonly notificationService: NotificationService,
    private readonly access: AccessControlService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.notificationService.notifications$.subscribe((notifications) => {
        this.notifications = notifications;
      })
    );
    this.subscriptions.add(
      this.notificationService.unreadCount$.subscribe((count) => {
        this.unreadCount = count;
      })
    );
    this.subscriptions.add(
      this.notificationService.pagination$.subscribe((pagination) => {
        this.pagination = pagination;
      })
    );
    this.resetDraft();
    this.load();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get canCreate(): boolean {
    return this.access.can('notifications', 'create');
  }

  get canDelete(): boolean {
    return this.access.can('notifications', 'delete');
  }

  get canUpdate(): boolean {
    return this.access.can('notifications', 'update');
  }

  get isEditing(): boolean {
    return this.editingNotification !== null;
  }

  get canUseComposer(): boolean {
    return this.isEditing ? this.canUpdate : this.canCreate;
  }

  get editingAudienceLabel(): string {
    return this.editingNotification ? this.audienceLabel(this.editingNotification.targetRole) : '';
  }

  get audienceOptions(): readonly AudienceOption[] {
    return this.access.currentRole === 'admin'
      ? this.adminAudienceOptions
      : this.staffAudienceOptions;
  }

  get filteredNotifications(): NotificationItem[] {
    const searchTerm = this.search.trim().toLocaleLowerCase();

    return this.notifications.filter((notification) => {
      const matchesType = this.selectedType === 'all' || notification.type === this.selectedType;
      const matchesSearch = !searchTerm
        || notification.title.toLocaleLowerCase().includes(searchTerm)
        || notification.body.toLocaleLowerCase().includes(searchTerm);

      return matchesType && matchesSearch;
    });
  }

  get hasMore(): boolean {
    return this.pagination.page < this.pagination.pages;
  }

  get readCount(): number {
    return this.notifications.filter((notification) => this.isRead(notification)).length;
  }

  get roleLabel(): string {
    const role = this.access.currentRole;
    return role ? `${role.charAt(0).toUpperCase()}${role.slice(1)}` : 'User';
  }

  load(): void {
    this.loading = true;
    this.loadingMore = false;
    this.error = '';

    this.notificationService.load().subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error: unknown) => {
        this.loading = false;
        this.error = this.errorMessage(error, 'Could not load notifications. Please try again.');
      }
    });
  }

  loadMore(): void {
    if (!this.hasMore || this.loadingMore) {
      return;
    }

    this.loadingMore = true;
    this.error = '';

    this.notificationService.loadNextPage().subscribe({
      next: () => {
        this.loadingMore = false;
      },
      error: (error: unknown) => {
        this.loadingMore = false;
        this.error = this.errorMessage(error, 'Could not load more notifications.');
      }
    });
  }

  markAllAsRead(): void {
    if (this.markingAll || this.unreadCount === 0) {
      return;
    }

    this.markingAll = true;
    this.error = '';
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.markingAll = false;
      },
      error: (error: unknown) => {
        this.markingAll = false;
        this.error = this.errorMessage(error, 'Could not mark all notifications as read.');
      }
    });
  }

  markAsRead(notification: NotificationItem): void {
    const notificationId = this.notificationId(notification);
    if (!notificationId || this.markingAll || this.isRead(notification) || this.markingReadIds.has(notificationId)) {
      return;
    }

    this.markingReadIds.add(notificationId);
    this.error = '';
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        this.markingReadIds.delete(notificationId);
      },
      error: (error: unknown) => {
        this.markingReadIds.delete(notificationId);
        this.error = this.errorMessage(error, 'Could not update the notification status.');
      }
    });
  }

  isRead(notification: NotificationItem): boolean {
    return this.notificationService.isRead(notification);
  }

  isMarkingRead(notification: NotificationItem): boolean {
    const notificationId = this.notificationId(notification);
    return Boolean(notificationId && this.markingReadIds.has(notificationId));
  }

  openComposer(): void {
    if (!this.canCreate || this.saving) {
      return;
    }

    this.error = '';
    this.successMessage = '';
    this.editingNotification = null;
    this.resetDraft();
    this.composerOpen = true;
  }

  openEditor(notification: NotificationItem, event: Event): void {
    event.stopPropagation();
    if (!this.canUpdate || !this.notificationId(notification) || this.saving) {
      return;
    }

    // Editing is intentionally restricted to message content. Preserving the
    // original audience avoids accidentally changing a role-wide or direct
    // notification's recipients.
    this.editingNotification = notification;
    this.draft = {
      title: notification.title,
      body: notification.body,
      type: notification.type,
      targetRole: 'all'
    };
    this.error = '';
    this.successMessage = '';
    this.composerOpen = true;
  }

  closeComposer(): void {
    if (this.saving) {
      return;
    }

    this.composerOpen = false;
    this.editingNotification = null;
    this.resetDraft();
  }

  submitComposer(): void {
    if (this.isEditing) {
      this.updateNotification();
      return;
    }

    this.createNotification();
  }

  createNotification(): void {
    if (!this.canCreate || this.saving) {
      return;
    }

    const payload: CreateNotificationPayload = {
      ...this.draft,
      title: this.draft.title.trim(),
      body: this.draft.body.trim()
    };

    if (payload.title.length < 3 || !payload.body) {
      this.error = 'Please enter a title and message before sending.';
      return;
    }

    this.saving = true;
    this.error = '';

    this.notificationService.create(payload).subscribe({
      next: () => {
        this.saving = false;
        this.composerOpen = false;
        this.resetDraft();
        this.successMessage = 'Notification sent successfully.';
        this.load();
      },
      error: (error: unknown) => {
        this.saving = false;
        this.error = this.errorMessage(error, 'Could not send the notification.');
      }
    });
  }

  updateNotification(): void {
    const notificationId = this.editingNotification ? this.notificationId(this.editingNotification) : null;
    if (!this.canUpdate || !notificationId || this.saving) {
      return;
    }

    const payload: UpdateNotificationPayload = {
      title: this.draft.title.trim(),
      body: this.draft.body.trim(),
      type: this.draft.type
    };

    if (payload.title.length < 3 || !payload.body) {
      this.error = 'Please enter a title and message before saving.';
      return;
    }

    this.saving = true;
    this.error = '';

    this.notificationService.update(notificationId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.composerOpen = false;
        this.editingNotification = null;
        this.resetDraft();
        this.successMessage = 'Notification updated.';
        this.load();
      },
      error: (error: unknown) => {
        this.saving = false;
        this.error = this.errorMessage(error, 'Could not update the notification.');
      }
    });
  }

  requestDelete(notification: NotificationItem, event: Event): void {
    event.stopPropagation();
    if (this.canDelete && this.notificationId(notification)) {
      this.pendingDelete = notification;
    }
  }

  cancelDelete(): void {
    if (!this.deleting) {
      this.pendingDelete = null;
    }
  }

  confirmDelete(): void {
    const notificationId = this.pendingDelete ? this.notificationId(this.pendingDelete) : null;
    if (!this.canDelete || !notificationId || this.deleting) {
      return;
    }

    this.deleting = true;
    this.error = '';

    this.notificationService.delete(notificationId).subscribe({
      next: () => {
        this.deleting = false;
        this.pendingDelete = null;
        this.successMessage = 'Notification deleted.';
        this.load();
      },
      error: (error: unknown) => {
        this.deleting = false;
        this.error = this.errorMessage(error, 'Could not delete the notification.');
      }
    });
  }

  notificationId(notification: NotificationItem): string | null {
    return notification._id || notification.id || null;
  }

  trackByNotification(_: number, notification: NotificationItem): string {
    // Angular invokes trackBy callbacks without the component as `this`, so
    // keep this function self-contained. Otherwise rendering the first card
    // throws before the notification list can be displayed.
    return notification._id || notification.id || `${notification.title}-${notification.createdAt || ''}`;
  }

  typeLabel(type: NotificationType): string {
    return this.typeOptions.find((option) => option.value === type)?.label || 'Announcement';
  }

  typeIcon(type: NotificationType): string {
    switch (type) {
      case 'payment':
        return 'bi-cash-stack';
      case 'exam':
        return 'bi-file-earmark-check';
      case 'attendance':
        return 'bi-person-check';
      default:
        return 'bi-megaphone';
    }
  }

  audienceLabel(audience: NotificationAudience): string {
    const labels: Record<NotificationAudience, string> = {
      all: 'Everyone',
      admin: 'Admins',
      teacher: 'Teachers',
      secretary: 'Secretaries',
      student: 'Students',
      parent: 'Parents',
      direct: 'Selected recipients',
      teachers: 'Teachers',
      students: 'Students',
      parents: 'Parents'
    };

    return labels[audience];
  }

  private emptyDraft(): CreateNotificationPayload {
    return {
      title: '',
      body: '',
      type: 'announcement',
      targetRole: 'all'
    };
  }

  private resetDraft(): void {
    this.draft = this.emptyDraft();
    if (this.access.currentRole !== 'admin') {
      this.draft.targetRole = 'student';
    }
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (typeof error !== 'object' || error === null || !('error' in error)) {
      return fallback;
    }

    const response = (error as { error?: unknown }).error;
    if (typeof response !== 'object' || response === null || !('message' in response)) {
      return fallback;
    }

    const message = (response as { message?: unknown }).message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }
}
