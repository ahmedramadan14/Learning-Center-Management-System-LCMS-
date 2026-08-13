import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../../services/auth/auth.service';

interface Child {
  name: string;
  code: string;
}

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  currentUser: User | null = null;

  // إحصائيات النظام العامة
  stats = {
    totalStudents: 1248,
    totalRevenue: 'EGP 45,200',
    activeCourses: 28,
    todaysClasses: 14,
    pendingAttendance: 3
  };

  // بيانات أبناء ولي الأمر
  children: Child[] = [
    { name: 'Mazen Ahmed', code: 'STU-1024' }
  ];

  // متغيّرات modal ربط الابن
  isAddChildModalOpen = false;
  studentCodeInput = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  get userRole(): string {
    return this.currentUser?.role?.toLowerCase() || '';
  }

  get isStudent(): boolean {
    return this.userRole === 'student';
  }

  get isParent(): boolean {
    return this.userRole === 'parent';
  }

  get isTeacherOrAdmin(): boolean {
    return this.userRole === 'teacher' || this.userRole === 'admin';
  }

  get isStaff(): boolean {
    return ['admin', 'teacher', 'secretary'].includes(this.userRole);
  }

  get canTakeAttendance(): boolean {
    return ['admin', 'teacher', 'secretary'].includes(this.userRole);
  }

  // دوال الـ Add Child Modal
  openAddChildModal(): void {
    this.isAddChildModalOpen = true;
    this.studentCodeInput = '';
  }

  closeAddChildModal(): void {
    this.isAddChildModalOpen = false;
  }

  addChildByCode(): void {
    if (!this.studentCodeInput.trim()) return;

    this.children.push({
      name: 'New Student',
      code: this.studentCodeInput.toUpperCase()
    });

    this.closeAddChildModal();
  }
}