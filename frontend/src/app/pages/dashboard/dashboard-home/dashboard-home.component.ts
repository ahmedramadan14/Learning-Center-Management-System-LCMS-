import { Component, OnInit } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { ApiService } from '../../../services/api/api.service';

@Component({ selector: 'app-dashboard-home', templateUrl: './dashboard-home.component.html', styleUrls: ['./dashboard-home.component.css'] })
export class DashboardHomeComponent implements OnInit {
  loading = true;
  stats = [
    { label: 'Total Students', value: 0, icon: 'bi-people', tone: 'blue', path: '/dashboard/students' },
    { label: 'teachers', value: 0, icon: 'bi-person-workspace', tone: 'green', path: '/dashboard/teachers' },
    { label: 'Courses', value: 0, icon: 'bi-journal-bookmark', tone: 'orange', path: '/dashboard/courses' },
    { label: 'Classes', value: 0, icon: 'bi-easel2', tone: 'purple', path: '/dashboard/classes' },
    { label: 'Exams', value: 0, icon: 'bi-clipboard2-check', tone: 'pink', path: '/dashboard/exams' },
    { label: 'Payments', value: 0, icon: 'bi-credit-card', tone: 'cyan', path: '/dashboard/payments' }
  ];
  recentStudents: Record<string, unknown>[] = [];
  constructor(private readonly api: ApiService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    const list = (path: string) => this.api.list(path).pipe(catchError(() => of([])));
    forkJoin({ students: list('/students'), teachers: list('/teachers'), courses: list('/courses'), classes: list('/groups'), exams: list('/exams'), payments: list('/payments') }).subscribe((data) => {
      const counts = [data.students.length, data.teachers.length, data.courses.length, data.classes.length, data.exams.length, data.payments.length];
      this.stats = this.stats.map((stat, index) => ({ ...stat, value: counts[index] })); this.recentStudents = data.students.slice(0, 6); this.loading = false;
    });
  }
  name(row: Record<string, unknown>): string { const user = row['userId']; return user && typeof user === 'object' ? String((user as Record<string, unknown>)['name'] || 'Student') : 'Student'; }
  phone(row: Record<string, unknown>): string { const user = row['userId']; return user && typeof user === 'object' ? String((user as Record<string, unknown>)['phone'] || '-') : '-'; }
}
