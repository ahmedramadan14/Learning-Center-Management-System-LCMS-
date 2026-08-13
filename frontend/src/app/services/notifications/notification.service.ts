import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  Subscription,
  catchError,
  exhaustMap,
  finalize,
  map,
  of,
  shareReplay,
  tap,
  throwError,
  timer
} from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.service';

export type NotificationType = 'announcement' | 'payment' | 'exam' | 'attendance';
export type NotificationAudience =
  | 'all'
  | 'admin'
  | 'teacher'
  | 'secretary'
  | 'student'
  | 'parent'
  | 'direct'
  | 'teachers'
  | 'students'
  | 'parents';

export interface NotificationItem {
  _id?: string;
  id?: string;
  title: string;
  body: string;
  type: NotificationType;
  targetRole: NotificationAudience;
  isRead: boolean;
  readAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface NotificationPage {
  notifications: NotificationItem[];
  pagination: NotificationPagination;
  /** Null means the API did not expose a total unread count for this response. */
  unreadCount: number | null;
}

export interface CreateNotificationPayload {
  title: string;
  body: string;
  type: NotificationType;
  targetRole: Exclude<NotificationAudience, 'teachers' | 'students' | 'parents' | 'direct'>;
}

/**
 * The admin editor deliberately changes message content only. Audience and
 * explicit recipients stay immutable in the UI so an edit cannot accidentally
 * expand or replace a notification's delivery scope.
 */
export interface UpdateNotificationPayload {
  title: string;
  body: string;
  type: NotificationType;
}

interface NotificationResponseData {
  notification?: unknown;
  unreadCount?: unknown;
  unread?: unknown;
}

interface NotificationListResponse {
  data?: NotificationResponseData & {
    notifications?: unknown;
  };
  pagination?: Partial<NotificationPagination> & {
    unreadCount?: unknown;
    unread?: unknown;
  };
}

interface NotificationMutationResponse {
  data?: NotificationResponseData;
  pagination?: {
    unreadCount?: unknown;
    unread?: unknown;
  };
}

interface LoadOptions {
  page?: number;
  append?: boolean;
  /** Ignore an existing same-page request when a real-time event needs a fresh server snapshot. */
  force?: boolean;
}

const INITIAL_PAGINATION: NotificationPagination = {
  total: 0,
  page: 1,
  limit: 20,
  pages: 1
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  private readonly paginationSubject = new BehaviorSubject<NotificationPagination>(INITIAL_PAGINATION);
  private readonly inFlightRequests = new Map<string, Observable<NotificationPage>>();
  private readonly readRequests = new Map<string, Observable<void>>();
  private readonly requestVersions = new Map<string, number>();
  private readonly readStateVersions = new Map<string, number>();
  private readonly authSubscription: Subscription;
  private pollingSubscription?: Subscription;
  private realtimeRefreshSubscription?: Subscription;
  private realtimeSocket?: Socket;
  private pollingIdentity: string | null = null;
  private activeIdentity: string | null = null;
  private socketIdentity: string | null = null;
  private socketToken: string | null = null;
  private realtimeRefreshQueued = false;
  private realtimeEventRevision = 0;
  private serverUnreadCount: number | null = null;

  readonly notifications$ = this.notificationsSubject.asObservable();
  readonly unreadCount$ = this.unreadCountSubject.asObservable();
  readonly pagination$ = this.paginationSubject.asObservable();

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {
    // The service is application-scoped, so clear previous users' notification
    // state immediately after logout or an account switch.
    this.authSubscription = this.auth.currentUser$.subscribe(() => {
      const identity = this.currentIdentity();
      if (!identity) {
        this.clearContext();
      } else if (this.activeIdentity && this.activeIdentity !== identity) {
        this.activateIdentity(identity);
      } else if (this.activeIdentity === identity) {
        this.ensureRealtimeConnection();
      }
    });
  }

  /**
   * Retrieves one server-filtered page. Concurrent requests for the same user
   * and page share one HTTP call, while stale responses are ignored.
   */
  load(options: LoadOptions = {}): Observable<NotificationPage> {
    const identity = this.currentIdentity();
    if (!identity) {
      this.clearContext();
      return of({ notifications: [], pagination: INITIAL_PAGINATION, unreadCount: 0 });
    }

    this.activateIdentity(identity);
    this.ensureRealtimeConnection();

    const page = Math.max(1, Math.floor(options.page || 1));
    const append = Boolean(options.append);
    const requestKey = `${identity}:page:${page}`;
    const activeRequest = this.inFlightRequests.get(requestKey);
    if (activeRequest && !options.force) {
      return activeRequest;
    }

    const requestVersion = (this.requestVersions.get(requestKey) || 0) + 1;
    this.requestVersions.set(requestKey, requestVersion);

    let request$: Observable<NotificationPage>;
    request$ = this.api.get<NotificationListResponse>(`/notifications?page=${page}&limit=${INITIAL_PAGINATION.limit}`).pipe(
      map((response) => this.toPage(response, page)),
      tap((result) => {
        if (this.isCurrentRequest(identity, requestKey, requestVersion)) {
          this.applyPage(result, append);
        }
      }),
      finalize(() => {
        if (this.inFlightRequests.get(requestKey) === request$) {
          this.inFlightRequests.delete(requestKey);
        }
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.inFlightRequests.set(requestKey, request$);
    return request$;
  }

  loadNextPage(): Observable<NotificationPage> {
    const pagination = this.paginationSubject.value;
    if (pagination.page >= pagination.pages) {
      return of({
        notifications: this.notificationsSubject.value,
        pagination,
        unreadCount: this.serverUnreadCount
      });
    }

    return this.load({ page: pagination.page + 1, append: true });
  }

  /** Refreshes the first page every 30 seconds while the dashboard header is mounted. */
  startPolling(intervalMs = 30000): void {
    const identity = this.currentIdentity();
    if (!identity) {
      return;
    }

    this.activateIdentity(identity);
    this.ensureRealtimeConnection();
    if (this.pollingIdentity === identity && this.pollingSubscription && !this.pollingSubscription.closed) {
      return;
    }

    this.stopPolling();
    this.pollingIdentity = identity;
    this.pollingSubscription = timer(intervalMs, intervalMs).pipe(
      // Do not replace a multi-page list while a user is browsing older items.
      exhaustMap(() => this.paginationSubject.value.page === 1
        ? this.load().pipe(catchError(() => EMPTY))
        : EMPTY)
    ).subscribe();
  }

  stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = undefined;
    this.pollingIdentity = null;
  }

  create(payload: CreateNotificationPayload): Observable<NotificationItem> {
    return this.api.post<NotificationMutationResponse>('/notifications', payload).pipe(
      map((response) => {
        const notification = this.responseNotification(response);
        if (!notification) {
          throw new Error('The server did not return the new notification.');
        }
        return notification;
      })
    );
  }

  update(notificationId: string, payload: UpdateNotificationPayload): Observable<NotificationItem> {
    return this.api.patch<NotificationMutationResponse>(`/notifications/${notificationId}`, payload).pipe(
      map((response) => {
        const notification = this.responseNotification(response);
        if (!notification) {
          throw new Error('The server did not return the updated notification.');
        }
        return notification;
      }),
      tap((notification) => this.upsertLoadedNotification(notification))
    );
  }

  delete(notificationId: string): Observable<void> {
    return this.api.delete<void>(`/notifications/${notificationId}`).pipe(
      tap(() => this.removeLoadedNotification(notificationId))
    );
  }

  /** Persists a read receipt for the signed-in user. */
  markAsRead(notificationId: string): Observable<void> {
    const identity = this.currentIdentity();
    if (!identity || !notificationId) {
      return of(void 0);
    }

    this.activateIdentity(identity);
    const requestKey = `${identity}:${notificationId}`;
    const activeRequest = this.readRequests.get(requestKey);
    if (activeRequest) {
      return activeRequest;
    }

    const current = this.findLoadedNotification(notificationId);
    if (current?.isRead) {
      return of(void 0);
    }

    const previousReadState = current?.isRead ?? null;
    const previousServerUnreadCount = this.serverUnreadCount;
    const version = this.bumpReadStateVersion(identity, notificationId);
    this.setLoadedReadState(notificationId, true);
    if (previousReadState === false && this.serverUnreadCount !== null) {
      this.serverUnreadCount = Math.max(this.serverUnreadCount - 1, 0);
    }
    const optimisticServerUnreadCount = this.serverUnreadCount;
    this.updateUnreadCount();

    let request$: Observable<void>;
    request$ = this.api.patch<NotificationMutationResponse>(`/notifications/${notificationId}/read`, {}).pipe(
      tap((response) => {
        if (this.activeIdentity !== identity || this.currentIdentity() !== identity) {
          return;
        }

        const notification = this.responseNotification(response);
        if (notification) {
          // A read endpoint must not turn an optimistic read back into unread.
          this.upsertLoadedNotification({ ...notification, isRead: true });
        }
        this.applyServerUnreadCount(this.responseUnreadCount(response));
        this.updateUnreadCount();
      }),
      map(() => void 0),
      catchError((error: unknown) => {
        if (this.activeIdentity === identity
          && this.currentIdentity() === identity
          && this.isReadStateCurrent(identity, notificationId, version)) {
          if (previousReadState !== null) {
            this.setLoadedReadState(notificationId, previousReadState);
          }
          if (this.serverUnreadCount === optimisticServerUnreadCount) {
            this.serverUnreadCount = previousServerUnreadCount;
          }
          this.updateUnreadCount();
        }
        return throwError(() => error);
      }),
      finalize(() => {
        if (this.readRequests.get(requestKey) === request$) {
          this.readRequests.delete(requestKey);
        }
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.readRequests.set(requestKey, request$);
    return request$;
  }

  /** Marks every notification visible to the current user as read on the server. */
  markAllAsRead(): Observable<void> {
    const identity = this.currentIdentity();
    if (!identity) {
      return of(void 0);
    }

    this.activateIdentity(identity);
    const previousServerUnreadCount = this.serverUnreadCount;
    const previousStates = this.notificationsSubject.value
      .map((notification) => ({ id: this.notificationId(notification), isRead: notification.isRead }))
      .filter((state): state is { id: string; isRead: boolean } => Boolean(state.id) && !state.isRead);
    const stateVersions = new Map<string, number>();

    previousStates.forEach(({ id }) => {
      stateVersions.set(id, this.bumpReadStateVersion(identity, id));
      this.setLoadedReadState(id, true);
    });
    this.serverUnreadCount = 0;
    this.updateUnreadCount();

    return this.api.patch<NotificationMutationResponse>('/notifications/read-all', {}).pipe(
      tap((response) => {
        if (this.activeIdentity !== identity || this.currentIdentity() !== identity) {
          return;
        }

        // The endpoint may return the remaining unread count. It should be
        // zero after a successful full mark-all, but trust an explicit server value.
        this.applyServerUnreadCount(this.responseUnreadCount(response), 0);
        this.updateUnreadCount();
      }),
      map(() => void 0),
      catchError((error: unknown) => {
        if (this.activeIdentity === identity && this.currentIdentity() === identity) {
          previousStates.forEach(({ id, isRead }) => {
            const version = stateVersions.get(id);
            if (version !== undefined && this.isReadStateCurrent(identity, id, version)) {
              this.setLoadedReadState(id, isRead);
            }
          });
          if (this.serverUnreadCount === 0) {
            this.serverUnreadCount = previousServerUnreadCount;
          }
          this.updateUnreadCount();
        }
        return throwError(() => error);
      })
    );
  }

  isRead(notification: NotificationItem): boolean {
    return notification.isRead;
  }

  private applyPage(result: NotificationPage, append: boolean): void {
    const incoming = this.keepOptimisticReadStates(result.notifications);
    const notifications = append
      ? this.mergeNotifications(this.notificationsSubject.value, incoming)
      : incoming;

    this.notificationsSubject.next(notifications);
    this.paginationSubject.next(result.pagination);
    if (!append || result.unreadCount !== null) {
      this.serverUnreadCount = result.unreadCount;
    }
    this.updateUnreadCount();
  }

  private keepOptimisticReadStates(incoming: NotificationItem[]): NotificationItem[] {
    return incoming.map((notification) => {
      const notificationId = this.notificationId(notification);
      if (!notificationId || !this.hasPendingReadRequest(notificationId)) {
        return notification;
      }

      const local = this.findLoadedNotification(notificationId);
      return local ? { ...notification, isRead: local.isRead, readAt: local.readAt } : notification;
    });
  }

  private mergeNotifications(current: NotificationItem[], next: NotificationItem[]): NotificationItem[] {
    const knownIds = new Set(current.map((notification) => this.notificationId(notification)).filter(Boolean));
    return [
      ...current,
      ...next.filter((notification) => {
        const notificationId = this.notificationId(notification);
        return !notificationId || !knownIds.has(notificationId);
      })
    ];
  }

  private removeLoadedNotification(notificationId: string): void {
    const removed = this.findLoadedNotification(notificationId);
    if (!removed) {
      return;
    }

    this.notificationsSubject.next(
      this.notificationsSubject.value.filter((notification) => this.notificationId(notification) !== notificationId)
    );
    const pagination = this.paginationSubject.value;
    this.paginationSubject.next({
      ...pagination,
      total: Math.max(pagination.total - 1, 0),
      pages: Math.max(Math.ceil(Math.max(pagination.total - 1, 0) / pagination.limit), 1)
    });
    if (!removed.isRead && this.serverUnreadCount !== null) {
      this.serverUnreadCount = Math.max(this.serverUnreadCount - 1, 0);
    }
    this.updateUnreadCount();
  }

  private findLoadedNotification(notificationId: string): NotificationItem | undefined {
    return this.notificationsSubject.value.find((notification) => this.notificationId(notification) === notificationId);
  }

  private setLoadedReadState(notificationId: string, isRead: boolean): void {
    this.notificationsSubject.next(
      this.notificationsSubject.value.map((notification) => this.notificationId(notification) === notificationId
        ? { ...notification, isRead }
        : notification)
    );
  }

  private upsertLoadedNotification(notification: NotificationItem): void {
    const notificationId = this.notificationId(notification);
    if (!notificationId) {
      return;
    }

    let updated = false;
    const notifications = this.notificationsSubject.value.map((current) => {
      if (this.notificationId(current) !== notificationId) {
        return current;
      }
      updated = true;
      return notification;
    });
    if (updated) {
      this.notificationsSubject.next(notifications);
    }
  }

  private updateUnreadCount(): void {
    const identity = this.currentIdentity();
    if (!identity || identity !== this.activeIdentity) {
      this.unreadCountSubject.next(0);
      return;
    }

    const unreadCount = this.serverUnreadCount ?? this.notificationsSubject.value
      .filter((notification) => !notification.isRead)
      .length;
    this.unreadCountSubject.next(unreadCount);
  }

  private isCurrentRequest(identity: string, requestKey: string, requestVersion: number): boolean {
    return this.activeIdentity === identity
      && this.currentIdentity() === identity
      && this.requestVersions.get(requestKey) === requestVersion;
  }

  private activateIdentity(identity: string): void {
    if (this.activeIdentity === identity) {
      return;
    }

    this.disconnectRealtime();
    this.activeIdentity = identity;
    this.serverUnreadCount = null;
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
    this.paginationSubject.next(INITIAL_PAGINATION);

    if (this.pollingIdentity && this.pollingIdentity !== identity) {
      this.stopPolling();
    }
  }

  private clearContext(): void {
    this.disconnectRealtime();
    this.activeIdentity = null;
    this.serverUnreadCount = null;
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
    this.paginationSubject.next(INITIAL_PAGINATION);
    this.stopPolling();
  }

  private currentIdentity(): string | null {
    const user = this.auth.getCurrentUser();
    if (!user) {
      return null;
    }

    const userIdentifier = user._id || user.phone || user.email || user.name;
    return `${userIdentifier}:${user.role}`;
  }

  /**
   * Keeps a private, authenticated Socket.IO connection while a user is using
   * the dashboard. Socket messages are intentionally treated as an invalidation
   * signal only: REST remains the authority for visibility and read receipts.
   */
  private ensureRealtimeConnection(): void {
    const identity = this.currentIdentity();
    const token = this.auth.token;
    if (!identity || identity !== this.activeIdentity || !token) {
      this.disconnectRealtime();
      return;
    }

    if (this.realtimeSocket
      && this.socketIdentity === identity
      && this.socketToken === token) {
      return;
    }

    this.disconnectRealtime();

    const socket = io(this.socketOrigin(), {
      autoConnect: false,
      auth: { token },
      reconnection: true,
    });

    // Do not consume notification payloads here. The socket audience is
    // server-scoped, but a fresh REST response is still required to obtain the
    // current user's DTO and isRead state without trusting client-side events.
    const refresh = () => this.queueRealtimeRefresh(identity);
    socket.on('notification:created', refresh);
    socket.on('notification:updated', refresh);
    socket.on('notification:deleted', refresh);
    socket.on('notification:read', refresh);
    socket.on('notifications:read-all', refresh);

    this.realtimeSocket = socket;
    this.socketIdentity = identity;
    this.socketToken = token;
    socket.connect();
  }

  private disconnectRealtime(): void {
    this.realtimeRefreshSubscription?.unsubscribe();
    this.realtimeRefreshSubscription = undefined;
    this.realtimeRefreshQueued = false;
    this.realtimeEventRevision += 1;

    const socket = this.realtimeSocket;
    this.realtimeSocket = undefined;
    this.socketIdentity = null;
    this.socketToken = null;

    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }
  }

  private queueRealtimeRefresh(identity: string): void {
    if (this.activeIdentity !== identity || this.currentIdentity() !== identity) {
      return;
    }

    this.realtimeEventRevision += 1;
    if (this.paginationSubject.value.page > 1) {
      // Keep the page a user is currently reading stable. The next first-page
      // refresh (manual or navigation-driven) will obtain the latest state.
      return;
    }

    this.scheduleRealtimeRefresh(identity);
  }

  private scheduleRealtimeRefresh(identity: string): void {
    if (this.realtimeRefreshQueued) {
      return;
    }

    this.realtimeRefreshQueued = true;
    const requestedRevision = this.realtimeEventRevision;
    let refreshSubscription: Subscription;

    refreshSubscription = timer(75).pipe(
      exhaustMap(() => {
        if (this.activeIdentity !== identity || this.currentIdentity() !== identity) {
          return EMPTY;
        }

        if (this.paginationSubject.value.page > 1) {
          return EMPTY;
        }

        // Force a new request so an event that arrived during an earlier load
        // cannot be hidden by a shared in-flight observable.
        return this.load({ force: true }).pipe(catchError(() => EMPTY));
      })
    ).subscribe({
      complete: () => {
        if (this.realtimeRefreshSubscription !== refreshSubscription) {
          return;
        }

        this.realtimeRefreshSubscription = undefined;
        this.realtimeRefreshQueued = false;
        if (this.activeIdentity === identity
          && this.currentIdentity() === identity
          && this.paginationSubject.value.page === 1
          && this.realtimeEventRevision > requestedRevision) {
          this.scheduleRealtimeRefresh(identity);
        }
      }
    });

    this.realtimeRefreshSubscription = refreshSubscription;
  }

  private socketOrigin(): string {
    try {
      return new URL(this.api.root).origin;
    } catch {
      return `http://${window.location.hostname || 'localhost'}:3000`;
    }
  }

  private notificationId(notification: NotificationItem): string | null {
    return notification._id || notification.id || null;
  }

  private hasPendingReadRequest(notificationId: string): boolean {
    const identity = this.currentIdentity();
    return Boolean(identity && this.readRequests.has(`${identity}:${notificationId}`));
  }

  private bumpReadStateVersion(identity: string, notificationId: string): number {
    const key = `${identity}:${notificationId}`;
    const version = (this.readStateVersions.get(key) || 0) + 1;
    this.readStateVersions.set(key, version);
    return version;
  }

  private isReadStateCurrent(identity: string, notificationId: string, version: number): boolean {
    return this.readStateVersions.get(`${identity}:${notificationId}`) === version;
  }

  private toPage(response: NotificationListResponse, fallbackPage: number): NotificationPage {
    const rawNotifications = response.data?.notifications;
    const notifications = Array.isArray(rawNotifications)
      ? rawNotifications
        .filter((item): item is Record<string, unknown> => this.isRecord(item))
        .map((item) => this.toNotification(item))
        .filter((item): item is NotificationItem => item !== null)
      : [];

    const total = this.positiveInteger(response.pagination?.total, notifications.length);
    const limit = this.positiveInteger(response.pagination?.limit, INITIAL_PAGINATION.limit);
    const pages = this.positiveInteger(response.pagination?.pages, Math.max(Math.ceil(total / limit), 1));
    const page = this.positiveInteger(response.pagination?.page, fallbackPage);

    return {
      notifications,
      pagination: { total, limit, pages, page },
      unreadCount: this.responseUnreadCount(response)
    };
  }

  private responseNotification(response: NotificationMutationResponse): NotificationItem | null {
    const notification = response.data?.notification;
    return this.isRecord(notification) ? this.toNotification(notification) : null;
  }

  private responseUnreadCount(response: NotificationListResponse | NotificationMutationResponse): number | null {
    return this.nonNegativeInteger(
      response.data?.unreadCount
      ?? response.data?.unread
      ?? response.pagination?.unreadCount
      ?? response.pagination?.unread
    );
  }

  private applyServerUnreadCount(value: number | null, fallback?: number): void {
    if (value !== null) {
      this.serverUnreadCount = value;
    } else if (fallback !== undefined) {
      this.serverUnreadCount = fallback;
    }
  }

  private positiveInteger(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback;
  }

  private nonNegativeInteger(value: unknown): number | null {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
  }

  private toNotification(source: Record<string, unknown>): NotificationItem | null {
    const title = source['title'];
    const body = source['body'];
    if (typeof title !== 'string' || typeof body !== 'string') {
      return null;
    }

    const type = source['type'];
    const targetRole = source['targetRole'];
    const notificationType: NotificationType =
      type === 'payment' || type === 'exam' || type === 'attendance' ? type : 'announcement';
    const audience: NotificationAudience = this.isAudience(targetRole) ? targetRole : 'all';

    return {
      _id: typeof source['_id'] === 'string' ? source['_id'] : undefined,
      id: typeof source['id'] === 'string' ? source['id'] : undefined,
      title,
      body,
      type: notificationType,
      targetRole: audience,
      isRead: source['isRead'] === true,
      readAt: typeof source['readAt'] === 'string' ? source['readAt'] : undefined,
      createdAt: typeof source['createdAt'] === 'string' ? source['createdAt'] : undefined,
      updatedAt: typeof source['updatedAt'] === 'string' ? source['updatedAt'] : undefined
    };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private isAudience(value: unknown): value is NotificationAudience {
    return value === 'all'
      || value === 'admin'
      || value === 'teacher'
      || value === 'secretary'
      || value === 'student'
      || value === 'parent'
      || value === 'direct'
      || value === 'teachers'
      || value === 'students'
      || value === 'parents';
  }
}
