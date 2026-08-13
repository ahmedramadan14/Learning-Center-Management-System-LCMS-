import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';

import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from './notification.service';

interface TestUser {
  _id: string;
  name: string;
  role: 'student';
}

describe('NotificationService', () => {
  let service: NotificationService;
  let api: jasmine.SpyObj<ApiService>;
  let currentUser: TestUser | null;
  let currentUserSubject: BehaviorSubject<TestUser | null>;

  beforeEach(() => {
    currentUser = { _id: 'student-1', name: 'Student', role: 'student' };
    currentUserSubject = new BehaviorSubject<TestUser | null>(currentUser);
    api = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post', 'patch', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: ApiService, useValue: api },
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => currentUser,
            currentUser$: currentUserSubject.asObservable(),
            token: null
          }
        }
      ]
    });

    service = TestBed.inject(NotificationService);
    localStorage.clear();
  });

  it('uses the paginated, server-filtered notifications endpoint', () => {
    api.get.and.returnValue(of({
      data: {
        notifications: [{
          _id: 'notification-1',
          title: 'Exam reminder',
          body: 'Your exam is tomorrow.',
          type: 'exam',
          targetRole: 'student'
        }]
      },
      pagination: { total: 41, page: 1, limit: 20, pages: 3 }
    }));

    service.load().subscribe((page) => {
      expect(page.notifications.length).toBe(1);
      expect(page.pagination.total).toBe(41);
      expect(page.pagination.pages).toBe(3);
    });

    expect(api.get).toHaveBeenCalledWith('/notifications?page=1&limit=20');
  });

  it('updates only notification content through the admin edit endpoint', () => {
    const payload = {
      title: 'Updated exam reminder',
      body: 'The exam has moved to Thursday.',
      type: 'exam' as const
    };
    api.patch.and.returnValue(of({
      data: {
        notification: {
          _id: 'notification-1',
          ...payload,
          targetRole: 'student',
          isRead: true
        }
      }
    }));

    service.update('notification-1', payload).subscribe((notification) => {
      expect(notification.title).toBe(payload.title);
      expect(notification.body).toBe(payload.body);
    });

    expect(api.patch).toHaveBeenCalledWith('/notifications/notification-1', payload);
  });

  it('keeps read state isolated to the signed-in user', () => {
    api.get.and.returnValue(of({
      data: {
        notifications: [{
          _id: 'notification-1',
          title: 'Exam reminder',
          body: 'Your exam is tomorrow.',
          type: 'exam',
          targetRole: 'student'
        }]
      },
      pagination: { total: 1, page: 1, limit: 20, pages: 1 }
    }));

    service.load().subscribe();
    api.patch.and.returnValue(of({ data: { unreadCount: 0 } }));
    service.markAsRead('notification-1').subscribe();

    let unreadCount = -1;
    service.unreadCount$.subscribe((count) => { unreadCount = count; });
    expect(unreadCount).toBe(0);

    currentUser = { _id: 'student-2', name: 'Another Student', role: 'student' };
    currentUserSubject.next(currentUser);
    service.load().subscribe();
    expect(unreadCount).toBe(1);
  });
});
