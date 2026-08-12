import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  userRole: string = '';
  currentUser: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        
        const rawRole = this.currentUser?.role || this.currentUser?.type || '';
        this.userRole = rawRole.toString().trim().toLowerCase();
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      this.userRole = '';
    }
  }

  addStudent(): void {
    this.router.navigate(['/dashboard/students']);
  }

  addTeacher(): void {
    this.router.navigate(['/dashboard/teachers']);
  }
  takeAttendance(): void {
    this.router.navigate(['/dashboard/attendance']);
  }

  recordPayment(): void {
    this.router.navigate(['/dashboard/payments']);
  }
}