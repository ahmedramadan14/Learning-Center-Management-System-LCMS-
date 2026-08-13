import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { NotificationsComponent } from './notifications.component';
import { AccessControlService } from '../../../services/auth/access-control.service';
import { NotificationItem, NotificationService } from '../../../services/notifications/notification.service';

const notification: NotificationItem = {
  _id: 'notification-1',
  title: 'Schedule update',
  body: 'Tomorrow\'s class starts at 10 AM.',
  type: 'announcement',
  targetRole: 'student',
  isRead: true,
  createdAt: '2026-08-13T10:00:00.000Z'
};

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationsComponent],
      imports: [FormsModule],
      providers: [
        {
          provide: AccessControlService,
          useValue: {
            currentRole: 'student',
            can: () => false
          }
        },
        {
          provide: NotificationService,
          useValue: {
            notifications$: of([notification]),
            unreadCount$: of(0),
            pagination$: of({ total: 1, page: 1, limit: 20, pages: 1 }),
            load: () => of([]),
            isRead: () => true,
            markAsRead: () => of(void 0),
            markAllAsRead: () => of(void 0)
          }
        }
      ]
    });

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates a read-only notifications page for a student', () => {
    expect(component).toBeTruthy();
    expect(component.canCreate).toBeFalse();
    expect(component.canDelete).toBeFalse();
  });

  it('renders loaded notification cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('.notification-card');

    expect(cards.length).toBe(1);
    expect(cards[0].textContent).toContain(notification.title);
  });
});
