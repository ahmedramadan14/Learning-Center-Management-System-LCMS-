import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, CurrentUser } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notifications/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() menuToggled = new EventEmitter<void>();

  searchText = '';

  userName = 'User';
  userRole = '';
  currentUser: CurrentUser | null = null;
  isProfileModalOpen = false;
  unreadCount = 0;
  loggingOut = false;
  private notificationSubscription?: Subscription;
  private userSubscription?: Subscription;

  constructor(
    private readonly auth: AuthService,
    private readonly notifications: NotificationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.auth.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.userName = user?.name || 'User';
      this.userRole = user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';
    });

    this.notificationSubscription = this.notifications.unreadCount$.subscribe((count) => {
      this.unreadCount = count;
    });

    this.notifications.load().subscribe({ error: () => undefined });
    this.notifications.startPolling();
  }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
    this.notifications.stopPolling();
  }

  logout(): void {
    if (this.loggingOut) {
      return;
    }

    this.loggingOut = true;
    this.notifications.stopPolling();
    this.auth.logoutFromServer().subscribe({
      next: () => {
        this.loggingOut = false;
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }

  toggleMenu(): void {
    this.menuToggled.emit();
  }

  openProfileModal(): void {
    this.isProfileModalOpen = true;
  }

  closeProfileModal(): void {
    this.isProfileModalOpen = false;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';
  }

  get userInitials(): string {
    return this.getInitials(this.userName);
  }
}
