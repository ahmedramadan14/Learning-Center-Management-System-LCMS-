import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AccessControlService, DashboardResource } from '../../services/auth/access-control.service';
import { AuthService } from '../../services/auth/auth.service';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  resource: DashboardResource;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() open = true;
  @Output() closeRequested = new EventEmitter<void>();
  loggingOut = false;

  readonly menuItems: NavigationItem[] = [
    { label: 'Dashboard', icon: 'bi-grid-1x2', route: '/dashboard', resource: 'dashboard' },
    { label: 'Students', icon: 'bi-people', route: '/dashboard/students', resource: 'students' },
    { label: 'Teachers', icon: 'bi-person-workspace', route: '/dashboard/teachers', resource: 'teachers' },
    { label: 'Parents', icon: 'bi-people', route: '/dashboard/parents', resource: 'parents' },
    { label: 'Classes', icon: 'bi-easel2', route: '/dashboard/classes', resource: 'classes' },
    { label: 'Grades', icon: 'bi-bar-chart', route: '/dashboard/grades', resource: 'grades' },
    { label: 'Schedule', icon: 'bi-calendar3', route: '/dashboard/schedule', resource: 'schedule' },
    { label: 'Courses', icon: 'bi-journal-bookmark', route: '/dashboard/courses', resource: 'courses' },
    { label: 'Attendance', icon: 'bi-check2-square', route: '/dashboard/attendance', resource: 'attendance' },
    { label: 'Exams', icon: 'bi-clipboard-check', route: '/dashboard/exams', resource: 'exams' },
    { label: 'Results', icon: 'bi-clipboard-data', route: '/dashboard/results', resource: 'results' },
    { label: 'Payments', icon: 'bi-cash-stack', route: '/dashboard/payments', resource: 'payments' }
  ];

  readonly administrationItems: NavigationItem[] = [
    { label: 'Secretaries', icon: 'bi-person-badge', route: '/dashboard/secretaries', resource: 'secretaries' }
  ];

  readonly systemItems: NavigationItem[] = [
    { label: 'Notifications', icon: 'bi-bell', route: '/dashboard/notifications', resource: 'notifications' },
    { label: 'My profile', icon: 'bi-person-circle', route: '/dashboard/profile', resource: 'profile' },
    { label: 'Settings', icon: 'bi-gear', route: '/dashboard/settings', resource: 'settings' }
  ];

  constructor(
    private readonly access: AccessControlService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  get visibleMenuItems(): NavigationItem[] {
    return this.visibleItems(this.menuItems);
  }

  get visibleAdministrationItems(): NavigationItem[] {
    return this.visibleItems(this.administrationItems);
  }

  get visibleSystemItems(): NavigationItem[] {
    return this.visibleItems(this.systemItems);
  }

  get permissionItems(): string[] {
    return this.access.permissionLabels();
  }

  get roleLabel(): string {
    const role = this.access.currentRole;
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
  }

  logout(): void {
    if (this.loggingOut) {
      return;
    }

    this.loggingOut = true;
    this.auth.logoutFromServer().subscribe({
      next: () => {
        this.loggingOut = false;
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }

  private visibleItems(items: readonly NavigationItem[]): NavigationItem[] {
    return items.filter((item) => this.access.canView(item.resource));
  }
}
