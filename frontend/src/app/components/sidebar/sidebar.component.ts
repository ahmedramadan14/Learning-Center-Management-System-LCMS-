import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({ selector: 'app-sidebar', templateUrl: './sidebar.component.html', styleUrls: ['./sidebar.component.css'] })
export class SidebarComponent {
  @Input() open = true;
  @Output() closeRequested = new EventEmitter<void>();
  readonly navigation = [
    { label: 'Dashboard', icon: 'bi-grid-1x2', path: '/dashboard' },
    { label: 'Students', icon: 'bi-people', path: '/dashboard/students' },
    { label: 'Teachers', icon: 'bi-person-workspace', path: '/dashboard/teachers' },
    { label: 'Courses', icon: 'bi-journal-bookmark', path: '/dashboard/courses' },
    { label: 'Classes', icon: 'bi-easel2', path: '/dashboard/classes' },
    { label: 'Exams', icon: 'bi-clipboard2-check', path: '/dashboard/exams' },
    { label: 'Attendance', icon: 'bi-calendar2-check', path: '/dashboard/attendance' },
    { label: 'Payments', icon: 'bi-credit-card', path: '/dashboard/payments' },
    { label: 'Messages', icon: 'bi-chat-left-text', path: '/dashboard/messages' },
    { label: 'Profile', icon: 'bi-person-circle', path: '/dashboard/profile' }
  ];
  constructor(private readonly auth: AuthService, private readonly router: Router) {}
  logout(): void { this.auth.logout().subscribe({ next: () => this.router.navigate(['/login']), error: () => { this.auth.clearSession(); this.router.navigate(['/login']); } }); }
  closeOnMobile(): void { if (window.innerWidth <= 920) this.closeRequested.emit(); }
}
