<<<<<<< HEAD
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarComponent]
    });
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
=======
import { Component, OnInit } from '@angular/core';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  // قائمة الإدارة الرئيسية (MANAGEMENT)
  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '📊' },
    { label: 'Students', route: '/dashboard/students', icon: '👨‍🎓' },
    { label: 'Teachers', route: '/dashboard/teachers', icon: '👨‍🏫' },
    { label: 'Parents', route: '/dashboard/parents', icon: '👨‍👩‍👧' },
    { label: 'Classes', route: '/dashboard/classes', icon: '🏫' },
    { label: 'Schedule', route: '/dashboard/schedule', icon: '📅' },
    { label: 'Courses', route: '/dashboard/courses', icon: '📚' },
    { label: 'Attendance', route: '/dashboard/attendance', icon: '📋' },
    { label: 'Exams', route: '/dashboard/exams', icon: '📝' },
    { label: 'Results', route: '/dashboard/results', icon: '📈' },
    { label: 'Payments', route: '/dashboard/payments', icon: '💳' }
  ];

  // قائمة الإدارة المتقدمة (ADMINISTRATION)
  administrationItems: MenuItem[] = [
    { label: 'Secretaries', route: '/dashboard/secretaries', icon: '👤' }
  ];

  // قائمة إعدادات النظام (SYSTEM)
  systemItems: MenuItem[] = [
    { label: 'Settings', route: '/dashboard/settings', icon: '⚙️' }
  ];

  constructor() { }

  ngOnInit(): void { }
}
>>>>>>> origin/ahmed
