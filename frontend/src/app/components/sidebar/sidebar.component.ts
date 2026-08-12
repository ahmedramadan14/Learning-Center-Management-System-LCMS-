import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  menuItems = [
    { label: 'Dashboard', icon: '⌂', route: '/dashboard' },
    { label: 'Students', icon: '♙', route: '/dashboard/students' },
    { label: 'Teachers', icon: '♟', route: '/dashboard/teachers' },
    { label: 'Parents', icon: '♧', route: '/dashboard/parents' },
    { label: 'Classes', icon: '▦', route: '/dashboard/classes' },
    { label: 'Schedule', icon: '📅', route: '/dashboard/schedule' },
    { label: 'Courses', icon: '▤', route: '/dashboard/courses' },
    { label: 'Attendance', icon: '✓', route: '/dashboard/attendance' },
    { label: 'Exams', icon: '▣', route: '/dashboard/exams' },
    { label: 'Results', icon: '📊', route: '/dashboard/results' },
    { label: 'Payments', icon: '$', route: '/dashboard/payments' }
  ];

  administrationItems = [
    { label: 'Secretaries', icon: '♙', route: '/dashboard/secretaries' }
  ];

  systemItems = [
    { label: 'Settings', icon: '⚙', route: '/dashboard/settings' }
  ];

}
