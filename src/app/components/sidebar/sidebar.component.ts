import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  link: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'fa-solid fa-house', link: '/dashboard', roles: ['admin', 'secretary', 'teacher', 'student', 'parent'] },
    
    // Management
    { label: 'Students', icon: 'fa-solid fa-user-graduate', link: '/dashboard/students', roles: ['admin', 'secretary', 'teacher'] },
    { label: 'Teachers', icon: 'fa-solid fa-chalkboard-user', link: '/dashboard/teachers', roles: ['admin', 'secretary'] },
    { label: 'Parents', icon: 'fa-solid fa-users-between-lines', link: '/dashboard/parents', roles: ['admin', 'secretary'] },
    { label: 'Classes', icon: 'fa-solid fa-layer-group', link: '/dashboard/classes', roles: ['admin', 'secretary', 'teacher', 'student'] },
    { label: 'Schedule', icon: 'fa-regular fa-calendar-days', link: '/dashboard/schedule', roles: ['admin', 'secretary', 'teacher', 'student', 'parent'] },
    { label: 'Courses', icon: 'fa-solid fa-book-open', link: '/dashboard/courses', roles: ['admin', 'secretary', 'teacher', 'student'] },
    { label: 'Attendance', icon: 'fa-solid fa-check-double', link: '/dashboard/attendance', roles: ['admin', 'secretary', 'teacher', 'student', 'parent'] },
    { label: 'Exams', icon: 'fa-regular fa-file-lines', link: '/dashboard/exams', roles: ['admin', 'secretary', 'teacher', 'student'] },
    { label: 'Results', icon: 'fa-solid fa-chart-column', link: '/dashboard/results', roles: ['admin', 'secretary', 'teacher', 'student', 'parent'] },
    { label: 'Payments', icon: 'fa-solid fa-credit-card', link: '/dashboard/payments', roles: ['admin', 'secretary', 'parent', 'student', 'teacher'] },

    // Administration
    { label: 'Secretaries', icon: 'fa-solid fa-user-gear', link: '/dashboard/secretaries', roles: ['admin'] },
    
    // System
    { label: 'Settings', icon: 'fa-solid fa-gear', link: '/dashboard/settings', roles: ['admin', 'secretary'] }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  hasAccess(allowedRoles: string[]): boolean {
    if (!this.currentUser) return false;
    return allowedRoles.includes(this.currentUser.role.toLowerCase());
  }
}