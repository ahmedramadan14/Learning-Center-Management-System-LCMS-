import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';

import { HeaderComponent } from './header.component';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notifications/notification.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  const unreadCount$ = new BehaviorSubject<number>(0);
  const currentUser$ = new BehaviorSubject({ name: 'Test User', role: 'admin' as const });

  beforeEach(() => {
    unreadCount$.next(0);
    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [CommonModule, FormsModule, RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => currentUser$.value,
            currentUser$: currentUser$.asObservable(),
            logoutFromServer: () => of(void 0)
          }
        },
        {
          provide: NotificationService,
          useValue: {
            unreadCount$: unreadCount$.asObservable(),
            load: () => of([]),
            startPolling: () => undefined,
            stopPolling: () => undefined
          }
        }
      ]
    });
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the unread notification count', () => {
    unreadCount$.next(3);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.notification-badge');
    expect(badge.textContent.trim()).toBe('3');
  });
});
